import client from './client';

export const fetchAdminStats = () => client.get('/auth/admin/stats/').then((r) => r.data);

export const fetchUsers = (params) => client.get('/auth/admin/users/', { params }).then((r) => r.data);

export const updateUser = (id, payload) =>
  client.patch(`/auth/admin/users/${id}/`, payload).then((r) => r.data);
