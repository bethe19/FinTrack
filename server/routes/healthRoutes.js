const express = require('express');
const router = express.Router();
const { healthCheckHandler } = require('../controllers/healthController');

// Health check endpoint
router.get('/', healthCheckHandler);

module.exports = router;

