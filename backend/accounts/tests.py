from django.test import TestCase, override_settings
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core import mail
from rest_framework.test import APIClient

from .models import PasswordResetToken

User = get_user_model()


class AuthApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_and_login_flow(self):
        payload = {
            'email': 'candidate@example.com',
            'first_name': 'Jean',
            'last_name': 'Dupont',
            'role': 'candidate',
            'phone': '+237690000000',
            'password': 'securepassword123',
            'password_confirm': 'securepassword123',
        }

        register_response = self.client.post(reverse('register'), payload, format='json')
        self.assertEqual(register_response.status_code, 201)
        self.assertIn('tokens', register_response.data)

        login_response = self.client.post(
            reverse('token_obtain_pair'),
            {'email': payload['email'], 'password': payload['password']},
            format='json',
        )
        self.assertEqual(login_response.status_code, 200)
        self.assertIn('access', login_response.data)
        self.assertIn('refresh', login_response.data)

    def test_profile_requires_authentication(self):
        response = self.client.get(reverse('profile'))
        self.assertEqual(response.status_code, 401)

    def test_password_reset_request_is_public(self):
        response = self.client.post(
            reverse('password_reset_request'),
            {'email': 'candidate@example.com'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('detail', response.data)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_password_reset_sends_email_with_link(self):
        user = User.objects.create_user(
            email='reset@example.com',
            password='oldpass123',
            first_name='Test',
            last_name='User',
        )
        response = self.client.post(
            reverse('password_reset_request'),
            {'email': user.email},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        # Pas de token renvoyé dans la réponse
        self.assertNotIn('token', response.data)
        self.assertEqual(len(mail.outbox), 1)
        body = mail.outbox[0].body
        self.assertIn(f'uid={user.pk}', body)
        self.assertIn('/reinitialiser-mot-de-passe?', body)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_password_reset_does_not_confirm_account_existence(self):
        response = self.client.post(
            reverse('password_reset_request'),
            {'email': 'nobody@example.com'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    def test_password_reset_full_flow(self):
        user = User.objects.create_user(
            email='reset@example.com',
            password='oldpass123',
            first_name='Test',
            last_name='User',
        )
        self.client.post(
            reverse('password_reset_request'),
            {'email': user.email},
            format='json',
        )
        token = PasswordResetToken.objects.get(user=user)

        confirm = self.client.post(
            reverse('password_reset_confirm'),
            {'uid': user.pk, 'token': str(token.token), 'new_password': 'newpass123'},
            format='json',
        )
        self.assertEqual(confirm.status_code, 200)

        user.refresh_from_db()
        self.assertTrue(user.check_password('newpass123'))
        token.refresh_from_db()
        self.assertTrue(token.used)

        # Un token déjà utilisé est refusé
        confirm_again = self.client.post(
            reverse('password_reset_confirm'),
            {'uid': user.pk, 'token': str(token.token), 'new_password': 'another123'},
            format='json',
        )
        self.assertEqual(confirm_again.status_code, 400)

