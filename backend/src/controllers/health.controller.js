const groqService = require('../services/groq.service');

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
   * Test Groq connection
   */
  async testGroq(req, res, next) {
    try {
      console.log('Testing Groq connection...');
      const result = await groqService.testConnection();
      console.log('✅ Groq connection successful');
      res.json(result);
    } catch (error) {
      console.error('❌ Groq connection failed:', error.message);
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
