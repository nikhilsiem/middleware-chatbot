const ChatSchemas = require('../src/schemas/chat.schema');

describe('Chat Schemas Tests', () => {
  describe('validateChatRequest', () => {
    test('should validate correct chat request', () => {
      const result = ChatSchemas.validateChatRequest({
        userId: 'user_123',
        message: 'Hello'
      });
      expect(result.valid).toBe(true);
    });

    test('should reject missing userId', () => {
      const result = ChatSchemas.validateChatRequest({
        message: 'Hello'
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('userId');
    });

    test('should reject non-string userId', () => {
      const result = ChatSchemas.validateChatRequest({
        userId: 123,
        message: 'Hello'
      });
      expect(result.valid).toBe(false);
    });

    test('should reject userId that is too long', () => {
      const result = ChatSchemas.validateChatRequest({
        userId: 'a'.repeat(101),
        message: 'Hello'
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too long');
    });

    test('should reject userId with invalid characters', () => {
      const result = ChatSchemas.validateChatRequest({
        userId: 'user@123',
        message: 'Hello'
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('invalid characters');
    });

    test('should reject missing message', () => {
      const result = ChatSchemas.validateChatRequest({
        userId: 'user_123'
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('message');
    });

    test('should reject non-string message', () => {
      const result = ChatSchemas.validateChatRequest({
        userId: 'user_123',
        message: 123
      });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateUserId', () => {
    test('should validate correct userId', () => {
      const result = ChatSchemas.validateUserId('user_123');
      expect(result.valid).toBe(true);
    });

    test('should accept userId with hyphens', () => {
      const result = ChatSchemas.validateUserId('user-123');
      expect(result.valid).toBe(true);
    });

    test('should reject empty userId', () => {
      const result = ChatSchemas.validateUserId('');
      expect(result.valid).toBe(false);
    });

    test('should reject null userId', () => {
      const result = ChatSchemas.validateUserId(null);
      expect(result.valid).toBe(false);
    });
  });

  describe('createMessage', () => {
    test('should create user message', () => {
      const message = ChatSchemas.createMessage('user', 'Hello');
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello');
      expect(message.timestamp).toBeDefined();
    });

    test('should create assistant message', () => {
      const message = ChatSchemas.createMessage('assistant', 'Hi there');
      expect(message.role).toBe('assistant');
      expect(message.content).toBe('Hi there');
    });

    test('should have valid ISO timestamp', () => {
      const message = ChatSchemas.createMessage('user', 'Test');
      expect(new Date(message.timestamp).toISOString()).toBe(message.timestamp);
    });
  });

  describe('createChatResponse', () => {
    test('should create chat response with all fields', () => {
      const response = ChatSchemas.createChatResponse('Hello', 5, 100);
      expect(response.message).toBe('Hello');
      expect(response.conversationLength).toBe(5);
      expect(response.tokensUsed).toBe(100);
    });
  });

  describe('createErrorResponse', () => {
    test('should create error response with message only', () => {
      const response = ChatSchemas.createErrorResponse('Error occurred');
      expect(response.error).toBe('Error occurred');
      expect(response.details).toBeUndefined();
    });

    test('should create error response with details', () => {
      const response = ChatSchemas.createErrorResponse('Error', 'Details here');
      expect(response.error).toBe('Error');
      expect(response.details).toBe('Details here');
    });

    test('should create error response with all fields', () => {
      const response = ChatSchemas.createErrorResponse('Error', 'Details', 'TypeError');
      expect(response.error).toBe('Error');
      expect(response.details).toBe('Details');
      expect(response.errorType).toBe('TypeError');
    });
  });
});
