from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import JobComment
from .serializers import JobCommentSerializer, JobCommentCreateSerializer


class JobCommentListView(generics.ListAPIView):
    """Liste des commentaires de premier niveau d'une offre (public)."""
    serializer_class = JobCommentSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return JobComment.objects.filter(
            job_id=self.kwargs['job_pk'],
            parent=None,
            is_hidden=False,
        ).select_related('author').prefetch_related('replies__author')


class JobCommentCreateView(generics.CreateAPIView):
    """Poster un commentaire (authentifié)."""
    serializer_class = JobCommentCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(author=request.user)
        return Response(
            JobCommentSerializer(comment, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class JobCommentDeleteView(generics.DestroyAPIView):
    """Supprimer son propre commentaire."""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobComment.objects.filter(author=self.request.user)
