const express = require('express');
const healthController = require('../controllers/health.controller');

const router = express.Router();

router.get('/health', healthController.healthCheck.bind(healthController));
router.get('/test-openai', healthController.testOpenAI.bind(healthController));

module.exports = router;
