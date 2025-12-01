const request = require('supertest');
const express = require('express');

describe('AI Chatbot Backend Tests', () => {
  let app;
  
  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    const conversations = new Map();
    
    app.post('/api/chat', (req, res) => {
      const { userId, message } = req.body;
      if (!userId || !message) {
        return res.status(400).json({ error: 'userId and message are required' });
      }
      
      let history = conversations.get(userId) || [];
      history.push({ role: 'user', content: message, timestamp: new Date().toISOString() });
      
      const isSelfInquiry = message.toLowerCase().includes('who am i');
      const response = isSelfInquiry && history.length > 2
        ? 'Based on our conversation, you seem interested in AI and testing!'
        : 'Thanks for your message!';
      
      history.push({ role: 'assistant', content: response, timestamp: new Date().toISOString() });
      conversations.set(userId, history);
      
      res.json({ message: response, conversationLength: history.length });
    });
    
    app.get('/api/conversations/:userId', (req, res) => {
      const history = conversations.get(req.params.userId) || [];
      res.json({ conversations: history });
    });
    
    app.delete('/api/conversations/:userId', (req, res) => {
      conversations.delete(req.params.userId);
      res.json({ success: true });
    });
  });

  test('POST /api/chat - should send message and receive response', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({ userId: 'test-user-1', message: 'Hello, AI!' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.conversationLength).toBe(2);
  });

  test('POST /api/chat - should return 400 for missing userId', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({ message: 'Hello' });

    expect(response.status).toBe(400);
  });

  test('Personality profile generation after multiple messages', async () => {
    const userId = 'test-user-profile';

    await request(app).post('/api/chat').send({ userId, message: 'I love programming' });
    await request(app).post('/api/chat').send({ userId, message: 'I enjoy hiking' });
    await request(app).post('/api/chat').send({ userId, message: 'JavaScript is my favorite' });

    const response = await request(app).post('/api/chat').send({ userId, message: 'Who am I?' });

    expect(response.status).toBe(200);
    expect(response.body.conversationLength).toBeGreaterThan(6);
  });

  test('GET /api/conversations/:userId - should retrieve history', async () => {
    const userId = 'test-user-history';

    await request(app).post('/api/chat').send({ userId, message: 'Test 1' });
    await request(app).post('/api/chat').send({ userId, message: 'Test 2' });

    const response = await request(app).get(`/api/conversations/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body.conversations.length).toBe(4);
  });

  test('DELETE /api/conversations/:userId - should clear history', async () => {
    const userId = 'test-user-delete';

    await request(app).post('/api/chat').send({ userId, message: 'Test' });
    await request(app).delete(`/api/conversations/${userId}`);

    const response = await request(app).get(`/api/conversations/${userId}`);
    expect(response.body.conversations).toEqual([]);
  });
});
