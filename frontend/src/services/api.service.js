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
  sendMessageStream: async (userId, message, onChunk, onComplete, onError) => {
    try {
      const response = await fetch(`${API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Streaming request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                onError?.(new Error(data.error));
                return;
              }

              if (data.done) {
                onComplete?.(data);
                return;
              }

              if (data.content) {
                onChunk?.(data.content);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      onError?.(error);
      throw error;
    }
  },

  getHistory: async (userId) => {
    const response = await api.get(`/api/conversations/${userId}`);
    return response.data;
  },

  clearHistory: async (userId) => {
    const response = await api.delete(`/api/conversations/${userId}`);
    return response.data;
  }
};

export default api;
