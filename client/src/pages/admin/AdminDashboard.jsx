import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Loader2, Users, Activity, TrendingUp, FileText, Shield } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = ({ darkMode }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [activityStats, setActivityStats] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [systemStats, activities] = await Promise.all([
                adminAPI.getSystemStats(),
                adminAPI.getActivityStats()
            ]);
            setStats(systemStats);
            setActivityStats(activities);
        } catch (err) {
            console.error('Error loading admin data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-screen">
                <Loader2 className={`w-12 h-12 animate-spin ${darkMode ? 'text-white' : 'text-black'}`} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className={`border p-4 ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-black'}`}>{error}</p>
                    <button 
                        onClick={loadData}
                        className={`mt-2 text-sm font-medium border px-4 py-2 ${darkMode 
                            ? 'border-gray-800 text-white hover:bg-gray-900' 
                            : 'border-gray-300 text-black hover:bg-gray-50'
                        }`}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats?.total_users || 0,
            icon: Users,
            color: 'blue'
        },
        {
            title: 'Admins',
            value: stats?.admin_count || 0,
            icon: Shield,
            color: 'purple'
        },
        {
            title: 'Total Transactions',
            value: stats?.total_transactions || 0,
            icon: FileText,
            color: 'green'
        },
        {
            title: 'Activities Today',
            value: stats?.activities_today || 0,
            icon: Activity,
            color: 'orange'
        }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className={`mb-6 p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-2`}>
                    Admin Dashboard
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Overview of system statistics and activity
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div 
                            key={index}
                            className={`p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 border flex items-center justify-center ${darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {stat.title}
                            </h3>
                            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                {stat.value.toLocaleString()}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Activity Chart */}
            {activityStats.length > 0 && (
                <div className={`mb-8 p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
                        Activity Trends (Last 30 Days)
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={activityStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                            <XAxis 
                                dataKey="date" 
                                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                                tick={{ fill: darkMode ? '#9ca3af' : '#6b7280' }}
                            />
                            <YAxis 
                                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                                tick={{ fill: darkMode ? '#9ca3af' : '#6b7280' }}
                            />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: darkMode ? '#111827' : '#ffffff',
                                    border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                                    color: darkMode ? '#ffffff' : '#000000'
                                }}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                name="Activities"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="unique_users" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                name="Active Users"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Quick Actions */}
            <div className={`p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => window.location.href = '/admin/users'}
                        className={`p-4 border text-left ${darkMode 
                            ? 'border-gray-800 hover:bg-gray-900' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <Users className={`w-6 h-6 mb-2 ${darkMode ? 'text-white' : 'text-black'}`} />
                        <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-black'}`}>Manage Users</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            View and manage all users
                        </p>
                    </button>
                    <button
                        onClick={() => window.location.href = '/admin/activities'}
                        className={`p-4 border text-left ${darkMode 
                            ? 'border-gray-800 hover:bg-gray-900' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <Activity className={`w-6 h-6 mb-2 ${darkMode ? 'text-white' : 'text-black'}`} />
                        <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-black'}`}>View Activities</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Track all user activities
                        </p>
                    </button>
                    <button
                        onClick={() => window.location.href = '/admin/reports'}
                        className={`p-4 border text-left ${darkMode 
                            ? 'border-gray-800 hover:bg-gray-900' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <TrendingUp className={`w-6 h-6 mb-2 ${darkMode ? 'text-white' : 'text-black'}`} />
                        <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-black'}`}>View Reports</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Generate and view reports
                        </p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

