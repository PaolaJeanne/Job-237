import client from './client';

export const fetchCompanies = (params) => client.get('/companies/', { params }).then((r) => r.data);

export const fetchCompany = (slug) => client.get(`/companies/${slug}/`).then((r) => r.data);

export const fetchMyCompanies = () => client.get('/companies/my/').then((r) => r.data);

export const createCompany = (payload) => client.post('/companies/', payload).then((r) => r.data);

export const updateCompany = (slug, payload) =>
  client.patch(`/companies/${slug}/`, payload).then((r) => r.data);

export const deleteCompany = (slug) => client.delete(`/companies/${slug}/`);
