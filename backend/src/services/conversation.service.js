const { config } = require('../config/env');
const ChatSchemas = require('../schemas/chat.schema');
const { pool } = require('../config/database');
const { sanitizeInput: enhancedSanitize, validateInput } = require('../utils/validation');

class ConversationService {
  constructor() {
    // Fallback to in-memory storage if database is not configured
    this.conversations = new Map();
    this.useDatabase = config.database.enabled;
  }

  /**
   * Get conversation history for a user
   * @param {string} userId - User identifier
   * @returns {Promise<Array>|Array}
   */
  async getHistory(userId) {
    if (this.useDatabase) {
      try {
        const result = await pool.query(
          'SELECT role, content, created_at as timestamp FROM messages WHERE user_id = $1 ORDER BY created_at ASC',
          [userId]
        );
        return result.rows.map(row => ({
          role: row.role,
          content: row.content,
          timestamp: row.timestamp.toISOString()
        }));
      } catch (error) {
        console.error('Error fetching history from database:', error);
        // Fallback to in-memory
        return this.conversations.get(userId) || [];
      }
    }
    return this.conversations.get(userId) || [];
  }

  /**
   * Add message to conversation history
   * @param {string} userId - User identifier
   * @param {Object} message - Message object
   */
  async addMessage(userId, message) {
    if (this.useDatabase) {
      try {
        await pool.query(
          'INSERT INTO messages (user_id, role, content) VALUES ($1, $2, $3)',
          [userId, message.role, message.content]
        );
        // Trim history if it exceeds max length
        const history = await this.getHistory(userId);
        if (history.length > config.conversation.maxHistoryLength) {
          const messagesToDelete = history.length - config.conversation.maxHistoryLength;
          await pool.query(
            `DELETE FROM messages 
             WHERE user_id = $1 
             AND id IN (
               SELECT id FROM messages 
               WHERE user_id = $1 
               ORDER BY created_at ASC 
               LIMIT $2
             )`,
            [userId, messagesToDelete]
          );
        }
      } catch (error) {
        console.error('Error saving message to database:', error);
        // Fallback to in-memory
        let history = this.conversations.get(userId) || [];
        history.push(message);
        history = this.trimHistory(history);
        this.conversations.set(userId, history);
      }
    } else {
      let history = await this.getHistory(userId);
      history.push(message);
      history = this.trimHistory(history);
      this.conversations.set(userId, history);
    }
  }

  /**
   * Clear conversation history for a user
   * @param {string} userId - User identifier
   * @returns {Promise<boolean>|boolean} - Whether history existed
   */
  async clearHistory(userId) {
    if (this.useDatabase) {
      try {
        const result = await pool.query(
          'DELETE FROM messages WHERE user_id = $1',
          [userId]
        );
        return result.rowCount > 0;
      } catch (error) {
        console.error('Error clearing history from database:', error);
        const existed = this.conversations.has(userId);
        this.conversations.delete(userId);
        return existed;
      }
    }
    const existed = this.conversations.has(userId);
    this.conversations.delete(userId);
    return existed;
  }

  /**
   * Get all user IDs
   * @returns {Promise<Array<string>>|Array<string>}
   */
  async getAllUsers() {
    if (this.useDatabase) {
      try {
        const result = await pool.query(
          'SELECT DISTINCT user_id FROM messages'
        );
        return result.rows.map(row => row.user_id);
      } catch (error) {
        console.error('Error fetching users from database:', error);
        return Array.from(this.conversations.keys());
      }
    }
    return Array.from(this.conversations.keys());
  }

  /**
   * Get total message count across all users
   * @returns {Promise<number>|number}
   */
  async getTotalMessageCount() {
    if (this.useDatabase) {
      try {
        const result = await pool.query('SELECT COUNT(*) as count FROM messages');
        return parseInt(result.rows[0].count, 10);
      } catch (error) {
        console.error('Error fetching message count from database:', error);
        return Array.from(this.conversations.values())
          .reduce((sum, history) => sum + history.length, 0);
      }
    }
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
    return enhancedSanitize(input, config.conversation.maxMessageLength);
  }

  /**
   * Validate user input
   * @param {string} input - User input
   * @returns {{valid: boolean, error?: string}}
   */
  validateInput(input) {
    return validateInput(input, config.conversation.maxMessageLength);
  }

  /**
   * Create and store user message
   * @param {string} userId - User identifier
   * @param {string} content - Message content
   * @returns {Promise<Object>|Object}
   */
  async createUserMessage(userId, content) {
    const sanitized = this.sanitizeInput(content);
    const message = ChatSchemas.createMessage('user', sanitized);
    await this.addMessage(userId, message);
    return message;
  }

  /**
   * Create and store assistant message
   * @param {string} userId - User identifier
   * @param {string} content - Message content
   * @returns {Promise<Object>|Object}
   */
  async createAssistantMessage(userId, content) {
    const message = ChatSchemas.createMessage('assistant', content);
    await this.addMessage(userId, message);
    return message;
  }
}

module.exports = new ConversationService();
