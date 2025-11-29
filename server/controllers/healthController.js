/**
 * Health check endpoint
 */
const healthCheckHandler = (req, res) => {
    res.json({ status: 'ok', message: 'Finance Backend API is running' });
};

module.exports = {
    healthCheckHandler
};

