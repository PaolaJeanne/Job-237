from django.contrib import admin
from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'industry', 'size', 'is_verified', 'created_at']
    list_filter = ['industry', 'size', 'is_verified']
    search_fields = ['name', 'description', 'industry']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at']
