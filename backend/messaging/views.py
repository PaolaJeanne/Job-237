from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, MessageCreateSerializer


def _are_related_by_application(user_a, user_b):
    """Deux utilisateurs peuvent échanger s'ils sont liés par une candidature
    (candidat ↔ propriétaire de l'entreprise qui a publié l'offre)."""
    from jobs.models import JobApplication
    return JobApplication.objects.filter(
        Q(candidate=user_a, job__company__owner=user_b)
        | Q(candidate=user_b, job__company__owner=user_a)
    ).exists()


class ConversationListView(generics.ListAPIView):
    """Liste des conversations de l'utilisateur connecté."""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return (
            Conversation.objects
            .filter(participants=self.request.user)
            .prefetch_related('participants', 'messages__sender', 'application__job__company')
            .order_by('-updated_at')
        )


class ConversationDetailView(generics.RetrieveAPIView):
    """Détail d'une conversation + marque les messages non lus comme lus."""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = 'conv_pk'

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Marquer les messages reçus comme lus
        instance.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ContactsView(APIView):
    """Contacts joignables pour lancer une conversation (liés par une candidature)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from jobs.models import JobApplication

        apps = (
            JobApplication.objects
            .filter(Q(candidate=request.user) | Q(job__company__owner=request.user))
            .select_related('candidate', 'job', 'job__company__owner')
            .order_by('-applied_at')
        )

        contacts = {}
        for app in apps:
            candidate = app.candidate
            owner = app.job.company.owner
            for user in (candidate, owner):
                if user == request.user:
                    continue
                if user.pk not in contacts:
                    contacts[user.pk] = {
                        'id': user.pk,
                        'name': user.full_name,
                        'role': user.role,
                        'application_id': app.pk,
                        'job_title': app.job.title,
                        'job_slug': app.job.slug,
                    }

        return Response(sorted(contacts.values(), key=lambda c: c['name'].lower()))


class ConversationStartView(APIView):
    """
    Ouvre ou récupère une conversation avec un autre utilisateur.
    Peut être liée à une candidature via application_id.
    Body: { "recipient_id": int, "application_id": int (optionnel) }
    """
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'messaging'

    def post(self, request):
        from django.contrib.auth import get_user_model
        from jobs.models import JobApplication

        User = get_user_model()
        recipient_id = request.data.get('recipient_id')
        application_id = request.data.get('application_id')

        if not recipient_id:
            return Response({'detail': 'recipient_id requis.'}, status=status.HTTP_400_BAD_REQUEST)

        recipient = get_object_or_404(User, pk=recipient_id)
        if recipient == request.user:
            return Response({'detail': 'Vous ne pouvez pas vous écrire à vous-même.'}, status=status.HTTP_400_BAD_REQUEST)

        if application_id:
            # Conversation liée à une candidature : seuls les deux parties
            # (candidat + propriétaire de l'entreprise) peuvent y participer.
            application = get_object_or_404(JobApplication, pk=application_id)
            owner = application.job.company.owner
            if request.user.pk not in (application.candidate_id, owner.pk):
                raise PermissionDenied('Vous n\'êtes pas concerné par cette candidature.')
            if recipient.pk not in (application.candidate_id, owner.pk):
                raise PermissionDenied('Vous ne pouvez pas écrire à cet utilisateur pour cette candidature.')
        else:
            # Sans candidature : bloquer le message à froid, n'autoriser que les
            # utilisateurs déjà liés par une candidature (ou une conversation existante).
            existing = Conversation.objects.filter(participants=request.user).filter(participants=recipient)
            if not existing.exists() and not _are_related_by_application(request.user, recipient):
                raise PermissionDenied(
                    'Vous ne pouvez ouvrir une conversation qu\'avec un recruteur ou un candidat '
                    'lié à une candidature.'
                )

        # Chercher une conversation existante entre ces deux utilisateurs
        existing = (
            Conversation.objects
            .filter(participants=request.user)
            .filter(participants=recipient)
        )
        if application_id:
            existing = existing.filter(application_id=application_id)

        conv = existing.first()
        if not conv:
            application = None
            if application_id:
                try:
                    application = JobApplication.objects.get(pk=application_id)
                except JobApplication.DoesNotExist:
                    pass
            conv = Conversation.objects.create(application=application)
            conv.participants.add(request.user, recipient)

        return Response(ConversationSerializer(conv, context={'request': request}).data, status=status.HTTP_200_OK)


class MessageListView(generics.ListAPIView):
    """Liste des messages d'une conversation."""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        conv = get_object_or_404(
            Conversation,
            pk=self.kwargs['conv_pk'],
            participants=self.request.user,
        )
        # Marquer les messages non lus comme lus à la lecture
        conv.messages.filter(is_read=False).exclude(sender=self.request.user).update(is_read=True)
        return conv.messages.select_related('sender')


class MessageCreateView(generics.CreateAPIView):
    """Envoyer un message dans une conversation."""
    serializer_class = MessageCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'messaging'

    def perform_create(self, serializer):
        conv = get_object_or_404(
            Conversation,
            pk=self.kwargs['conv_pk'],
            participants=self.request.user,
        )
        msg = serializer.save(sender=self.request.user, conversation=conv)
        # Mettre à jour le timestamp de la conversation
        Conversation.objects.filter(pk=conv.pk).update(updated_at=msg.created_at)
        # Créer une notification pour le destinataire
        recipient = conv.participants.exclude(pk=self.request.user.pk).first()
        if recipient:
            from notifications.models import Notification
            Notification.objects.create(
                user=recipient,
                title='Nouveau message',
                message=f'{self.request.user.full_name} vous a envoyé un message.',
                type='system',
                link=f'/messagerie/{conv.pk}',
            )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        conv = get_object_or_404(Conversation, pk=self.kwargs['conv_pk'])
        msg = conv.messages.last()
        return Response(MessageSerializer(msg, context={'request': request}).data, status=status.HTTP_201_CREATED)


class UnreadMessageCountView(APIView):
    """Nombre total de messages non lus (pour le badge navbar)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Message.objects.filter(
            conversation__participants=request.user,
            is_read=False,
        ).exclude(sender=request.user).count()
        return Response({'unread_count': count})
