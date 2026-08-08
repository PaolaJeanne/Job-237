from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import JobApplication


@receiver(post_save, sender=JobApplication)
def notify_on_new_application(sender, instance, created, **kwargs):
    """Notifie le recruteur quand un candidat postule à son offre."""
    if not created:
        return
    from notifications.models import Notification
    recruiter = instance.job.company.owner
    Notification.objects.create(
        user=recruiter,
        title='Nouvelle candidature',
        message=(
            f'{instance.candidate.full_name} a postulé au poste '
            f'"{instance.job.title}" chez {instance.job.company.name}.'
        ),
        type='application',
        link=f'/recruteur/offres/{instance.job.id}/candidatures',
    )


# Gardez la valeur d'origine du statut avant la sauvegarde
@receiver(pre_save, sender=JobApplication)
def cache_old_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._old_status = JobApplication.objects.get(pk=instance.pk).status
        except JobApplication.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None


@receiver(post_save, sender=JobApplication)
def notify_on_status_change(sender, instance, created, **kwargs):
    """Notifie le candidat quand le statut de sa candidature change."""
    if created:
        return
    old_status = getattr(instance, '_old_status', None)
    if old_status is None or old_status == instance.status:
        return

    from notifications.models import Notification

    STATUS_LABELS = {
        'pending': 'En attente',
        'reviewed': 'Consultée',
        'shortlisted': 'Présélectionnée',
        'rejected': 'Rejetée',
        'hired': 'Recrutée',
    }
    new_label = STATUS_LABELS.get(instance.status, instance.status)

    Notification.objects.create(
        user=instance.candidate,
        title='Statut de candidature mis à jour',
        message=(
            f'Votre candidature pour "{instance.job.title}" chez '
            f'{instance.job.company.name} est maintenant : {new_label}.'
        ),
        type='status_change',
        link=f'/mes-candidatures',
    )
