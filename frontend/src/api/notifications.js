import client from './client';

export const fetchNotifications = () => client.get('/notifications/').then((r) => r.data);

export const markNotificationRead = (id) =>
  client.patch(`/notifications/${id}/read/`).then((r) => r.data);

export const markAllNotificationsRead = () =>
  client.post('/notifications/read-all/').then((r) => r.data);

export const fetchUnreadCount = () =>
  client.get('/notifications/unread-count/').then((r) => r.data);
