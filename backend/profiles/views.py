from rest_framework import generics, permissions
from .models import CandidateProfile
from .serializers import CandidateProfileSerializer
from .permissions import IsCandidate


class CandidateProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CandidateProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsCandidate]

    def get_object(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile


class CandidateProfilePublicView(generics.RetrieveAPIView):
    from .serializers import CandidateProfilePublicSerializer
    serializer_class = CandidateProfilePublicSerializer
    permission_classes = [permissions.AllowAny]
    queryset = CandidateProfile.objects.select_related('user').all()
