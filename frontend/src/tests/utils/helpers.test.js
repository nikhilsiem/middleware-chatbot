import { describe, test, expect, beforeEach, vi } from 'vitest';
import { generateUserId, getUserId, formatTimestamp, getErrorMessage } from '../../utils/helpers';

describe('Helpers Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('generateUserId', () => {
    test('should generate userId with correct prefix', () => {
      const userId = generateUserId();
      expect(userId).toMatch(/^user_/);
    });

    test('should generate unique IDs', () => {
      const id1 = generateUserId();
      const id2 = generateUserId();
      expect(id1).not.toBe(id2);
    });

    test('should generate alphanumeric IDs', () => {
      const userId = generateUserId();
      expect(userId).toMatch(/^user_[a-z0-9]+$/);
    });
  });

  describe('getUserId', () => {
    test('should return existing userId from localStorage', () => {
      const existingId = 'user_existing123';
      localStorage.getItem.mockReturnValue(existingId);
      
      const userId = getUserId();
      expect(userId).toBe(existingId);
      expect(localStorage.getItem).toHaveBeenCalledWith('chatbot_user_id');
    });

    test('should generate and store new userId if none exists', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const userId = getUserId();
      expect(userId).toMatch(/^user_/);
      expect(localStorage.setItem).toHaveBeenCalledWith('chatbot_user_id', userId);
    });
  });

  describe('formatTimestamp', () => {
    test('should format ISO timestamp to locale time string', () => {
      const timestamp = '2024-01-01T12:00:00.000Z';
      const formatted = formatTimestamp(timestamp);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    test('should handle current timestamp', () => {
      const timestamp = new Date().toISOString();
      const formatted = formatTimestamp(timestamp);
      expect(formatted).toBeTruthy();
    });
  });

  describe('getErrorMessage', () => {
    test('should return error message for 400 status', () => {
      const error = {
        response: {
          status: 400,
          data: { error: 'Bad Request' }
        }
      };
      expect(getErrorMessage(error)).toBe('Bad Request');
    });

    test('should return default message for 400 without error field', () => {
      const error = {
        response: {
          status: 400,
          data: {}
        }
      };
      expect(getErrorMessage(error)).toBe('Invalid request');
    });

    test('should return auth error for 401', () => {
      const error = {
        response: {
          status: 401,
          data: {}
        }
      };
      expect(getErrorMessage(error)).toContain('Authentication failed');
    });

    test('should return quota error for 402', () => {
      const error = {
        response: {
          status: 402,
          data: {}
        }
      };
      expect(getErrorMessage(error)).toContain('quota exceeded');
    });

    test('should return rate limit error for 429', () => {
      const error = {
        response: {
          status: 429,
          data: { retryAfter: 60 }
        }
      };
      const message = getErrorMessage(error);
      expect(message).toContain('Too many requests');
      expect(message).toContain('60');
    });

    test('should return server error for 500', () => {
      const error = {
        response: {
          status: 500,
          data: {}
        }
      };
      expect(getErrorMessage(error)).toContain('Server error');
    });

    test('should return error message when no response', () => {
      const error = {
        message: 'Network Error'
      };
      expect(getErrorMessage(error)).toBe('Network Error');
    });

    test('should return default message when no error info', () => {
      const error = {};
      expect(getErrorMessage(error)).toBe('An unexpected error occurred');
    });
  });
});
