const Groq = require('groq-sdk');
const { config } = require('../config/env');

class GroqService {
  constructor() {
    this.client = null;
    this.initialize();
  }

  /**
   * Initialize Groq client
   */
  initialize() {
    try {
      this.client = new Groq({
        apiKey: config.groq.apiKey
      });
      console.log('✅ Groq client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Groq client:', error.message);
      throw error;
    }
  }

  /**
   * Test Groq connection
   * @returns {Promise<Object>}
   */
  async testConnection() {
    try {
      const completion = await this.client.chat.completions.create({
        model: config.groq.model,
        messages: [{ role: 'user', content: 'Say "Hello"' }],
        max_tokens: 10
      });

      return {
        success: true,
        model: config.groq.model,
        response: completion.choices[0].message.content
      };
    } catch (error) {
      throw this.handleGroqError(error);
    }
  }

  /**
   * Generate chat completion
   * @param {Array} messages - Array of message objects
   * @param {string} userId - User identifier for monitoring
   * @returns {Promise<Object>}
   */
  async generateCompletion(messages, userId) {
    try {
      console.log(`Calling Groq API with model: ${config.groq.model} for user: ${userId}`);

      const completion = await this.client.chat.completions.create({
        model: config.groq.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        stream: false
      });

      if (!completion.choices || completion.choices.length === 0) {
        throw new Error('No response from Groq');
      }

      return {
        content: completion.choices[0].message.content,
        tokensUsed: completion.usage?.total_tokens || 0
      };
    } catch (error) {
      throw this.handleGroqError(error);
    }
  }

  /**
   * Generate streaming chat completion
   * @param {Array} messages - Array of message objects
   * @param {string} userId - User identifier for monitoring
   * @returns {AsyncGenerator<string>}
   */
  async *generateCompletionStream(messages, userId) {
    try {
      console.log(`Calling Groq API (streaming) with model: ${config.groq.model} for user: ${userId}`);

      const stream = await this.client.chat.completions.create({
        model: config.groq.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        stream: true
      });

      let fullContent = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          yield content;
        }
      }

      // Return full content for storage
      return fullContent;
    } catch (error) {
      throw this.handleGroqError(error);
    }
  }

  /**
   * Build messages for personality profile
   * @param {Array} history - Conversation history
   * @param {string} currentMessage - Current user message
   * @returns {Array}
   */
  buildPersonalityProfileMessages(history, currentMessage) {
    const conversationContext = history
      .slice(0, -1)
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    return [
      {
        role: 'system',
        content: 'You are an insightful AI assistant that creates detailed personality profiles based on conversation history. Be specific, thoughtful, and reference actual things the user has said.'
      },
      {
        role: 'user',
        content: `Based on our entire conversation history below, create a detailed personality profile. Analyze interests, communication style, preferences, and personal details shared. Be insightful and specific, referencing actual things mentioned.

Conversation History:
${conversationContext}

Current question: ${currentMessage}`
      }
    ];
  }

  /**
   * Build messages for regular conversation
   * @param {Array} history - Recent conversation history
   * @returns {Array}
   */
  buildRegularMessages(history) {
    const systemMessage = {
      role: 'system',
      content: 'You are a friendly, engaging AI assistant that remembers context from the conversation. Be helpful, personable, and ask follow-up questions to learn more about the user.'
    };

    const recentHistory = history
      .slice(-6)
      .map(m => ({ role: m.role, content: m.content }));

    return [systemMessage, ...recentHistory];
  }

  /**
   * Check if message is a self-inquiry
   * @param {string} message - User message
   * @returns {boolean}
   */
  isSelfInquiry(message) {
    const selfInquiryKeywords = [
      'who am i',
      'tell me about myself',
      'what do you know about me',
      'describe me',
      'my personality',
      'what have i told you'
    ];

    return selfInquiryKeywords.some(keyword =>
      message.toLowerCase().includes(keyword)
    );
  }

  /**
   * Handle Groq specific errors
   * @param {Error} error - Original error
   * @returns {Error}
   */
  handleGroqError(error) {
    const enhancedError = new Error(error.message);
    enhancedError.code = error.code || error.error?.type;
    enhancedError.status = error.status || error.statusCode;
    enhancedError.type = error.type;
    enhancedError.originalError = error;

    return enhancedError;
  }
}

module.exports = new GroqService();
