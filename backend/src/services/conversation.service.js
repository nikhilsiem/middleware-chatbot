const { config } = require('../config/env');
const ChatSchemas = require('../schemas/chat.schema');

class ConversationService {
  constructor() {
    // In-memory storage (replace with database in production)
    this.conversations = new Map();
  }

  /**
   * Get conversation history for a user
   * @param {string} userId - User identifier
   * @returns {Array}
   */
  getHistory(userId) {
    return this.conversations.get(userId) || [];
  }

  /**
   * Add message to conversation history
   * @param {string} userId - User identifier
   * @param {Object} message - Message object
   */
  addMessage(userId, message) {
    let history = this.getHistory(userId);
    history.push(message);
    history = this.trimHistory(history);
    this.conversations.set(userId, history);
  }

  /**
   * Clear conversation history for a user
   * @param {string} userId - User identifier
   * @returns {boolean} - Whether history existed
   */
  clearHistory(userId) {
    const existed = this.conversations.has(userId);
    this.conversations.delete(userId);
    return existed;
  }

  /**
   * Get all user IDs
   * @returns {Array<string>}
   */
  getAllUsers() {
    return Array.from(this.conversations.keys());
  }

  /**
   * Get total message count across all users
   * @returns {number}
   */
  getTotalMessageCount() {
    return Array.from(this.conversations.values())
      .reduce((sum, history) => sum + history.length, 0);
  }

  /**
   * Trim conversation history to max length
   * @param {Array} history - Conversation history
   * @returns {Array}
   */
  trimHistory(history) {
    if (history.length > config.conversation.maxHistoryLength) {
      return history.slice(-config.conversation.maxHistoryLength);
    }
    return history;
  }

  /**
   * Sanitize user input
   * @param {string} input - User input
   * @returns {string}
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim().substring(0, config.conversation.maxMessageLength);
  }

  /**
   * Create and store user message
   * @param {string} userId - User identifier
   * @param {string} content - Message content
   * @returns {Object}
   */
  createUserMessage(userId, content) {
    const sanitized = this.sanitizeInput(content);
    const message = ChatSchemas.createMessage('user', sanitized);
    this.addMessage(userId, message);
    return message;
  }

  /**
   * Create and store assistant message
   * @param {string} userId - User identifier
   * @param {string} content - Message content
   * @returns {Object}
   */
  createAssistantMessage(userId, content) {
    const message = ChatSchemas.createMessage('assistant', content);
    this.addMessage(userId, message);
    return message;
  }
}

module.exports = new ConversationService();
