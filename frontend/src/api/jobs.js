import client from './client';

export const fetchCategories = () => client.get('/categories/').then((r) => r.data);

export const fetchJobs = (params) => client.get('/jobs/', { params }).then((r) => r.data);

export const fetchJob = (slug) => client.get(`/jobs/${slug}/`).then((r) => r.data);

export const createJob = (payload) => client.post('/jobs/create/', payload).then((r) => r.data);

export const fetchMyJobs = () => client.get('/jobs/my/').then((r) => r.data);

export const fetchJobForEdit = (id) => client.get(`/jobs/${id}/edit/`).then((r) => r.data);

export const updateJob = (id, payload) => client.patch(`/jobs/${id}/edit/`, payload).then((r) => r.data);

export const deleteJob = (id) => client.delete(`/jobs/${id}/edit/`);

export const applyToJob = (jobId, formData) =>
  client
    .post(`/jobs/${jobId}/apply/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

export const fetchApplicationsForJob = (jobId) =>
  client.get(`/jobs/${jobId}/applications/`).then((r) => r.data);

export const updateApplicationStatus = (jobId, appId, status) =>
  client.patch(`/jobs/${jobId}/applications/${appId}/`, { status }).then((r) => r.data);

export const fetchMyApplications = (params) => client.get('/applications/', { params }).then((r) => r.data);

export const fetchMyApplicationStats = () => client.get('/applications/mine/stats/').then((r) => r.data);

export const fetchRecruiterAppStats = () => client.get('/applications/stats/').then((r) => r.data);

export const fetchFavorites = () => client.get('/favorites/').then((r) => r.data);

export const toggleFavorite = (jobId) =>
  client.post(`/favorites/${jobId}/toggle/`).then((r) => r.data);
