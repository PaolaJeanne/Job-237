from django.contrib import admin
from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ['sender', 'body', 'is_read', 'created_at']


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'get_participants', 'application', 'created_at', 'updated_at']
    inlines = [MessageInline]

    def get_participants(self, obj):
        return ', '.join(p.full_name for p in obj.participants.all())
    get_participants.short_description = 'Participants'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'conversation', 'body_preview', 'is_read', 'created_at']
    list_filter = ['is_read']

    def body_preview(self, obj):
        return obj.body[:60]
    body_preview.short_description = 'Message'
