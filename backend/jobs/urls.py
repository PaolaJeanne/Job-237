from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.JobCategoryListView.as_view(), name='category_list'),
    path('jobs/', views.JobOfferListView.as_view(), name='job_list'),
    path('jobs/create/', views.JobOfferCreateView.as_view(), name='job_create'),
    path('jobs/my/', views.MyJobOffersView.as_view(), name='my_job_offers'),
    path('jobs/<int:pk>/edit/', views.JobOfferUpdateView.as_view(), name='job_edit'),
    path('jobs/<str:slug>/', views.JobOfferDetailView.as_view(), name='job_detail'),
    path('jobs/<int:job_pk>/apply/', views.JobApplicationCreateView.as_view(), name='job_apply'),
    path('jobs/<int:job_pk>/applications/', views.ApplicationForJobView.as_view(), name='job_applications'),
    path('jobs/<int:job_pk>/applications/<int:pk>/', views.UpdateApplicationStatusView.as_view(), name='update_application_status'),
    path('applications/mine/stats/', views.MyApplicationsStatsView.as_view(), name='my_applications_stats'),
    path('applications/stats/', views.ApplicationsStatsView.as_view(), name='applications_stats'),
    path('applications/', views.MyApplicationsView.as_view(), name='my_applications'),
    path('favorites/', views.FavoriteListView.as_view(), name='favorite_list'),
    path('favorites/<int:job_pk>/toggle/', views.FavoriteToggleView.as_view(), name='favorite_toggle'),
]
