import client from './client';

export const register = (payload) => client.post('/auth/register/', payload).then((r) => r.data);
export const login = (payload) => client.post('/auth/login/', payload).then((r) => r.data);
export const fetchMe = () => client.get('/auth/profile/').then((r) => r.data);
export const updateMe = (payload) => client.patch('/auth/profile/', payload).then((r) => r.data);
export const changePassword = (payload) =>
  client.put('/auth/change-password/', payload).then((r) => r.data);
