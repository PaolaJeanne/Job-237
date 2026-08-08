import client from './client';

export const fetchComments = (jobId) =>
  client.get(`/jobs/${jobId}/comments/`).then((r) => r.data);

export const postComment = (payload) =>
  client.post('/comments/', payload).then((r) => r.data);

export const deleteComment = (id) =>
  client.delete(`/comments/${id}/`);
