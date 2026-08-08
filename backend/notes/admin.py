from django.contrib import admin
from .models import ApplicationNote


@admin.register(ApplicationNote)
class ApplicationNoteAdmin(admin.ModelAdmin):
    list_display = ['author', 'application', 'body_preview', 'created_at']
    search_fields = ['body', 'author__email']

    def body_preview(self, obj):
        return obj.body[:60]
    body_preview.short_description = 'Note'
