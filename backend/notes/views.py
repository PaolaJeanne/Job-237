from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import ApplicationNote
from .serializers import ApplicationNoteSerializer
from jobs.models import JobApplication


class ApplicationNoteListCreateView(generics.ListCreateAPIView):
    """
    GET  : liste les notes du recruteur pour une candidature donnée
    POST : crée une note
    """
    serializer_class = ApplicationNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def _get_application(self):
        return get_object_or_404(
            JobApplication,
            pk=self.kwargs['application_pk'],
            job__company__owner=self.request.user,
        )

    def get_queryset(self):
        app = self._get_application()
        return ApplicationNote.objects.filter(application=app, author=self.request.user)

    def perform_create(self, serializer):
        app = self._get_application()
        serializer.save(author=self.request.user, application=app)


class ApplicationNoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Modifier ou supprimer une note (auteur uniquement)."""
    serializer_class = ApplicationNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ApplicationNote.objects.filter(author=self.request.user)
