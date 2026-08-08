from django.urls import path
from . import views

urlpatterns = [
    path('applications/<int:application_pk>/notes/', views.ApplicationNoteListCreateView.as_view(), name='application_notes'),
    path('notes/<int:pk>/', views.ApplicationNoteDetailView.as_view(), name='note_detail'),
]
