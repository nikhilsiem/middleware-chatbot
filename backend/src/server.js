const app = require('./app');
const { config, validateConfig } = require('./config/env');
const { initializeDatabase, testConnection } = require('./config/database');

// Validate environment variables
try {
  validateConfig();
  console.log('✅ Environment variables validated');
} catch (error) {
  console.error('❌', error.message);
  process.exit(1);
}

// Initialize database (if configured)
const initDatabase = async () => {
  if (config.database.enabled) {
    await initializeDatabase();
    await testConnection();
  } else {
    console.log('ℹ️  Database not configured - using in-memory storage');
  }
};

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Initialize database and start server
initDatabase().then(() => {
  // Start server
  const server = app.listen(config.port, () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📡 Health check: http://localhost:${config.port}/health`);
  console.log(`🧪 Test Groq: http://localhost:${config.port}/test-groq`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🤖 Model: ${config.groq.model}`);
  console.log('=================================');
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${config.port} is already in use`);
    } else {
      console.error('❌ Server error:', error);
    }
    process.exit(1);
  });

  module.exports = server;
}).catch((error) => {
  console.error('❌ Failed to initialize database:', error);
  // In development, continue without database
  if (config.nodeEnv === 'production') {
    process.exit(1);
  } else {
    console.log('⚠️  Continuing with in-memory storage...');
    const server = app.listen(config.port, () => {
      console.log('=================================');
      console.log(`🚀 Server running on port ${config.port} (in-memory mode)`);
      console.log('=================================');
    });
    module.exports = server;
  }
});
