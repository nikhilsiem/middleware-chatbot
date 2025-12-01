const conversationService = require('../src/services/conversation.service');

describe('Conversation Service Tests', () => {
  beforeEach(() => {
    // Clear all conversations before each test
    conversationService.conversations = new Map();
  });

  describe('getHistory', () => {
    test('should return empty array for new user', () => {
      const history = conversationService.getHistory('user_123');
      expect(history).toEqual([]);
    });

    test('should return existing history', () => {
      const message = { role: 'user', content: 'Hello', timestamp: new Date().toISOString() };
      conversationService.conversations.set('user_123', [message]);
      
      const history = conversationService.getHistory('user_123');
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(message);
    });
  });

  describe('addMessage', () => {
    test('should add message to empty history', () => {
      const message = { role: 'user', content: 'Hello', timestamp: new Date().toISOString() };
      conversationService.addMessage('user_123', message);
      
      const history = conversationService.getHistory('user_123');
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(message);
    });

    test('should add message to existing history', () => {
      const message1 = { role: 'user', content: 'Hello', timestamp: new Date().toISOString() };
      const message2 = { role: 'assistant', content: 'Hi', timestamp: new Date().toISOString() };
      
      conversationService.addMessage('user_123', message1);
      conversationService.addMessage('user_123', message2);
      
      const history = conversationService.getHistory('user_123');
      expect(history).toHaveLength(2);
    });

    test('should trim history when exceeding max length', () => {
      // Add more than max messages
      for (let i = 0; i < 105; i++) {
        conversationService.addMessage('user_123', {
          role: 'user',
          content: `Message ${i}`,
          timestamp: new Date().toISOString()
        });
      }
      
      const history = conversationService.getHistory('user_123');
      expect(history.length).toBeLessThanOrEqual(100);
    });
  });

  describe('clearHistory', () => {
    test('should clear existing history', () => {
      conversationService.addMessage('user_123', {
        role: 'user',
        content: 'Hello',
        timestamp: new Date().toISOString()
      });
      
      const existed = conversationService.clearHistory('user_123');
      expect(existed).toBe(true);
      expect(conversationService.getHistory('user_123')).toEqual([]);
    });

    test('should return false for non-existent user', () => {
      const existed = conversationService.clearHistory('user_999');
      expect(existed).toBe(false);
    });
  });

  describe('getAllUsers', () => {
    test('should return empty array when no users', () => {
      const users = conversationService.getAllUsers();
      expect(users).toEqual([]);
    });

    test('should return all user IDs', () => {
      conversationService.addMessage('user_1', { role: 'user', content: 'Hi', timestamp: new Date().toISOString() });
      conversationService.addMessage('user_2', { role: 'user', content: 'Hello', timestamp: new Date().toISOString() });
      
      const users = conversationService.getAllUsers();
      expect(users).toHaveLength(2);
      expect(users).toContain('user_1');
      expect(users).toContain('user_2');
    });
  });

  describe('getTotalMessageCount', () => {
    test('should return 0 when no messages', () => {
      const count = conversationService.getTotalMessageCount();
      expect(count).toBe(0);
    });

    test('should return correct total count', () => {
      conversationService.addMessage('user_1', { role: 'user', content: 'Hi', timestamp: new Date().toISOString() });
      conversationService.addMessage('user_1', { role: 'assistant', content: 'Hello', timestamp: new Date().toISOString() });
      conversationService.addMessage('user_2', { role: 'user', content: 'Hey', timestamp: new Date().toISOString() });
      
      const count = conversationService.getTotalMessageCount();
      expect(count).toBe(3);
    });
  });

  describe('sanitizeInput', () => {
    test('should trim whitespace', () => {
      const result = conversationService.sanitizeInput('  Hello  ');
      expect(result).toBe('Hello');
    });

    test('should truncate long messages', () => {
      const longMessage = 'a'.repeat(6000);
      const result = conversationService.sanitizeInput(longMessage);
      expect(result.length).toBe(5000);
    });

    test('should return empty string for non-string input', () => {
      expect(conversationService.sanitizeInput(123)).toBe('');
      expect(conversationService.sanitizeInput(null)).toBe('');
      expect(conversationService.sanitizeInput(undefined)).toBe('');
    });
  });

  describe('createUserMessage', () => {
    test('should create and store user message', () => {
      const message = conversationService.createUserMessage('user_123', 'Hello');
      
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello');
      expect(message.timestamp).toBeDefined();
      
      const history = conversationService.getHistory('user_123');
      expect(history).toHaveLength(1);
    });

    test('should sanitize content', () => {
      const message = conversationService.createUserMessage('user_123', '  Hello  ');
      expect(message.content).toBe('Hello');
    });
  });

  describe('createAssistantMessage', () => {
    test('should create and store assistant message', () => {
      const message = conversationService.createAssistantMessage('user_123', 'Hi there');
      
      expect(message.role).toBe('assistant');
      expect(message.content).toBe('Hi there');
      expect(message.timestamp).toBeDefined();
      
      const history = conversationService.getHistory('user_123');
      expect(history).toHaveLength(1);
    });
  });
});
