export const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9);
};

export const getUserId = () => {
  let id = localStorage.getItem('chatbot_user_id');
  if (!id) {
    id = generateUserId();
    localStorage.setItem('chatbot_user_id', id);
  }
  return id;
};

export const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString();
};

export const getErrorMessage = (error) => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return data.error || 'Invalid request';
      case 401:
        return 'Authentication failed - check API key';
      case 402:
        return 'API quota exceeded - check your billing';
      case 429:
        return `Too many requests. Please wait ${data.retryAfter || 60} seconds.`;
      case 500:
        return 'Server error - please try again later';
      default:
        return data.error || data.details || 'An error occurred';
    }
  }

  return error.message || 'An unexpected error occurred';
};
