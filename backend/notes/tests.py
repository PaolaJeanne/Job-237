from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

User = get_user_model()


class NotesApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='note-owner@example.com',
            password='securepassword123',
            first_name='Recruiter',
            last_name='Test',
            role='recruiter',
        )

    def test_notes_endpoint_requires_authentication(self):
        response = self.client.get(reverse('application_notes', args=[1]))
        self.assertEqual(response.status_code, 401)

    def test_notes_detail_route_is_protected(self):
        response = self.client.get(reverse('note_detail', args=[1]))
        self.assertIn(response.status_code, (401, 404))
