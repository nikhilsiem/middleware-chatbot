const express = require('express');
const chatRoutes = require('./chat.routes');
const healthRoutes = require('./health.routes');

const router = express.Router();

// Mount routes
router.use('/', healthRoutes);
router.use('/api', chatRoutes);

module.exports = router;
