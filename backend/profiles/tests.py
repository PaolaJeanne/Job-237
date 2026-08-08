from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from profiles.models import CandidateProfile

User = get_user_model()


class ProfileApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='candidate@example.com',
            password='securepassword123',
            first_name='Candidate',
            last_name='Test',
            role='candidate',
        )
        self.profile = CandidateProfile.objects.create(user=self.user)

    def test_candidate_profile_requires_authentication(self):
        response = self.client.get(reverse('candidate_profile'))
        self.assertEqual(response.status_code, 401)

    def test_candidate_public_endpoint_is_public(self):
        response = self.client.get(reverse('candidate_profile_public', args=[self.profile.pk]))
        self.assertEqual(response.status_code, 200)
