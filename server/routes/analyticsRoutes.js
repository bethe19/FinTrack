const express = require('express');
const router = express.Router();
const {
    getAnalyticsHandler,
    getStatsHandler
} = require('../controllers/analyticsController');

// Get analytics data
router.get('/', getAnalyticsHandler);

// Get transaction stats
router.get('/stats', getStatsHandler);

module.exports = router;

