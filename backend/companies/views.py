from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Company
from .serializers import CompanySerializer, CompanyListSerializer
from .permissions import IsOwnerOrReadOnly


class CompanyListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = Company.objects.select_related('owner').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['industry', 'size', 'is_verified', 'location']
    search_fields = ['name', 'description', 'industry']
    ordering_fields = ['name', 'created_at']

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return CompanyListSerializer
        return CompanySerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class CompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    queryset = Company.objects.select_related('owner').all()
    lookup_field = 'slug'


class MyCompaniesView(generics.ListAPIView):
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Company.objects.filter(owner=self.request.user)
