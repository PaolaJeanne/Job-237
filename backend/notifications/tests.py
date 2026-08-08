from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

User = get_user_model()


class NotificationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='notifications@example.com',
            password='securepassword123',
            first_name='Alert',
            last_name='User',
            role='candidate',
        )

    def test_notification_list_requires_authentication(self):
        response = self.client.get(reverse('notification_list'))
        self.assertEqual(response.status_code, 401)

    def test_notification_unread_counter_requires_authentication(self):
        response = self.client.get(reverse('notifications_unread_count'))
        self.assertEqual(response.status_code, 401)

    def test_notification_read_all_route_is_post_only(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse('notifications_read_all'))
        self.assertEqual(response.status_code, 405)
