const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const authRoutes = require('./authRoutes');
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

// Public routes (no authentication required)
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Protected routes (authentication required)
router.use('/profile', authenticate, profileRoutes);
router.use('/transactions', authenticate, transactionRoutes);
router.use('/analytics', authenticate, analyticsRoutes);

// Protected endpoints (authentication required)
router.post('/sms', authenticate, processSMSHandler);
router.post('/upload-csv', authenticate, upload.single('file'), uploadCSVHandler);
router.get('/stats', authenticate, getStatsHandler);

module.exports = router;

