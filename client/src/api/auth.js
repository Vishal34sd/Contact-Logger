import apiClient from './client.js';

export const authApi = {
  getAuthUrl: () => apiClient.get('/auth/hubspot'),
  getStatus: () => apiClient.get('/auth/hubspot/status'),
  disconnect: () => apiClient.post('/auth/hubspot/disconnect'),
};
