from django.db import models
from django.conf import settings


class JobComment(models.Model):
    """Commentaire public posté sur une offre d'emploi."""
    job = models.ForeignKey(
        'jobs.JobOffer',
        on_delete=models.CASCADE,
        related_name='comments',
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='job_comments',
    )
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='replies',
    )
    body = models.TextField('Commentaire')
    is_hidden = models.BooleanField('Masqué', default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Commentaire'
        verbose_name_plural = 'Commentaires'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.author.full_name} sur {self.job.title}'
