from django.urls import path
from . import views

urlpatterns = [
    path('companies/', views.CompanyListCreateView.as_view(), name='company_list_create'),
    path('companies/my/', views.MyCompaniesView.as_view(), name='my_companies'),
    path('companies/<slug:slug>/', views.CompanyDetailView.as_view(), name='company_detail'),
]
