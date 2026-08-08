from django.urls import path
from . import views

urlpatterns = [
    path('profile/candidate/', views.CandidateProfileView.as_view(), name='candidate_profile'),
    path('candidates/<int:pk>/', views.CandidateProfilePublicView.as_view(), name='candidate_profile_public'),
]
