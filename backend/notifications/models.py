from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPE_CHOICES = [
        ('application', 'Candidature'),
        ('status_change', 'Changement de statut'),
        ('new_job', 'Nouvelle offre'),
        ('system', 'Système'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField('Titre', max_length=255)
    message = models.TextField('Message')
    type = models.CharField('Type', max_length=20, choices=TYPE_CHOICES, default='system')
    is_read = models.BooleanField('Lu', default=False)
    link = models.CharField('Lien', max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} → {self.user.full_name}'
