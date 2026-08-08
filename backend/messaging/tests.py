from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from companies.models import Company
from jobs.models import JobCategory, JobOffer

User = get_user_model()


class MessagingApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='alice@example.com',
            password='securepassword123',
            first_name='Alice',
            last_name='Test',
            role='candidate',
        )
        self.recipient = User.objects.create_user(
            email='bob@example.com',
            password='securepassword123',
            first_name='Bob',
            last_name='Test',
            role='recruiter',
        )
        self.stranger = User.objects.create_user(
            email='carol@example.com',
            password='securepassword123',
            first_name='Carol',
            last_name='Test',
            role='recruiter',
        )

    def _create_application(self):
        company = Company.objects.create(
            owner=self.recipient,
            name='Test Corp',
            slug='test-corp',
            description='...',
            email='hr@test.cm',
            location='Yaounde',
            industry='IT',
        )
        job = JobOffer.objects.create(
            company=company,
            title='Developpeur',
            slug='developpeur',
            description='...',
            location='Yaounde',
            job_type='full_time',
        )
        from jobs.models import JobApplication
        return JobApplication.objects.create(candidate=self.user, job=job)

    def test_conversation_list_requires_authentication(self):
        response = self.client.get(reverse('conversation_list'))
        self.assertEqual(response.status_code, 401)

    def test_conversation_start_requires_recipient_payload(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(reverse('conversation_start'), data={}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_conversation_start_blocked_for_strangers(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            reverse('conversation_start'),
            data={'recipient_id': self.stranger.pk},
            format='json',
        )
        self.assertEqual(response.status_code, 403)

    def test_conversation_start_allowed_for_application_parties(self):
        application = self._create_application()
        # Le candidat écrit au recruteur, lié par une candidature
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            reverse('conversation_start'),
            data={'recipient_id': self.recipient.pk, 'application_id': application.pk},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('id', response.data)

    def test_conversation_start_rejected_for_unrelated_application(self):
        application = self._create_application()
        # Un tiers non concerné par la candidature est refusé
        self.client.force_authenticate(user=self.stranger)
        response = self.client.post(
            reverse('conversation_start'),
            data={'recipient_id': self.user.pk, 'application_id': application.pk},
            format='json',
        )
        self.assertEqual(response.status_code, 403)

    def test_contacts_lists_application_parties(self):
        self._create_application()

        # Pour le candidat : le recruteur apparaît comme contact
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse('contacts'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.recipient.pk)
        self.assertEqual(response.data[0]['application_id'], self.user.applications.first().pk)
        self.assertIn('job_title', response.data[0])

        # Pour le recruteur : le candidat apparaît comme contact
        self.client.force_authenticate(user=self.recipient)
        response = self.client.get(reverse('contacts'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.user.pk)

    def test_contacts_excludes_stranger_and_self(self):
        self._create_application()
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse('contacts'))
        ids = [c['id'] for c in response.data]
        self.assertNotIn(self.stranger.pk, ids)
        self.assertNotIn(self.user.pk, ids)

    def _start_conversation(self):
        application = self._create_application()
        response = self.client.post(
            reverse('conversation_start'),
            data={'recipient_id': self.recipient.pk, 'application_id': application.pk},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        return response.data['id']

    def test_message_list_requires_authentication(self):
        response = self.client.get(reverse('message_list', args=[1]))
        self.assertEqual(response.status_code, 401)

    def test_conversation_detail_requires_authentication(self):
        response = self.client.get(reverse('conversation_detail', args=[1]))
        self.assertEqual(response.status_code, 401)

    def test_send_and_list_messages(self):
        self.client.force_authenticate(user=self.user)
        conv_id = self._start_conversation()

        send = self.client.post(
            reverse('message_send', args=[conv_id]),
            data={'body': 'Bonjour, votre profil nous intéresse.'},
            format='json',
        )
        self.assertEqual(send.status_code, 201)
        self.assertEqual(send.data['body'], 'Bonjour, votre profil nous intéresse.')
        self.assertTrue(send.data['is_own'])

        # Envoi sans contenu → 400
        empty = self.client.post(reverse('message_send', args=[conv_id]), data={}, format='json')
        self.assertEqual(empty.status_code, 400)

        listing = self.client.get(reverse('message_list', args=[conv_id]))
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(len(listing.data), 1)
        self.assertEqual(listing.data[0]['body'], 'Bonjour, votre profil nous intéresse.')

    def test_message_flow_for_non_participant(self):
        self.client.force_authenticate(user=self.user)
        conv_id = self._start_conversation()

        # Un utilisateur hors de la conversation ne peut ni lire ni écrire
        self.client.force_authenticate(user=self.stranger)
        listing = self.client.get(reverse('message_list', args=[conv_id]))
        self.assertEqual(listing.status_code, 404)
        send = self.client.post(
            reverse('message_send', args=[conv_id]),
            data={'body': 'intrusion'},
            format='json',
        )
        self.assertEqual(send.status_code, 404)
        detail = self.client.get(reverse('conversation_detail', args=[conv_id]))
        self.assertEqual(detail.status_code, 404)

    def test_unread_count_tracks_incoming_messages(self):
        self.client.force_authenticate(user=self.user)
        conv_id = self._start_conversation()
        self.client.post(
            reverse('message_send', args=[conv_id]),
            data={'body': 'Candidature reçue, merci.'},
            format='json',
        )

        # Le destinataire a 1 non-lu, l'expéditeur 0
        self.client.force_authenticate(user=self.recipient)
        unread = self.client.get(reverse('messages_unread'))
        self.assertEqual(unread.data['unread_count'], 1)

        self.client.force_authenticate(user=self.user)
        unread = self.client.get(reverse('messages_unread'))
        self.assertEqual(unread.data['unread_count'], 0)

        # Le détail de la conversation marque les messages comme lus
        self.client.force_authenticate(user=self.recipient)
        detail = self.client.get(reverse('conversation_detail', args=[conv_id]))
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.data['unread_count'], 0)
        unread = self.client.get(reverse('messages_unread'))
        self.assertEqual(unread.data['unread_count'], 0)

    def test_message_list_marks_messages_as_read(self):
        self.client.force_authenticate(user=self.user)
        conv_id = self._start_conversation()
        self.client.post(
            reverse('message_send', args=[conv_id]),
            data={'body': 'À relire.'},
            format='json',
        )

        self.client.force_authenticate(user=self.recipient)
        listing = self.client.get(reverse('message_list', args=[conv_id]))
        self.assertEqual(listing.data[0]['is_read'], True)

    def test_send_message_creates_notification(self):
        from notifications.models import Notification

        self.client.force_authenticate(user=self.user)
        conv_id = self._start_conversation()
        self.client.post(
            reverse('message_send', args=[conv_id]),
            data={'body': 'Bonjour !'},
            format='json',
        )

        notif = Notification.objects.filter(user=self.recipient, type='system').first()
        self.assertIsNotNone(notif)
        self.assertIn('Nouveau message', notif.title)

    def test_conversation_start_reuses_existing_conversation(self):
        from messaging.models import Conversation

        self.client.force_authenticate(user=self.user)
        conv_id = self._start_conversation()

        second = self.client.post(
            reverse('conversation_start'),
            data={'recipient_id': self.recipient.pk},
            format='json',
        )
        self.assertEqual(second.status_code, 200)
        self.assertEqual(second.data['id'], conv_id)
        self.assertEqual(Conversation.objects.count(), 1)
