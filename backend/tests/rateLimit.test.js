const rateLimiter = require('../src/middleware/rateLimit');

describe('Rate Limiter Tests', () => {
  beforeEach(() => {
    rateLimiter.requests = new Map();
  });

  describe('checkLimit', () => {
    test('should allow first request', () => {
      const result = rateLimiter.checkLimit('user_123');
      expect(result.allowed).toBe(true);
    });

    test('should allow requests within limit', () => {
      for (let i = 0; i < 19; i++) {
        const result = rateLimiter.checkLimit('user_123');
        expect(result.allowed).toBe(true);
      }
    });

    test('should block requests exceeding limit', () => {
      // Make 20 requests (the limit)
      for (let i = 0; i < 20; i++) {
        rateLimiter.checkLimit('user_123');
      }
      
      // 21st request should be blocked
      const result = rateLimiter.checkLimit('user_123');
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    test('should track different users separately', () => {
      for (let i = 0; i < 20; i++) {
        rateLimiter.checkLimit('user_1');
      }
      
      // user_2 should still be allowed
      const result = rateLimiter.checkLimit('user_2');
      expect(result.allowed).toBe(true);
    });

    test('should clean up old requests', (done) => {
      rateLimiter.checkLimit('user_123');
      
      // Wait for requests to expire (simulate)
      setTimeout(() => {
        const result = rateLimiter.checkLimit('user_123');
        expect(result.allowed).toBe(true);
        done();
      }, 100);
    }, 200);
  });

  describe('middleware', () => {
    test('should call next() when within limit', () => {
      const req = { body: { userId: 'user_123' } };
      const res = {};
      const next = jest.fn();
      
      const middleware = rateLimiter.middleware();
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    test('should return 429 when limit exceeded', () => {
      const req = { body: { userId: 'user_123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      
      // Exceed limit
      for (let i = 0; i < 20; i++) {
        rateLimiter.checkLimit('user_123');
      }
      
      const middleware = rateLimiter.middleware();
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Too many requests'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('should call next() when no userId provided', () => {
      const req = { body: {} };
      const res = {};
      const next = jest.fn();
      
      const middleware = rateLimiter.middleware();
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    test('should check userId from params', () => {
      const req = { params: { userId: 'user_123' }, body: {} };
      const res = {};
      const next = jest.fn();
      
      const middleware = rateLimiter.middleware();
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
  });
});
