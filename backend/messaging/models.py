from django.db import models
from django.conf import settings


class Conversation(models.Model):
    """
    Conversation privée entre deux utilisateurs.
    Typiquement : recruteur ↔ candidat, liée optionnellement à une candidature.
    """
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='conversations',
    )
    application = models.OneToOneField(
        'jobs.JobApplication',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='conversation',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
        ordering = ['-updated_at']

    def __str__(self):
        names = ', '.join(p.full_name for p in self.participants.all()[:2])
        return f'Conversation [{names}]'

    def other_participant(self, user):
        return self.participants.exclude(pk=user.pk).first()


class Message(models.Model):
    """Message dans une conversation."""
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
    )
    body = models.TextField('Message')
    is_read = models.BooleanField('Lu', default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.sender.full_name}: {self.body[:50]}'
