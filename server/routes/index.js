const express = require('express');
const router = express.Router();
const multer = require('multer');
const profileRoutes = require('./profileRoutes');
const transactionRoutes = require('./transactionRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const healthRoutes = require('./healthRoutes');
const {
    processSMSHandler,
    uploadCSVHandler
} = require('../controllers/transactionController');
const { getStatsHandler } = require('../controllers/analyticsController');

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 }
});

// Mount route modules (matching original API paths)
router.use('/health', healthRoutes);
router.use('/profile', profileRoutes);
router.use('/transactions', transactionRoutes);
router.use('/analytics', analyticsRoutes);

// SMS endpoint (separate from transactions route)
router.post('/sms', processSMSHandler);

// CSV upload endpoint (separate from transactions route)
router.post('/upload-csv', upload.single('file'), uploadCSVHandler);

// Stats endpoint (separate from analytics route)
router.get('/stats', getStatsHandler);

module.exports = router;

