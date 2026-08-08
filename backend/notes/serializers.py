from rest_framework import serializers
from .models import ApplicationNote


class ApplicationNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)

    class Meta:
        model = ApplicationNote
        fields = ['id', 'application', 'author_name', 'body', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author_name', 'created_at', 'updated_at']
