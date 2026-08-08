from django.db import models
from django.conf import settings


class CandidateProfile(models.Model):
    EDUCATION_LEVELS = [
        ('none', 'Aucun'),
        ('cap', 'CAP/BEP'),
        ('bepc', 'BEPC'),
        ('bacc', 'Baccalauréat'),
        ('bts', 'BTS/DUT'),
        ('licence', 'Licence'),
        ('master', 'Master'),
        ('doctorat', 'Doctorat'),
        ('autre', 'Autre'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='candidate_profile')
    phone = models.CharField('Téléphone', max_length=20, blank=True)
    date_of_birth = models.DateField('Date de naissance', null=True, blank=True)
    location = models.CharField('Localisation', max_length=255, blank=True)
    bio = models.TextField('Bio', blank=True)
    cv_file = models.FileField('CV', upload_to='cvs/%Y/%m/', blank=True)
    photo = models.ImageField('Photo', upload_to='photos/%Y/%m/', blank=True)
    skills = models.JSONField('Compétences', default=list, blank=True)
    experience_years = models.PositiveIntegerField('Années d\'expérience', default=0)
    education_level = models.CharField('Niveau d\'étude', max_length=20, choices=EDUCATION_LEVELS, blank=True)
    availability = models.BooleanField('Disponible', default=True)
    linkedin_url = models.URLField('LinkedIn', blank=True)
    portfolio_url = models.URLField('Portfolio', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Profil candidat'
        verbose_name_plural = 'Profils candidats'

    def __str__(self):
        return f'Profil de {self.user.full_name}'
