const { verifyToken } = require('../utils/auth');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
const authenticate = (req, res, next) => {
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

        // Attach user ID to request
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Authentication failed. Please login again.' });
    }
};

module.exports = {
    authenticate
};

