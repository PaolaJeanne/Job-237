from rest_framework import serializers
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_role = serializers.CharField(source='sender.role', read_only=True)
    is_own = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender_name', 'sender_role', 'body', 'is_read', 'is_own', 'created_at']
        read_only_fields = ['id', 'sender_name', 'sender_role', 'is_read', 'is_own', 'created_at']

    def get_is_own(self, obj):
        request = self.context.get('request')
        return request and obj.sender_id == request.user.id


class ConversationSerializer(serializers.ModelSerializer):
    other_name = serializers.SerializerMethodField()
    other_role = serializers.SerializerMethodField()
    other_id = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    job_title = serializers.CharField(source='application.job.title', read_only=True, default=None)
    job_slug = serializers.CharField(source='application.job.slug', read_only=True, default=None)

    class Meta:
        model = Conversation
        fields = [
            'id', 'other_id', 'other_name', 'other_role',
            'job_title', 'job_slug', 'last_message', 'unread_count',
            'created_at', 'updated_at',
        ]

    def _other(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        return obj.participants.exclude(pk=request.user.pk).first()

    def get_other_id(self, obj):
        other = self._other(obj)
        return other.pk if other else None

    def get_other_name(self, obj):
        other = self._other(obj)
        return other.full_name if other else '?'

    def get_other_role(self, obj):
        other = self._other(obj)
        return other.role if other else None

    def get_last_message(self, obj):
        msg = obj.messages.last()
        if not msg:
            return None
        return {
            'body': msg.body[:80],
            'sender_name': msg.sender.full_name,
            'created_at': msg.created_at,
            'is_read': msg.is_read,
        }

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['body']
