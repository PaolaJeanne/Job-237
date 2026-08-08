from django.db import models
from django.conf import settings


class ApplicationNote(models.Model):
    """
    Note privée qu'un recruteur écrit sur une candidature.
    Visible uniquement par le recruteur propriétaire.
    """
    application = models.ForeignKey(
        'jobs.JobApplication',
        on_delete=models.CASCADE,
        related_name='notes',
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recruiter_notes',
    )
    body = models.TextField('Note')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Note recruteur'
        verbose_name_plural = 'Notes recruteur'
        ordering = ['-created_at']

    def __str__(self):
        return f'Note de {self.author.full_name} sur candidature #{self.application_id}'
