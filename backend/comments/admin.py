from django.contrib import admin
from .models import JobComment


@admin.register(JobComment)
class JobCommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'job', 'parent', 'is_hidden', 'created_at']
    list_filter = ['is_hidden']
    search_fields = ['body', 'author__email']
    actions = ['hide_comments']

    @admin.action(description='Masquer les commentaires sélectionnés')
    def hide_comments(self, request, queryset):
        queryset.update(is_hidden=True)
