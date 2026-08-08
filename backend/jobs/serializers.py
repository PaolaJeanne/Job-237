from rest_framework import serializers
from .models import JobCategory, JobOffer, JobApplication, Favorite
from companies.serializers import CompanyListSerializer
from job237.validators import validate_cv_document


def validate_salary_range(data):
    salary_min = data.get('salary_min')
    salary_max = data.get('salary_max')
    if salary_min is not None and salary_max is not None and salary_min > salary_max:
        raise serializers.ValidationError({
            'salary_max': 'Le salaire maximum ne peut pas être inférieur au salaire minimum.'
        })
    return data


class JobCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobCategory
        fields = ['id', 'name', 'slug', 'icon']


class JobOfferListSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.ImageField(source='company.logo', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)

    class Meta:
        model = JobOffer
        fields = [
            'id', 'title', 'slug', 'company_name', 'company_logo', 'category_name',
            'location', 'is_remote', 'job_type', 'experience_level',
            'salary_min', 'salary_max', 'deadline', 'is_active', 'is_premium',
            'views_count', 'applications_count', 'created_at',
        ]


class JobOfferDetailSerializer(serializers.ModelSerializer):
    company = CompanyListSerializer(read_only=True)
    category = JobCategorySerializer(read_only=True)
    has_applied = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = JobOffer
        fields = [
            'id', 'title', 'slug', 'company', 'category', 'description',
            'requirements', 'location', 'is_remote', 'job_type', 'experience_level',
            'salary_min', 'salary_max', 'deadline', 'is_active', 'is_premium',
            'views_count', 'applications_count', 'has_applied', 'is_favorited',
            'created_at', 'updated_at',
        ]

    def get_has_applied(self, obj):
        user = self.context.get('request') and self.context['request'].user
        if user and user.is_authenticated:
            return JobApplication.objects.filter(candidate=user, job=obj).exists()
        return False

    def get_is_favorited(self, obj):
        user = self.context.get('request') and self.context['request'].user
        if user and user.is_authenticated:
            return Favorite.objects.filter(user=user, job=obj).exists()
        return False


class JobOfferCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobOffer
        fields = [
            'title', 'description', 'requirements', 'location',
            'is_remote', 'job_type', 'experience_level', 'salary_min',
            'salary_max', 'deadline', 'company', 'category',
        ]

    def validate_company(self, value):
        if value.owner != self.context['request'].user:
            raise serializers.ValidationError('Vous ne pouvez publier que pour vos propres entreprises.')
        return value

    def validate(self, data):
        return validate_salary_range(data)

    def create(self, validated_data):
        from django.utils.text import slugify
        title = validated_data.get('title', '')
        base_slug = slugify(title)
        slug = base_slug
        counter = 1
        while JobOffer.objects.filter(slug=slug).exists():
            slug = f'{base_slug}-{counter}'
            counter += 1
        validated_data['slug'] = slug
        return super().create(validated_data)


class JobOfferUpdateSerializer(serializers.ModelSerializer):
    """Sérializer pour la modification d'une offre existante (recruteur propriétaire)."""
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = JobOffer
        fields = [
            'id', 'title', 'slug', 'description', 'requirements', 'location',
            'is_remote', 'job_type', 'experience_level', 'salary_min', 'salary_max',
            'deadline', 'company', 'company_name', 'category', 'category_name',
            'is_active',
        ]
        read_only_fields = ['id', 'slug', 'company', 'company_name']

    def validate(self, data):
        return validate_salary_range(data)


class JobApplicationSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate.full_name', read_only=True)
    candidate_email = serializers.EmailField(source='candidate.email', read_only=True)
    candidate_id = serializers.IntegerField(source='candidate.id', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_slug = serializers.SlugField(source='job.slug', read_only=True)
    job_type = serializers.CharField(source='job.job_type', read_only=True)
    company_name = serializers.CharField(source='job.company.name', read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'candidate_name', 'candidate_email', 'candidate_id',
            'job_title', 'job_slug', 'job_type', 'company_name',
            'cover_letter', 'cv_file', 'status', 'applied_at', 'updated_at',
        ]
        read_only_fields = ['id', 'status', 'applied_at', 'updated_at']


class JobApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['cover_letter', 'cv_file']

    def validate_cv_file(self, value):
        validate_cv_document(value)
        return value

    def validate(self, data):
        job = self.context['view'].kwargs.get('job_pk')
        if JobApplication.objects.filter(candidate=self.context['request'].user, job_id=job).exists():
            raise serializers.ValidationError('Vous avez déjà postulé à cette offre.')
        return data


class FavoriteSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company.name', read_only=True)
    job_slug = serializers.SlugField(source='job.slug', read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'job', 'job_title', 'job_slug', 'company_name', 'created_at']
