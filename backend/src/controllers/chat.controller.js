const groqService = require('../services/groq.service');
const conversationService = require('../services/conversation.service');
const ChatSchemas = require('../schemas/chat.schema');
const { config } = require('../config/env');

class ChatController {
  /**
   * Get conversation history
   */
  async getHistory(req, res, next) {
    try {
      const { userId } = req.params;

      const validation = ChatSchemas.validateUserId(userId);
      if (!validation.valid) {
        return res.status(400).json(
          ChatSchemas.createErrorResponse(validation.error)
        );
      }

      const conversations = await conversationService.getHistory(userId);

      res.json({
        conversations,
        count: conversations.length
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      next(error);
    }
  }

  /**
   * Clear conversation history
   */
  async clearHistory(req, res, next) {
    try {
      const { userId } = req.params;

      const validation = ChatSchemas.validateUserId(userId);
      if (!validation.valid) {
        return res.status(400).json(
          ChatSchemas.createErrorResponse(validation.error)
        );
      }

      const existed = await conversationService.clearHistory(userId);

      console.log(`Cleared conversation history for user: ${userId}`);

      res.json({
        success: true,
        message: 'Conversation history cleared',
        existed
      });
    } catch (error) {
      console.error('Error clearing conversation:', error);
      next(error);
    }
  }

  /**
   * Send message and get AI response (streaming)
   */
  async sendMessageStream(req, res, next) {
    try {
      const { userId, message } = req.body;

      // Validate request
      const validation = ChatSchemas.validateChatRequest(req.body);
      if (!validation.valid) {
        return res.status(400).json(
          ChatSchemas.createErrorResponse(validation.error)
        );
      }

      // Validate input
      const inputValidation = conversationService.validateInput(message);
      if (!inputValidation.valid) {
        return res.status(400).json(
          ChatSchemas.createErrorResponse(inputValidation.error || 'Invalid input')
        );
      }

      // Sanitize message
      const sanitizedMessage = conversationService.sanitizeInput(message);
      if (!sanitizedMessage) {
        return res.status(400).json(
          ChatSchemas.createErrorResponse('message cannot be empty after sanitization')
        );
      }

      // Create and store user message
      await conversationService.createUserMessage(userId, sanitizedMessage);

      // Get conversation history
      const history = await conversationService.getHistory(userId);

      // Determine message type and build prompt
      const isSelfInquiry = groqService.isSelfInquiry(sanitizedMessage);
      let messages;

      if (isSelfInquiry && history.length > 2) {
        messages = groqService.buildPersonalityProfileMessages(history, sanitizedMessage);
      } else {
        messages = groqService.buildRegularMessages(history);
      }

      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

      let fullContent = '';

      try {
        // Stream the response
        for await (const chunk of groqService.generateCompletionStream(messages, userId)) {
          fullContent += chunk;
          // Send chunk as SSE
          res.write(`data: ${JSON.stringify({ content: chunk, done: false })}\n\n`);
        }

        // Store assistant message
        await conversationService.createAssistantMessage(userId, fullContent);

        // Send completion signal
        res.write(`data: ${JSON.stringify({ content: '', done: true, tokensUsed: 0 })}\n\n`);
        res.end();

        console.log(`✅ Streaming response completed for user: ${userId}`);
      } catch (streamError) {
        console.error('❌ Error during streaming:', streamError);
        res.write(`data: ${JSON.stringify({ error: 'Streaming error occurred', done: true })}\n\n`);
        res.end();
      }
    } catch (error) {
      console.error('❌ Error in sendMessageStream:', error);
      if (!res.headersSent) {
        res.status(500).json(
          ChatSchemas.createErrorResponse(error.message)
        );
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message, done: true })}\n\n`);
        res.end();
      }
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(req, res, next) {
    try {
      const users = await conversationService.getAllUsers();
      const totalMessages = await conversationService.getTotalMessageCount();

      res.json({
        users,
        count: users.length,
        totalMessages
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      next(error);
    }
  }
}

module.exports = new ChatController();
