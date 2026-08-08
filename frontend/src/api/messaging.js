import client from './client';

export const fetchConversations = () =>
  client.get('/conversations/').then((r) => r.data);

export const fetchMessagingContacts = () =>
  client.get('/contacts/').then((r) => r.data);

export const startConversation = (payload) =>
  client.post('/conversations/start/', payload).then((r) => r.data);

export const fetchMessages = (convId) =>
  client.get(`/conversations/${convId}/messages/`).then((r) => r.data);

export const sendMessage = (convId, body) =>
  client.post(`/conversations/${convId}/messages/send/`, { body }).then((r) => r.data);

export const fetchUnreadMessageCount = () =>
  client.get('/conversations/unread/').then((r) => r.data);
