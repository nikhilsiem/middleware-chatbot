/**
 * Chat Request Schema
 * @typedef {Object} ChatRequest
 * @property {string} userId - Unique user identifier
 * @property {string} message - User message content
 */

/**
 * Chat Response Schema
 * @typedef {Object} ChatResponse
 * @property {string} message - AI assistant response
 * @property {number} conversationLength - Total messages in conversation
 * @property {number} tokensUsed - Tokens consumed by the request
 */

/**
 * Message Schema
 * @typedef {Object} Message
 * @property {('user'|'assistant')} role - Message sender role
 * @property {string} content - Message content
 * @property {string} timestamp - ISO timestamp
 */

/**
 * Error Response Schema
 * @typedef {Object} ErrorResponse
 * @property {string} error - Error message
 * @property {string} [details] - Additional error details
 * @property {string} [errorType] - Error type/class name
 */

/**
 * Conversation History Response Schema
 * @typedef {Object} ConversationHistoryResponse
 * @property {Message[]} conversations - Array of messages
 * @property {number} count - Total message count
 */

/**
 * Health Check Response Schema
 * @typedef {Object} HealthCheckResponse
 * @property {string} status - Server status
 * @property {string} timestamp - Current timestamp
 * @property {number} uptime - Server uptime in seconds
 * @property {Object} memory - Memory usage information
 */

/**
 * Validation result
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string} [error] - Error message if validation failed
 */

/**
 * Rate limit result
 * @typedef {Object} RateLimitResult
 * @property {boolean} allowed - Whether request is allowed
 * @property {number} [retryAfter] - Seconds to wait before retry
 */

class ChatSchemas {
  /**
   * Validate chat request
   * @param {Object} body - Request body
   * @returns {ValidationResult}
   */
  static validateChatRequest(body) {
    const { userId, message } = body;

    if (!userId || typeof userId !== 'string') {
      return { valid: false, error: 'userId must be a non-empty string' };
    }

    if (userId.length > 100) {
      return { valid: false, error: 'userId is too long (max 100 characters)' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
      return { valid: false, error: 'userId contains invalid characters' };
    }

    if (!message || typeof message !== 'string') {
      return { valid: false, error: 'message must be a non-empty string' };
    }

    return { valid: true };
  }

  /**
   * Validate user ID
   * @param {string} userId - User identifier
   * @returns {ValidationResult}
   */
  static validateUserId(userId) {
    if (!userId || typeof userId !== 'string') {
      return { valid: false, error: 'userId must be a non-empty string' };
    }

    if (userId.length > 100) {
      return { valid: false, error: 'userId is too long (max 100 characters)' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
      return { valid: false, error: 'userId contains invalid characters' };
    }

    return { valid: true };
  }

  /**
   * Create message object
   * @param {('user'|'assistant')} role - Message role
   * @param {string} content - Message content
   * @returns {Message}
   */
  static createMessage(role, content) {
    return {
      role,
      content,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create chat response
   * @param {string} message - AI response message
   * @param {number} conversationLength - Total messages
   * @param {number} tokensUsed - Tokens consumed
   * @returns {ChatResponse}
   */
  static createChatResponse(message, conversationLength, tokensUsed) {
    return {
      message,
      conversationLength,
      tokensUsed
    };
  }

  /**
   * Create error response
   * @param {string} error - Error message
   * @param {string} [details] - Additional details
   * @param {string} [errorType] - Error type
   * @returns {ErrorResponse}
   */
  static createErrorResponse(error, details, errorType) {
    const response = { error };
    if (details) response.details = details;
    if (errorType) response.errorType = errorType;
    return response;
  }
}

module.exports = ChatSchemas;
