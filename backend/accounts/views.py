import datetime
import logging

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone

from .models import PasswordResetToken
from .serializers import RegisterSerializer, UserSerializer, ChangePasswordSerializer

User = get_user_model()
logger = logging.getLogger(__name__)


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """Login JWT limité pour freiner le brute-force sur les mots de passe."""
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'


class ThrottledTokenRefreshView(TokenRefreshView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Mot de passe modifié avec succès.'}, status=status.HTTP_200_OK)


class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def list(self, request, *args, **kwargs):
        users = self.get_queryset()
        serializer = self.get_serializer(users, many=True)
        counts = User.objects.aggregate(
            total=Count('id'),
            candidates=Count('id', filter=Q(role='candidate')),
            recruiters=Count('id', filter=Q(role='recruiter')),
            admins=Count('id', filter=Q(role='admin')),
        )
        return Response({
            'count': counts['total'],
            'counts': counts,
            'results': serializer.data,
        })


class AdminUserDetailView(APIView):
    """Actions admin sur un utilisateur : activer/désactiver, changer le rôle."""
    permission_classes = [permissions.IsAdminUser]

    def get_object(self, pk):
        from django.shortcuts import get_object_or_404
        return get_object_or_404(User, pk=pk)

    def patch(self, request, pk):
        user = self.get_object(pk)
        allowed_fields = ['is_active', 'role', 'is_verified']
        changed = False
        for field in allowed_fields:
            if field in request.data:
                # Empêcher de retirer ses propres droits admin
                if field == 'role' and user == request.user and request.data[field] != 'admin':
                    return Response(
                        {'detail': 'Vous ne pouvez pas retirer vos propres droits administrateur.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                setattr(user, field, request.data[field])
                changed = True
        if changed:
            user.save()
        return Response(UserSerializer(user).data)


class AdminStatsView(APIView):
    """Agrégats globaux pour le dashboard admin (une seule requête)."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from companies.models import Company
        from jobs.models import JobOffer, JobCategory

        def series(qs, field='created_at'):
            rows = (
                qs.annotate(month=TruncMonth(field))
                .values('month')
                .annotate(count=Count('id'))
                .order_by('month')
            )
            return [{'month': r['month'].strftime('%Y-%m'), 'count': r['count']} for r in rows]

        by_type = {t: 0 for t, _ in JobOffer.JOB_TYPE_CHOICES}
        by_type.update(
            JobOffer.objects.values('job_type').annotate(count=Count('id')).values_list('job_type', 'count')
        )

        by_role = {r: 0 for r, _ in User.ROLE_CHOICES}
        by_role.update(User.objects.values('role').annotate(count=Count('id')).values_list('role', 'count'))

        return Response({
            'jobs': {
                'total': JobOffer.objects.count(),
                'by_type': by_type,
                'per_month': series(JobOffer.objects.all()),
            },
            'companies': {'total': Company.objects.count()},
            'categories': JobCategory.objects.count(),
            'users': {
                'total': User.objects.count(),
                'by_role': by_role,
                'per_month': series(User.objects.all()),
            },
        })


class PasswordResetRequestView(APIView):
    """Demande un reset de mot de passe — génère un token et envoie un email."""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        # Toujours renvoyer 200 pour ne pas divulguer l'existence du compte
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'Si cet email existe, un lien a été envoyé.'})

        # Invalider les éventuels tokens précédents non utilisés
        PasswordResetToken.objects.filter(user=user, used=False).update(used=True)

        token = PasswordResetToken.objects.create(user=user)
        reset_url = (
            f"{settings.FRONTEND_URL}/reinitialiser-mot-de-passe"
            f"?uid={user.pk}&token={token.token}"
        )

        try:
            send_mail(
                subject='Job237 — Réinitialisation de votre mot de passe',
                message=(
                    f"Bonjour {user.first_name},\n\n"
                    "Vous avez demandé la réinitialisation de votre mot de passe.\n\n"
                    f"Cliquez sur le lien suivant : {reset_url}\n\n"
                    "Ce lien est valable 1 heure. Si vous n'êtes pas à l'origine de cette "
                    "demande, ignorez simplement cet email.\n\n"
                    "L'équipe Job237"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )
        except Exception:
            # Ne pas faire échouer la requête ni divulguer l'existence du compte
            logger.exception("Échec de l'envoi de l'email de réinitialisation pour %s", user.email)

        return Response({'detail': 'Si cet email existe, un lien a été envoyé.'})


class PasswordResetConfirmView(APIView):
    """Confirme le reset avec le token et définit le nouveau mot de passe."""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        uid = request.data.get('uid')
        token_str = request.data.get('token')
        new_password = request.data.get('new_password', '')

        if not all([uid, token_str, new_password]):
            return Response({'detail': 'Données incomplètes.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'detail': 'Le mot de passe doit faire au moins 8 caractères.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token_obj = PasswordResetToken.objects.get(token=token_str, user_id=uid, used=False)
        except PasswordResetToken.DoesNotExist:
            return Response({'detail': 'Token invalide ou expiré.'}, status=status.HTTP_400_BAD_REQUEST)

        # Expire après 1 heure
        if timezone.now() - token_obj.created_at > datetime.timedelta(hours=1):
            token_obj.delete()
            return Response({'detail': 'Token expiré.'}, status=status.HTTP_400_BAD_REQUEST)

        user = token_obj.user
        user.set_password(new_password)
        user.save()
        token_obj.used = True
        token_obj.save()

        return Response({'detail': 'Mot de passe réinitialisé avec succès.'})
