import axios from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://contact-logger.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

apiClient.interceptors.response.use(
  (response) => {

    return response.data;
  },
  (error) => {

    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';

    if (error.response?.status !== 404) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
