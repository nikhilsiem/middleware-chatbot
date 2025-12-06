const express = require('express');
const chatController = require('../controllers/chat.controller');
const rateLimiter = require('../middleware/rateLimit');

const router = express.Router();

// Apply rate limiting to chat routes
router.use(rateLimiter.middleware());

// Chat routes
router.post('/chat/stream', chatController.sendMessageStream.bind(chatController));
router.get('/conversations/:userId', chatController.getHistory.bind(chatController));
router.delete('/conversations/:userId', chatController.clearHistory.bind(chatController));
router.get('/users', chatController.getAllUsers.bind(chatController));

module.exports = router;
