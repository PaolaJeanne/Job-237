from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    jobs_count = serializers.SerializerMethodField()
    active_jobs_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id', 'owner', 'owner_name', 'name', 'slug', 'description', 'logo',
            'website', 'email', 'phone', 'location', 'industry', 'size',
            'founded_year', 'is_verified', 'jobs_count', 'active_jobs_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'is_verified', 'created_at', 'updated_at']

    def get_jobs_count(self, obj):
        return obj.job_offers.count()

    def get_active_jobs_count(self, obj):
        return obj.job_offers.filter(is_active=True).count()


class CompanyListSerializer(serializers.ModelSerializer):
    jobs_count = serializers.SerializerMethodField()
    active_jobs_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ['id', 'name', 'slug', 'logo', 'description', 'location', 'industry', 'size', 'website', 'is_verified', 'jobs_count', 'active_jobs_count']

    def get_jobs_count(self, obj):
        return obj.job_offers.count()

    def get_active_jobs_count(self, obj):
        return obj.job_offers.filter(is_active=True).count()
