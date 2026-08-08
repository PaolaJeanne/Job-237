import client from './client';

export const fetchNotes = (applicationId) =>
  client.get(`/applications/${applicationId}/notes/`).then((r) => r.data);

export const createNote = (applicationId, body) =>
  client.post(`/applications/${applicationId}/notes/`, { body }).then((r) => r.data);

export const updateNote = (noteId, body) =>
  client.patch(`/notes/${noteId}/`, { body }).then((r) => r.data);

export const deleteNote = (noteId) =>
  client.delete(`/notes/${noteId}/`);
