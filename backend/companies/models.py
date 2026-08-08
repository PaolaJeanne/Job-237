from django.db import models
from django.conf import settings


class Company(models.Model):
    SIZE_CHOICES = [
        ('micro', '1-10'),
        ('small', '11-50'),
        ('medium', '51-250'),
        ('large', '251-1000'),
        ('enterprise', '1000+'),
    ]

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_companies')
    name = models.CharField('Nom', max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField('Description')
    logo = models.ImageField('Logo', upload_to='companies/logos/%Y/%m/', blank=True)
    website = models.URLField('Site web', blank=True)
    email = models.EmailField('Email contact')
    phone = models.CharField('Téléphone', max_length=20, blank=True)
    location = models.CharField('Localisation', max_length=255)
    industry = models.CharField('Secteur d\'activité', max_length=255)
    size = models.CharField('Taille', max_length=20, choices=SIZE_CHOICES, blank=True)
    founded_year = models.PositiveIntegerField('Année de fondation', null=True, blank=True)
    is_verified = models.BooleanField('Vérifiée', default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Entreprise'
        verbose_name_plural = 'Entreprises'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
