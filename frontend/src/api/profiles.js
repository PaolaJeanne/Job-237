import client from './client';

export const fetchMyCandidateProfile = () => client.get('/profile/candidate/').then((r) => r.data);

export const updateMyCandidateProfile = (payload) =>
  client.patch('/profile/candidate/', payload).then((r) => r.data);

export const fetchPublicCandidateProfile = (id) =>
  client.get(`/candidates/${id}/`).then((r) => r.data);
