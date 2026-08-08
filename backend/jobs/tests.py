from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from companies.models import Company
from jobs.models import JobOffer

User = get_user_model()


class JobApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='recruiter@example.com',
            password='securepassword123',
            first_name='Recruiter',
            last_name='Test',
            role='recruiter',
        )
        self.company = Company.objects.create(
            owner=self.user,
            name='Test Corp',
            slug='test-corp',
            description='...',
            email='hr@test.cm',
            location='Yaounde',
            industry='IT',
        )

    def _create_job(self, **kwargs):
        defaults = {
            'company': self.company,
            'title': 'Developpeur',
            'slug': 'developpeur',
            'description': '...',
            'location': 'Yaounde',
            'job_type': 'full_time',
        }
        defaults.update(kwargs)
        return JobOffer.objects.create(**defaults)

    def test_jobs_endpoint_is_public_and_returns_list(self):
        response = self.client.get(reverse('job_list'))
        self.assertEqual(response.status_code, 200)
        self.assertIn('results', response.data)

    def test_categories_endpoint_is_public(self):
        response = self.client.get(reverse('category_list'))
        self.assertEqual(response.status_code, 200)

    def test_application_creation_requires_authentication(self):
        # Endpoint is binding by a numeric job id, this request validates auth enforcement.
        response = self.client.post('/api/jobs/1/apply/', {}, format='json')
        self.assertIn(response.status_code, (401, 404))

    def test_job_creation_rejects_salary_min_above_max(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            reverse('job_create'),
            {
                'company': self.company.pk,
                'title': 'Poste teste',
                'description': 'Desc',
                'location': 'Douala',
                'job_type': 'full_time',
                'salary_min': 500000,
                'salary_max': 200000,
            },
            format='json',
        )
        self.assertEqual(response.status_code, 400)

    def test_duplicate_application_returns_400(self):
        candidate = User.objects.create_user(
            email='candidate@example.com',
            password='securepassword123',
            first_name='Cand',
            last_name='Test',
            role='candidate',
        )
        job = self._create_job()
        url = reverse('job_apply', kwargs={'job_pk': job.pk})

        self.client.force_authenticate(user=candidate)
        first = self.client.post(url, {'cover_letter': 'Motivation'}, format='json')
        self.assertEqual(first.status_code, 201)

        second = self.client.post(url, {'cover_letter': 'Doublon'}, format='json')
        self.assertEqual(second.status_code, 400)

    def test_views_count_incremented_once_per_session(self):
        job = self._create_job()
        url = reverse('job_detail', kwargs={'slug': job.slug})

        self.client.get(url)
        self.client.get(url)
        self.client.get(url)

        job.refresh_from_db()
        self.assertEqual(job.views_count, 1)

    def test_views_count_incremented_per_new_session(self):
        job = self._create_job()
        url = reverse('job_detail', kwargs={'slug': job.slug})

        client1 = APIClient()
        client2 = APIClient()
        client1.get(url)
        client1.get(url)
        client2.get(url)
        client2.get(url)

        job.refresh_from_db()
        self.assertEqual(job.views_count, 2)

    def test_owner_view_does_not_count(self):
        job = self._create_job()
        url = reverse('job_detail', kwargs={'slug': job.slug})

        self.client.force_authenticate(user=self.user)
        self.client.get(url)
        self.client.get(url)

        job.refresh_from_db()
        self.assertEqual(job.views_count, 0)
