export const MAX_MESSAGE_LENGTH = 5000;
export const RETRY_DELAY = 2000;
export const MAX_RETRIES = 3;

export const SELF_INQUIRY_KEYWORDS = [
  'who am i',
  'tell me about myself',
  'what do you know about me',
  'describe me',
  'my personality',
  'what have i told you'
];

export const ERROR_MESSAGES = {
  NETWORK: 'Network error - check your connection',
  TIMEOUT: 'Request timeout - please try again',
  OFFLINE: 'You are offline. Please check your internet connection.',
  TOO_LONG: (max) => `Message is too long (max ${max} characters)`,
  GENERIC: 'Failed to get response. Please try again.'
};
