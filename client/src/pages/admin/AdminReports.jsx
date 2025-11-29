import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Loader2, BarChart3, Download, TrendingUp, Users, FileText } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminReports = ({ darkMode }) => {
    const [loading, setLoading] = useState(true);
    const [systemStats, setSystemStats] = useState(null);
    const [activityStats, setActivityStats] = useState([]);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [stats, activities, usersData, transactionsData] = await Promise.all([
                adminAPI.getSystemStats(),
                adminAPI.getActivityStats(),
                adminAPI.getAllUsers(),
                adminAPI.getAllTransactions()
            ]);
            setSystemStats(stats);
            setActivityStats(activities);
            setUsers(usersData);
            setTransactions(transactionsData);
        } catch (err) {
            console.error('Error loading reports:', err);
            setError('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const generateReport = () => {
        const report = {
            generated_at: new Date().toISOString(),
            system_stats: systemStats,
            total_users: users.length,
            total_transactions: transactions.length,
            activity_summary: activityStats.slice(0, 7)
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-screen">
                <Loader2 className={`w-12 h-12 animate-spin ${darkMode ? 'text-white' : 'text-black'}`} />
            </div>
        );
    }

    const userRoleData = [
        { name: 'Users', value: (systemStats?.total_users || 0) - (systemStats?.admin_count || 0) },
        { name: 'Admins', value: systemStats?.admin_count || 0 }
    ];

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className={`mb-6 p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-2`}>
                            Reports & Analytics
                        </h1>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Comprehensive system reports and analytics
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={generateReport}
                            className={`px-4 py-2 border flex items-center gap-2 ${darkMode 
                                ? 'bg-white text-black border-white hover:bg-gray-100' 
                                : 'bg-black text-white border-black hover:bg-gray-900'
                            }`}
                        >
                            <Download className="w-4 h-4" />
                            Export Report
                        </button>
                        <div className={`w-12 h-12 border flex items-center justify-center ${darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                            <BarChart3 className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className={`mb-6 p-4 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-black'}`}>{error}</p>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className={`p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <Users className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Users
                    </h3>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                        {systemStats?.total_users || 0}
                    </p>
                </div>
                <div className={`p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <FileText className={`w-8 h-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                    <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Transactions
                    </h3>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                        {systemStats?.total_transactions || 0}
                    </p>
                </div>
                <div className={`p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Activities Today
                    </h3>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                        {systemStats?.activities_today || 0}
                    </p>
                </div>
                <div className={`p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <BarChart3 className={`w-8 h-8 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                    </div>
                    <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Profiles
                    </h3>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                        {systemStats?.total_profiles || 0}
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Activity Chart */}
                {activityStats.length > 0 && (
                    <div className={`p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                        <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
                            Activity Trends
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

                {/* User Role Distribution */}
                <div className={`p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
                        User Role Distribution
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={userRoleData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {userRoleData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: darkMode ? '#111827' : '#ffffff',
                                    border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                                    color: darkMode ? '#ffffff' : '#000000'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Transaction Type Distribution */}
            {transactions.length > 0 && (
                <div className={`mb-8 p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
                        Transaction Type Distribution
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                            { 
                                type: 'Income', 
                                count: transactions.filter(t => t.type?.toLowerCase() === 'income').length 
                            },
                            { 
                                type: 'Expense', 
                                count: transactions.filter(t => t.type?.toLowerCase() === 'expense').length 
                            }
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                            <XAxis 
                                dataKey="type" 
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
                            <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default AdminReports;

