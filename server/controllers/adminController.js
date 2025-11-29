const { 
    getAllUsers, 
    updateUserRole, 
    deleteUser, 
    getActivities, 
    getActivityStats, 
    getSystemStats,
    getAllTransactionsAdmin
} = require('../database');
const { logUserActivity } = require('../utils/activityLogger');

/**
 * Get all users (admin only)
 */
const getAllUsersHandler = (req, res) => {
    getAllUsers((err, users) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }

        logUserActivity(req, 'VIEW_USERS', 'users', null, { count: users.length });
        res.json(users);
    });
};

/**
 * Update user role (admin only)
 */
const updateUserRoleHandler = (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
    }

    updateUserRole(userId, role, (err) => {
        if (err) {
            console.error('Error updating user role:', err);
            return res.status(500).json({ error: 'Failed to update user role' });
        }

        logUserActivity(req, 'UPDATE_USER_ROLE', 'user', userId, { role });
        res.json({ success: true, message: 'User role updated successfully' });
    });
};

/**
 * Delete user (admin only)
 */
const deleteUserHandler = (req, res) => {
    const { userId } = req.params;

    if (parseInt(userId) === req.userId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    deleteUser(userId, (err) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ error: 'Failed to delete user' });
        }

        logUserActivity(req, 'DELETE_USER', 'user', userId);
        res.json({ success: true, message: 'User deleted successfully' });
    });
};

/**
 * Get all activities (admin only)
 */
const getActivitiesHandler = (req, res) => {
    const filters = {
        user_id: req.query.user_id || null,
        action: req.query.action || null,
        start_date: req.query.start_date || null,
        end_date: req.query.end_date || null,
        limit: parseInt(req.query.limit) || 100,
        offset: parseInt(req.query.offset) || 0
    };

    getActivities(filters, (err, activities) => {
        if (err) {
            console.error('Error fetching activities:', err);
            return res.status(500).json({ error: 'Failed to fetch activities' });
        }

        // Parse details JSON strings
        const parsedActivities = activities.map(activity => ({
            ...activity,
            details: activity.details ? JSON.parse(activity.details) : null
        }));

        logUserActivity(req, 'VIEW_ACTIVITIES', 'activities', null, { count: parsedActivities.length });
        res.json(parsedActivities);
    });
};

/**
 * Get activity statistics (admin only)
 */
const getActivityStatsHandler = (req, res) => {
    getActivityStats((err, stats) => {
        if (err) {
            console.error('Error fetching activity stats:', err);
            return res.status(500).json({ error: 'Failed to fetch activity statistics' });
        }

        logUserActivity(req, 'VIEW_ACTIVITY_STATS', 'statistics', null);
        res.json(stats);
    });
};

/**
 * Get system statistics (admin only)
 */
const getSystemStatsHandler = (req, res) => {
    getSystemStats((err, stats) => {
        if (err) {
            console.error('Error fetching system stats:', err);
            return res.status(500).json({ error: 'Failed to fetch system statistics' });
        }

        logUserActivity(req, 'VIEW_SYSTEM_STATS', 'statistics', null);
        res.json(stats);
    });
};

/**
 * Get all transactions across all users (admin only)
 */
const getAllTransactionsHandler = (req, res) => {
    const userId = req.query.user_id || null;

    if (userId) {
        // Get transactions for specific user
        const { getAllTransactions } = require('../database');
        getAllTransactions(userId, (err, transactions) => {
            if (err) {
                console.error('Error fetching transactions:', err);
                return res.status(500).json({ error: 'Failed to fetch transactions' });
            }
            logUserActivity(req, 'VIEW_USER_TRANSACTIONS', 'transactions', userId, { count: transactions.length });
            res.json(transactions);
        });
    } else {
        // Get all transactions
        getAllTransactionsAdmin((err, transactions) => {
            if (err) {
                console.error('Error fetching all transactions:', err);
                return res.status(500).json({ error: 'Failed to fetch transactions' });
            }
            logUserActivity(req, 'VIEW_ALL_TRANSACTIONS', 'transactions', null, { count: transactions.length });
            res.json(transactions);
        });
    }
};

module.exports = {
    getAllUsersHandler,
    updateUserRoleHandler,
    deleteUserHandler,
    getActivitiesHandler,
    getActivityStatsHandler,
    getSystemStatsHandler,
    getAllTransactionsHandler
};

