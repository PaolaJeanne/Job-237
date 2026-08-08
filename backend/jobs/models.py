from django.db import models
from django.conf import settings


class JobCategory(models.Model):
    name = models.CharField('Nom', max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    icon = models.CharField('Icône', max_length=50, blank=True)

    class Meta:
        verbose_name = 'Catégorie'
        verbose_name_plural = 'Catégories'
        ordering = ['name']

    def __str__(self):
        return self.name


class JobOffer(models.Model):
    JOB_TYPE_CHOICES = [
        ('full_time', 'Temps plein'),
        ('part_time', 'Temps partiel'),
        ('internship', 'Stage'),
        ('freelance', 'Freelance'),
        ('contract', 'CDD'),
        ('cdi', 'CDI'),
    ]

    EXPERIENCE_LEVELS = [
        ('entry', 'Débutant'),
        ('junior', 'Junior (1-3 ans)'),
        ('mid', 'Confirmé (3-5 ans)'),
        ('senior', 'Senior (5+ ans)'),
        ('lead', 'Lead / Manager'),
    ]

    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='job_offers')
    category = models.ForeignKey(JobCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='offers')
    title = models.CharField('Titre', max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField('Description')
    requirements = models.TextField('Exigences', blank=True)
    location = models.CharField('Lieu', max_length=255)
    is_remote = models.BooleanField('Télétravail possible', default=False)
    job_type = models.CharField('Type', max_length=20, choices=JOB_TYPE_CHOICES)
    experience_level = models.CharField('Niveau d\'expérience', max_length=20, choices=EXPERIENCE_LEVELS, blank=True)
    salary_min = models.PositiveIntegerField('Salaire min (FCFA)', null=True, blank=True)
    salary_max = models.PositiveIntegerField('Salaire max (FCFA)', null=True, blank=True)
    deadline = models.DateField('Date limite', null=True, blank=True)
    is_active = models.BooleanField('Active', default=True)
    is_premium = models.BooleanField('Premium', default=False)
    views_count = models.PositiveIntegerField('Vues', default=0)
    applications_count = models.PositiveIntegerField('Candidatures', default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Offre d\'emploi'
        verbose_name_plural = 'Offres d\'emploi'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} - {self.company.name}'


class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('reviewed', 'Consultée'),
        ('shortlisted', 'Présélectionnée'),
        ('rejected', 'Rejetée'),
        ('hired', 'Recrutée'),
    ]

    candidate = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(JobOffer, on_delete=models.CASCADE, related_name='applications')
    cover_letter = models.TextField('Lettre de motivation', blank=True)
    cv_file = models.FileField('CV', upload_to='applications/cvs/%Y/%m/', blank=True)
    status = models.CharField('Statut', max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Candidature'
        verbose_name_plural = 'Candidatures'
        ordering = ['-applied_at']
        unique_together = ['candidate', 'job']

    def __str__(self):
        return f'{self.candidate.full_name} → {self.job.title}'


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    job = models.ForeignKey(JobOffer, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Favori'
        verbose_name_plural = 'Favoris'
        unique_together = ['user', 'job']

    def __str__(self):
        return f'{self.user.full_name} → {self.job.title}'
