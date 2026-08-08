from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from django.db import IntegrityError
from django.db.models import Count, F
from django.db.models.functions import TruncMonth
from django.shortcuts import get_object_or_404

from .models import JobCategory, JobOffer, JobApplication, Favorite
from .serializers import (
    JobCategorySerializer, JobOfferListSerializer, JobOfferDetailSerializer,
    JobOfferCreateSerializer, JobOfferUpdateSerializer, JobApplicationSerializer,
    JobApplicationCreateSerializer, FavoriteSerializer,
)


class JobCategoryListView(generics.ListAPIView):
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class JobOfferListView(generics.ListAPIView):
    serializer_class = JobOfferListSerializer
    permission_classes = [permissions.AllowAny]
    queryset = JobOffer.objects.filter(is_active=True).select_related('company', 'category')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['job_type', 'experience_level', 'is_remote', 'category', 'location']
    search_fields = ['title', 'description', 'company__name', 'location']
    ordering_fields = ['created_at', 'salary_min', 'views_count']

    def get_queryset(self):
        qs = JobOffer.objects.filter(is_active=True).select_related('company', 'category')
        company_slug = self.request.query_params.get('company')
        if company_slug:
            qs = qs.filter(company__slug=company_slug)
        return qs


class JobOfferDetailView(generics.RetrieveAPIView):
    serializer_class = JobOfferDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    queryset = JobOffer.objects.filter(is_active=True).select_related('company', 'category')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        owner = getattr(instance.company, 'owner', None)
        # Le propriétaire qui prévisualise sa propre offre ne compte pas comme une vue
        if not (user.is_authenticated and owner == user):
            # Une vue par session navigateur (pas par refresh de page/bot)
            viewed_key = f'job237_viewed_{instance.pk}'
            if not request.session.get(viewed_key):
                JobOffer.objects.filter(pk=instance.pk).update(views_count=F('views_count') + 1)
                request.session[viewed_key] = True
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class JobOfferCreateView(generics.CreateAPIView):
    serializer_class = JobOfferCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()


class JobOfferUpdateView(generics.RetrieveUpdateDestroyAPIView):
    """Modifier ou supprimer une offre (propriétaire uniquement)."""
    serializer_class = JobOfferUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        return JobOffer.objects.filter(company__owner=self.request.user).select_related('company', 'category')

    def perform_destroy(self, instance):
        if instance.company.owner != self.request.user:
            raise PermissionDenied('Vous ne pouvez supprimer que vos propres offres.')
        instance.delete()


class MyJobOffersView(generics.ListAPIView):
    serializer_class = JobOfferListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobOffer.objects.filter(
            company__owner=self.request.user
        ).select_related('company', 'category')


class JobApplicationCreateView(generics.CreateAPIView):
    serializer_class = JobApplicationCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        job = get_object_or_404(JobOffer, pk=self.kwargs['job_pk'])
        try:
            application = serializer.save(candidate=self.request.user, job=job)
        except IntegrityError:
            # Deux requêtes simultanées : la contrainte unique_together a gagné
            raise ValidationError({'detail': 'Vous avez déjà postulé à cette offre.'})
        JobOffer.objects.filter(pk=job.pk).update(applications_count=F('applications_count') + 1)


class MyApplicationsView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(
            candidate=self.request.user
        ).select_related('job', 'job__company')


class ApplicationForJobView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(
            job_id=self.kwargs['job_pk'],
            job__company__owner=self.request.user,
        ).select_related('candidate', 'job')


class UpdateApplicationStatusView(generics.UpdateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(
            job_id=self.kwargs['job_pk'],
            job__company__owner=self.request.user,
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(JobApplication.STATUS_CHOICES):
            return Response({'detail': 'Statut invalide.'}, status=status.HTTP_400_BAD_REQUEST)
        instance.status = new_status
        instance.save()
        return Response(JobApplicationSerializer(instance).data)


class FavoriteListView(generics.ListAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('job', 'job__company')


class FavoriteToggleView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_pk):
        favorite, created = Favorite.objects.get_or_create(user=request.user, job_id=job_pk)
        if not created:
            favorite.delete()
            return Response({'status': 'removed'}, status=status.HTTP_200_OK)
        return Response({'status': 'added'}, status=status.HTTP_201_CREATED)


def _monthly_series(queryset, field='created_at'):
    """Compte les lignes par mois (série temporelle compacte)."""
    rows = (
        queryset.annotate(month=TruncMonth(field))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )
    return [{'month': row['month'].strftime('%Y-%m'), 'count': row['count']} for row in rows]


class MyApplicationsStatsView(APIView):
    """Agrégats pour le dashboard candidat — une seule requête, pas de liste complète."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = JobApplication.objects.filter(candidate=request.user)

        by_status = {s: 0 for s, _ in JobApplication.STATUS_CHOICES}
        by_status.update(qs.values('status').annotate(count=Count('id')).values_list('status', 'count'))

        by_job_type = {t: 0 for t, _ in JobOffer.JOB_TYPE_CHOICES}
        by_job_type.update(
            qs.filter(job__job_type__isnull=False)
            .values('job__job_type')
            .annotate(count=Count('id'))
            .values_list('job__job_type', 'count')
        )

        return Response({
            'total': qs.count(),
            'by_status': by_status,
            'by_job_type': by_job_type,
            'per_month': _monthly_series(qs, 'applied_at'),
        })


class ApplicationsStatsView(APIView):
    """Agrégats pour le dashboard recruteur (candidatures reçues sur ses offres)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        job_ids = JobOffer.objects.filter(company__owner=request.user).values_list('id', flat=True)
        qs = JobApplication.objects.filter(job_id__in=job_ids)

        by_status = {s: 0 for s, _ in JobApplication.STATUS_CHOICES}
        by_status.update(qs.values('status').annotate(count=Count('id')).values_list('status', 'count'))

        latest = JobApplicationSerializer(
            qs.select_related('candidate', 'job', 'job__company').order_by('-applied_at')[:5],
            many=True,
        ).data

        return Response({
            'total': qs.count(),
            'by_status': by_status,
            'per_month': _monthly_series(qs, 'applied_at'),
            'latest': latest,
        })
