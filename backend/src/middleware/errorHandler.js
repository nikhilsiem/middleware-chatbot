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
 * Handle OpenAI specific errors
 */
const openAIErrorHandler = (error, res) => {
  if (error.code === 'insufficient_quota') {
    return res.status(402).json(
      ChatSchemas.createErrorResponse(
        'OpenAI API quota exceeded',
        'Please check your OpenAI account billing'
      )
    );
  }

  if (error.code === 'invalid_api_key') {
    return res.status(401).json(
      ChatSchemas.createErrorResponse(
        'Invalid OpenAI API key',
        'Please check your API key configuration'
      )
    );
  }

  if (error.code === 'model_not_found') {
    return res.status(400).json(
      ChatSchemas.createErrorResponse(
        'Model not available',
        'The requested model is not available for your account'
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

  // Check for OpenAI errors
  const openAIResponse = openAIErrorHandler(err, res);
  if (openAIResponse) return;

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
  openAIErrorHandler
};
