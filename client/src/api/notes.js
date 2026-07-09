import apiClient from './client.js';

export const notesApi = {
  getNotes: (contactId, params) => apiClient.get(`/contacts/${contactId}/notes`, { params }),
  createNote: (contactId, body) => apiClient.post(`/contacts/${contactId}/notes`, { body }),
};
