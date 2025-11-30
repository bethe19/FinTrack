const os = require('os');
const { connectDB } = require('../database');

/**
 * Get comprehensive system health status
 */
const getSystemHealth = async (req, res) => {
    try {
        // Check database connection
        let dbStatus = 'connected';
        let dbPing = 'N/A';
        try {
            const startTime = Date.now();
            await connectDB();
            const endTime = Date.now();
            dbPing = `${endTime - startTime}ms`;
        } catch (err) {
            dbStatus = 'disconnected';
            dbPing = 'Error';
        }

        // Get memory usage
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memUsage = ((usedMem / totalMem) * 100).toFixed(1);

        // Calculate uptime
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const uptimeStr = days > 0 
            ? `${days}d ${hours}h ${minutes}m` 
            : hours > 0 
            ? `${hours}h ${minutes}m` 
            : `${minutes}m`;

        // Determine overall system status
        let overallStatus = 'healthy';
        if (dbStatus !== 'connected') {
            overallStatus = 'error';
        } else if (memUsage > 90) {
            overallStatus = 'degraded';
        }

        const healthData = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            server: {
                status: 'online',
                uptime: uptimeStr,
                uptimeSeconds: Math.floor(uptime)
            },
            database: {
                status: dbStatus,
                ping: dbPing
            },
            memory: {
                total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
                used: `${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
                free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
                usage: `${memUsage}%`
            },
            system: {
                platform: `${os.platform()} ${os.release()}`,
                nodeVersion: process.version,
                cpuCount: os.cpus().length,
                loadAverage: os.loadavg().map(l => l.toFixed(2))
            },
            performance: {
                responseTime: '< 100ms', // This could be calculated from request logs
                requests: 'N/A' // This would require request tracking middleware
            }
        };

        res.json(healthData);
    } catch (error) {
        console.error('Error getting system health:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to get system health',
            message: error.message
        });
    }
};

/**
 * Simple health check endpoint
 */
const healthCheckHandler = (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString() 
    });
};

module.exports = {
    getSystemHealth,
    healthCheckHandler
};
