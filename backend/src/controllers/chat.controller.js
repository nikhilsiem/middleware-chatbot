const openAIService = require('../services/openai.service');
const conversationService = require('../services/conversation.service');
const ChatSchemas = require('../schemas/chat.schema');
const { config } = require('../config/env');

class ChatController {
  /**
   * Send message and get AI response
   */
  async sendMessage(req, res, next) {
    try {
      const { userId, message } = req.body;

      // Validate request
      const validation = ChatSchemas.validateChatRequest(req.body);
      if (!validation.valid) {
        return res.status(400).json(
          ChatSchemas.createErrorResponse(validation.error)
        );
      }

      // Sanitize and validate message
      const sanitizedMessage = conversationService.sanitizeInput(message);
      if (!sanitizedMessage) {
        return res.status(400).json(
          ChatSchemas.createErrorResponse('message cannot be empty after sanitization')
        );
      }

      if (sanitizedMessage.length > config.conversation.maxMessageLength) {
        return res.status(400).json(
          ChatSchemas.createErrorResponse(
            `message is too long (max ${config.conversation.maxMessageLength} characters)`
          )
        );
      }

      // Create and store user message
      conversationService.createUserMessage(userId, sanitizedMessage);

      // Get conversation history
      const history = conversationService.getHistory(userId);

      // Determine message type and build prompt
      const isSelfInquiry = openAIService.isSelfInquiry(sanitizedMessage);
      let messages;

      if (isSelfInquiry && history.length > 2) {
        messages = openAIService.buildPersonalityProfileMessages(history, sanitizedMessage);
      } else {
        messages = openAIService.buildRegularMessages(history);
      }

      // Generate AI response
      const completion = await openAIService.generateCompletion(messages, userId);

      // Store assistant message
      conversationService.createAssistantMessage(userId, completion.content);

      // Get updated history
      const updatedHistory = conversationService.getHistory(userId);

      console.log(`✅ Response generated for user: ${userId}`);

      // Send response
      res.json(
        ChatSchemas.createChatResponse(
          completion.content,
          updatedHistory.length,
          completion.tokensUsed
        )
      );
    } catch (error) {
      console.error('❌ Error in sendMessage:', error);
      next(error);
    }
  }

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

      const conversations = conversationService.getHistory(userId);

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

      const existed = conversationService.clearHistory(userId);

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
   * Get all users
   */
  async getAllUsers(req, res, next) {
    try {
      const users = conversationService.getAllUsers();
      const totalMessages = conversationService.getTotalMessageCount();

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
