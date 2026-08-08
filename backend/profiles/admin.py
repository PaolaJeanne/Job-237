from django.contrib import admin
from .models import CandidateProfile


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'location', 'education_level', 'experience_years', 'availability']
    list_filter = ['education_level', 'availability']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'location']
