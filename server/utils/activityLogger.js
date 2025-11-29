const { logActivity } = require('../database');

/**
 * Log user activity
 */
const logUserActivity = (req, action, entityType = null, entityId = null, details = null) => {
    const userId = req.userId || null;
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    logActivity({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: details ? JSON.stringify(details) : null,
        ip_address: ipAddress,
        user_agent: userAgent
    }, (err) => {
        if (err) {
            console.error('Failed to log activity:', err);
        }
    });
};

module.exports = {
    logUserActivity
};

