const { config } = require('../config/env');
const ChatSchemas = require('../schemas/chat.schema');

/**
 * Handle JSON parsing errors
 */
const jsonErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json(
      ChatSchemas.createErrorResponse(
        'Invalid JSON',
        'Request body must be valid JSON'
      )
    );
  }
  next(err);
};

/**
 * Handle Groq specific errors
 */
const groqErrorHandler = (error, res) => {
  if (error.code === 'insufficient_quota' || error.code === 'rate_limit_exceeded') {
    return res.status(429).json(
      ChatSchemas.createErrorResponse(
        'Groq API rate limit exceeded',
        'Please wait a moment and try again'
      )
    );
  }

  if (error.code === 'invalid_api_key' || error.code === 'authentication_error') {
    return res.status(401).json(
      ChatSchemas.createErrorResponse(
        'Invalid Groq API key',
        'Please check your API key configuration'
      )
    );
  }

  if (error.code === 'model_not_found') {
    return res.status(400).json(
      ChatSchemas.createErrorResponse(
        'Model not available',
        'The requested model is not available'
      )
    );
  }

  if (error.code === 'context_length_exceeded') {
    return res.status(400).json(
      ChatSchemas.createErrorResponse(
        'Conversation too long',
        'Please start a new conversation'
      )
    );
  }

  return null;
};

/**
 * Global error handler
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Check for Groq errors
  const groqResponse = groqErrorHandler(err, res);
  if (groqResponse) return;

  // Generic error response
  res.status(err.status || 500).json(
    ChatSchemas.createErrorResponse(
      err.message || 'Internal Server Error',
      config.nodeEnv === 'development' ? err.stack : undefined,
      err.constructor.name
    )
  );
};

/**
 * 404 handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json(
    ChatSchemas.createErrorResponse('Not Found', `Path ${req.path} not found`)
  );
};

/**
 * Request logger middleware
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
};

module.exports = {
  jsonErrorHandler,
  globalErrorHandler,
  notFoundHandler,
  requestLogger,
  groqErrorHandler
};
