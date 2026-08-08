from django.urls import path
from . import views

urlpatterns = [
    path('notifications/', views.NotificationListView.as_view(), name='notification_list'),
    path('notifications/<int:pk>/read/', views.MarkNotificationReadView.as_view(), name='notification_read'),
    path('notifications/read-all/', views.MarkAllNotificationsReadView.as_view(), name='notifications_read_all'),
    path('notifications/unread-count/', views.UnreadCountView.as_view(), name='notifications_unread_count'),
]
