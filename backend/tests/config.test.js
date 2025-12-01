const { config, validateConfig } = require('../src/config/env');

describe('Configuration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('config object', () => {
    test('should have correct default values', () => {
      expect(config.port).toBeDefined();
      expect(config.nodeEnv).toBeDefined();
      expect(config.groq).toBeDefined();
      expect(config.groq.model).toBe('openai/gpt-oss-20b');
    });

    test('should use environment variables when provided', () => {
      process.env.PORT = '4000';
      process.env.NODE_ENV = 'production';
      const { config: newConfig } = require('../src/config/env');
      expect(newConfig.port).toBe('4000');
    });

    test('should have rate limit configuration', () => {
      expect(config.rateLimit).toBeDefined();
      expect(config.rateLimit.windowMs).toBe(60000);
      expect(config.rateLimit.maxRequests).toBe(20);
    });

    test('should have conversation configuration', () => {
      expect(config.conversation).toBeDefined();
      expect(config.conversation.maxMessageLength).toBe(5000);
      expect(config.conversation.maxHistoryLength).toBe(100);
    });
  });

  describe('validateConfig', () => {
    test('should throw error when GROQ_API_KEY is missing', () => {
      delete process.env.GROQ_API_KEY;
      expect(() => validateConfig()).toThrow('GROQ_API_KEY is required');
    });

    test('should not throw when GROQ_API_KEY is present', () => {
      process.env.GROQ_API_KEY = 'test-key';
      expect(() => validateConfig()).not.toThrow();
    });
  });
});
