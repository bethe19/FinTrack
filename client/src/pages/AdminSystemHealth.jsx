import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Loader2, Server, Database, Activity, AlertCircle, CheckCircle, Clock, Cpu, HardDrive, Zap } from 'lucide-react';

const AdminSystemHealth = ({ darkMode }) => {
    const [loading, setLoading] = useState(true);
    const [health, setHealth] = useState(null);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    useEffect(() => {
        loadHealth();
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            loadHealth();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const loadHealth = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminAPI.getSystemHealth();
            setHealth(data);
            setLastUpdate(new Date());
        } catch (err) {
            console.error('Error loading system health:', err);
            setError('Failed to load system health');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'healthy':
            case 'connected':
            case 'online':
                return darkMode ? 'text-green-400' : 'text-green-600';
            case 'degraded':
            case 'slow':
                return darkMode ? 'text-yellow-400' : 'text-yellow-600';
            case 'offline':
            case 'error':
                return darkMode ? 'text-red-400' : 'text-red-600';
            default:
                return darkMode ? 'text-gray-400' : 'text-gray-600';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'healthy':
            case 'connected':
            case 'online':
                return <CheckCircle className="w-5 h-5" />;
            case 'degraded':
            case 'slow':
                return <AlertCircle className="w-5 h-5" />;
            default:
                return <AlertCircle className="w-5 h-5" />;
        }
    };

    if (loading && !health) {
        return (
            <div className="flex items-center justify-center h-full min-h-screen">
                <Loader2 className={`w-12 h-12 animate-spin ${darkMode ? 'text-white' : 'text-black'}`} />
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className={`mb-6 p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-2`}>
                            System Health Monitor
                        </h1>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Real-time system performance and health monitoring
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Clock className="w-4 h-4" />
                            <span>Updated {lastUpdate.toLocaleTimeString()}</span>
                        </div>
                        <button
                            onClick={loadHealth}
                            className={`px-4 py-2 border ${darkMode 
                                ? 'border-gray-800 text-white hover:bg-gray-900' 
                                : 'border-gray-300 text-black hover:bg-gray-50'
                            }`}
                            disabled={loading}
                        >
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                        <div className={`w-12 h-12 border flex items-center justify-center ${darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                            <Activity className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {error && !health && (
                <div className={`mb-6 p-4 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-black'}`}>{error}</p>
                </div>
            )}

            {/* Overall Status */}
            {health && (
                <div className={`mb-6 p-6 border ${
                    health.status === 'healthy' 
                        ? darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                        : health.status === 'degraded'
                        ? darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
                        : darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
                }`}>
                    <div className="flex items-center gap-4">
                        <div className={getStatusColor(health.status)}>
                            {getStatusIcon(health.status)}
                        </div>
                        <div>
                            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                System Status: <span className="capitalize">{health.status || 'Unknown'}</span>
                            </h2>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                All core services are {health.status === 'healthy' ? 'operational' : 'experiencing issues'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Health Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Server Status */}
                <div className={`p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <Server className={`w-8 h-8 ${health?.server?.status === 'online' ? 'text-green-500' : 'text-red-500'}`} />
                        <span className={`text-sm font-medium ${getStatusColor(health?.server?.status)}`}>
                            {health?.server?.status || 'Unknown'}
                        </span>
                    </div>
                    <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Server
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Uptime: {health?.server?.uptime || 'N/A'}
                    </p>
                </div>

                {/* Database Status */}
                <div className={`p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <Database className={`w-8 h-8 ${health?.database?.status === 'connected' ? 'text-green-500' : 'text-red-500'}`} />
                        <span className={`text-sm font-medium ${getStatusColor(health?.database?.status)}`}>
                            {health?.database?.status || 'Unknown'}
                        </span>
                    </div>
                    <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Database
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Ping: {health?.database?.ping || 'N/A'}
                    </p>
                </div>

                {/* Memory Usage */}
                <div className={`p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <Cpu className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-black'}`}>
                            {health?.memory?.usage || '0%'}
                        </span>
                    </div>
                    <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Memory Usage
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {health?.memory?.used || 'N/A'} / {health?.memory?.total || 'N/A'}
                    </p>
                </div>

                {/* Response Time */}
                <div className={`p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <Zap className={`w-8 h-8 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-black'}`}>
                            {health?.performance?.responseTime || 'N/A'}
                        </span>
                    </div>
                    <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Avg Response Time
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Last 100 requests
                    </p>
                </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Information */}
                <div className={`p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
                        System Information
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Node Version</span>
                            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-black'}`}>
                                {health?.system?.nodeVersion || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Platform</span>
                            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-black'}`}>
                                {health?.system?.platform || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Memory</span>
                            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-black'}`}>
                                {health?.memory?.total || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Free Memory</span>
                            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-black'}`}>
                                {health?.memory?.free || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>CPU Count</span>
                            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-black'}`}>
                                {health?.system?.cpuCount || 'N/A'} cores
                            </span>
                        </div>
                    </div>
                </div>

                {/* Service Status */}
                <div className={`p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
                        Service Status
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>API Server</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${health?.server?.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className={`text-sm font-medium ${getStatusColor(health?.server?.status)}`}>
                                    {health?.server?.status || 'Unknown'}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>MongoDB</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${health?.database?.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className={`text-sm font-medium ${getStatusColor(health?.database?.status)}`}>
                                    {health?.database?.status || 'Unknown'}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Authentication</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                    Active
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>File Upload</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSystemHealth;

