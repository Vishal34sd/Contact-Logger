import apiClient from './client.js';

export const contactsApi = {
  getContacts: (params) => apiClient.get('/contacts', { params }),
  getContactById: (id) => apiClient.get(`/contacts/${id}`),
};
