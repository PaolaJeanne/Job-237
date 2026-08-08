from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

User = get_user_model()


class CompanyApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.recruiter = User.objects.create_user(
            email='company-owner@example.com',
            password='securepassword123',
            first_name='Owner',
            last_name='Test',
            role='recruiter',
        )

    def test_company_listing_is_public(self):
        response = self.client.get(reverse('company_list_create'))
        self.assertEqual(response.status_code, 200)

    def test_company_creation_requires_authentication(self):
        payload = {
            'name': 'Acme Corp',
            'slug': 'acme-corp',
            'description': 'A company for tests',
            'email': 'contact@acme.example',
            'phone': '+237690000001',
            'location': 'Yaoundé',
            'industry': 'IT',
            'size': 'small',
        }
        response = self.client.post(reverse('company_list_create'), payload, format='json')
        self.assertIn(response.status_code, (401, 403))
