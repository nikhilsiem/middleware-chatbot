import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please try again');
    }
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error - check your connection');
    }
    throw error;
  }
);

export const chatAPI = {
  sendMessage: async (userId, message) => {
    const response = await api.post('/api/chat', { userId, message });
    return response.data;
  },

  getHistory: async (userId) => {
    const response = await api.get(`/api/conversations/${userId}`);
    return response.data;
  },

  clearHistory: async (userId) => {
    const response = await api.delete(`/api/conversations/${userId}`);
    return response.data;
  },

  testConnection: async () => {
    const response = await api.get('/test-openai');
    return response.data;
  }
};

export default api;
