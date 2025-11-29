const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/admin');
const {
    getAllUsersHandler,
    updateUserRoleHandler,
    deleteUserHandler,
    getActivitiesHandler,
    getActivityStatsHandler,
    getSystemStatsHandler,
    getAllTransactionsHandler
} = require('../controllers/adminController');

// All admin routes require admin authentication
router.use(requireAdmin);

// User management
router.get('/users', getAllUsersHandler);
router.put('/users/:userId/role', updateUserRoleHandler);
router.delete('/users/:userId', deleteUserHandler);

// Activity tracking
router.get('/activities', getActivitiesHandler);
router.get('/activities/stats', getActivityStatsHandler);

// System statistics
router.get('/stats', getSystemStatsHandler);

// Transactions (admin view)
router.get('/transactions', getAllTransactionsHandler);

module.exports = router;

