require('dotenv').config();

const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
    timeout: 30000,
    maxRetries: 2
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  },
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 20
  },
  conversation: {
    maxMessageLength: 5000,
    maxHistoryLength: 100
  }
};

// Validate required environment variables
const validateConfig = () => {
  if (!config.groq.apiKey) {
    throw new Error('GROQ_API_KEY is required in environment variables');
  }
};

module.exports = { config, validateConfig };
