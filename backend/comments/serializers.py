from rest_framework import serializers
from .models import JobComment


class JobCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    author_role = serializers.CharField(source='author.role', read_only=True)
    replies = serializers.SerializerMethodField()
    is_own = serializers.SerializerMethodField()

    class Meta:
        model = JobComment
        fields = [
            'id', 'job', 'parent', 'author_name', 'author_role',
            'body', 'replies', 'is_own', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'author_name', 'author_role', 'replies', 'is_own', 'created_at', 'updated_at']

    def get_replies(self, obj):
        if obj.parent is not None:
            return []
        qs = JobComment.objects.filter(parent=obj, is_hidden=False).order_by('created_at')
        return JobCommentSerializer(qs, many=True, context=self.context).data

    def get_is_own(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.author_id == request.user.id
        return False


class JobCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobComment
        fields = ['job', 'parent', 'body']

    def validate_parent(self, parent):
        if parent and parent.parent is not None:
            raise serializers.ValidationError('Les réponses imbriquées ne sont pas autorisées.')
        return parent

    def validate(self, data):
        if data.get('parent') and data['parent'].job_id != data['job'].id:
            raise serializers.ValidationError('Le commentaire parent appartient à une autre offre.')
        return data
