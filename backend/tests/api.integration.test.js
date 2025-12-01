const request = require('supertest');
const app = require('../src/app');

describe('API Integration Tests', () => {
  describe('GET /health', () => {
    test('should return 200 and health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
    });
  });

  describe('GET /api/conversations/:userId', () => {
    test('should return empty array for new user', async () => {
      const response = await request(app)
        .get('/api/conversations/test_user_new');
      
      expect(response.status).toBe(200);
      expect(response.body.conversations).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    test('should return 400 for invalid userId', async () => {
      const response = await request(app)
        .get('/api/conversations/invalid@user');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for userId that is too long', async () => {
      const longUserId = 'a'.repeat(101);
      const response = await request(app)
        .get(`/api/conversations/${longUserId}`);
      
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/chat', () => {
    test('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 when message is missing', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ userId: 'test_user' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for invalid userId format', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ userId: 'invalid@user', message: 'Hello' });
      
      expect(response.status).toBe(400);
    });

    test('should return 400 for empty message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ userId: 'test_user', message: '   ' });
      
      expect(response.status).toBe(400);
    });

    test('should return 400 for message that is too long', async () => {
      const longMessage = 'a'.repeat(5001);
      const response = await request(app)
        .post('/api/chat')
        .send({ userId: 'test_user', message: longMessage });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('too long');
    });

    test('should return 429 when rate limit exceeded', async () => {
      const userId = 'rate_limit_test_user';
      
      // Make 20 requests (the limit)
      for (let i = 0; i < 20; i++) {
        await request(app)
          .post('/api/chat')
          .send({ userId, message: `Message ${i}` });
      }
      
      // 21st request should be rate limited
      const response = await request(app)
        .post('/api/chat')
        .send({ userId, message: 'One more' });
      
      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('error', 'Too many requests');
      expect(response.body).toHaveProperty('retryAfter');
    }, 30000);
  });

  describe('DELETE /api/conversations/:userId', () => {
    test('should clear conversation history', async () => {
      const userId = 'test_clear_user';
      
      // First, create some history (this will fail without Groq, but that's ok for this test)
      await request(app)
        .post('/api/chat')
        .send({ userId, message: 'Hello' })
        .catch(() => {});
      
      // Clear history
      const response = await request(app)
        .delete(`/api/conversations/${userId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    test('should return 400 for invalid userId', async () => {
      const response = await request(app)
        .delete('/api/conversations/invalid@user');
      
      expect(response.status).toBe(400);
    });

    test('should handle non-existent user gracefully', async () => {
      const response = await request(app)
        .delete('/api/conversations/nonexistent_user');
      
      expect(response.status).toBe(200);
      expect(response.body.existed).toBe(false);
    });
  });

  describe('GET /api/users', () => {
    test('should return list of users', async () => {
      const response = await request(app).get('/api/users');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('totalMessages');
      expect(Array.isArray(response.body.users)).toBe(true);
    });
  });

  describe('404 Handler', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown/route');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body).toHaveProperty('path', '/unknown/route');
    });
  });

  describe('JSON Error Handler', () => {
    test('should return 400 for invalid JSON', async () => {
      const response = await request(app)
        .post('/api/chat')
        .set('Content-Type', 'application/json')
        .send('invalid json{');
      
      expect(response.status).toBe(400);
    });
  });
});
