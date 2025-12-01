const openAIService = require('../services/openai.service');

class HealthController {
  /**
   * Health check endpoint
   */
  async healthCheck(req, res, next) {
    try {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test OpenAI connection
   */
  async testOpenAI(req, res, next) {
    try {
      console.log('Testing OpenAI connection...');
      const result = await openAIService.testConnection();
      console.log('✅ OpenAI connection successful');
      res.json(result);
    } catch (error) {
      console.error('❌ OpenAI connection failed:', error.message);
      res.status(500).json({
        success: false,
        error: error.message,
        errorType: error.constructor.name,
        errorCode: error.code || 'UNKNOWN'
      });
    }
  }
}

module.exports = new HealthController();
