const { verifyToken } = require('../utils/auth');
const { getUserRoleById } = require('../database');

/**
 * Admin authentication middleware
 * Verifies JWT token and checks if user has admin role
 */
const requireAdmin = (req, res, next) => {
    try {
        // Get token from Authorization header or query parameter
        const authHeader = req.headers.authorization;
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({ error: 'Authentication required. Please provide a valid token.' });
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
        }

        // Check role from database (users collection has role field)
        getUserRoleById(decoded.userId, (err, user) => {
            if (err) {
                console.error('Error checking user role:', err);
                return res.status(500).json({ error: 'Failed to verify admin status' });
            }

            if (!user || user.role !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }

            // Attach user ID to request
            req.userId = decoded.userId;
            req.userRole = user.role;
            next();
        });
    } catch (error) {
        console.error('Admin authentication error:', error);
        return res.status(401).json({ error: 'Authentication failed. Please login again.' });
    }
};

module.exports = {
    requireAdmin
};

