const express = require('express');
const cors = require('cors');
const { config } = require('./config/env');
const routes = require('./routes');
const {
  jsonErrorHandler,
  globalErrorHandler,
  notFoundHandler,
  requestLogger
} = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.origin === '*' ? true : config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);
app.use(jsonErrorHandler);

// Routes
app.use(routes);

// Error handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
