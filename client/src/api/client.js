import axios from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: '/api', // Proxied by Vite dev server to http://localhost:5000/api
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // If cookies are used in the future
});

// Interceptor for responses
apiClient.interceptors.response.use(
  (response) => {
    // Return just the data object from the standard API response ({ status, message, data, meta })
    return response.data;
  },
  (error) => {
    // Centralized error handling
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    
    // Don't show toast for 404s on status checks or expected empty states
    if (error.response?.status !== 404) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
