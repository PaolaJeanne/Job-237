from django.urls import path
from . import views

urlpatterns = [
    path('jobs/<int:job_pk>/comments/', views.JobCommentListView.as_view(), name='job_comments'),
    path('comments/', views.JobCommentCreateView.as_view(), name='comment_create'),
    path('comments/<int:pk>/', views.JobCommentDeleteView.as_view(), name='comment_delete'),
]
