from django.contrib import admin
from .models import JobCategory, JobOffer, JobApplication, Favorite


@admin.register(JobCategory)
class JobCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(JobOffer)
class JobOfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'job_type', 'location', 'is_active', 'is_premium', 'created_at']
    list_filter = ['job_type', 'is_active', 'is_premium', 'experience_level']
    search_fields = ['title', 'description', 'company__name']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['views_count', 'applications_count', 'created_at', 'updated_at']


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'job', 'status', 'applied_at']
    list_filter = ['status']
    search_fields = ['candidate__email', 'job__title']


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'job', 'created_at']
