import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import { Loader2, TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import FinancialInsights from '../components/FinancialInsights';
import { getReportType, filterTransactionsByReportType, getReportTypeLabel, getDateRange } from '../utils/reportFilter';

const Analytics = ({ darkMode }) => {
    const [analytics, setAnalytics] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportType, setReportType] = useState(getReportType());

    useEffect(() => {
        loadAnalytics();
    }, []);

    // Listen for report type changes
    useEffect(() => {
        const handleReportTypeChange = (e) => {
            const newType = e.detail.type;
            if (newType !== reportType) {
                setReportType(newType);
                loadAnalytics();
            }
        };

        const handleStorageChange = () => {
            const newType = getReportType();
            if (newType !== reportType) {
                setReportType(newType);
                loadAnalytics();
            }
        };
        
        window.addEventListener('reportTypeChanged', handleReportTypeChange);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('reportTypeChanged', handleReportTypeChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [reportType]);

    // Reload analytics when report type changes
    useEffect(() => {
        if (!loading && analytics) {
            loadAnalytics();
        }
    }, [reportType]);

    const loadAnalytics = async () => {
        try {
            // Fetch all transactions
            const transactions = await transactionAPI.getAll();
            
            // Filter transactions based on report type
            const filteredTransactions = filterTransactionsByReportType(transactions, reportType);
            
            // Calculate analytics from filtered transactions
            const income = filteredTransactions.filter(t => t.type === 'income');
            const expenses = filteredTransactions.filter(t => t.type === 'expense');

            const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
            const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
            const balance = totalIncome - totalExpense;

            // Monthly breakdown
            const monthlyData = {};
            filteredTransactions.forEach(t => {
                const date = new Date(t.transaction_date || t.created_at);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = { month: monthKey, income: 0, expense: 0 };
                }

                if (t.type === 'income') {
                    monthlyData[monthKey].income += t.amount;
                } else {
                    monthlyData[monthKey].expense += t.amount;
                }
            });

            const analyticsData = {
                totalIncome,
                totalExpense,
                balance,
                transactionCount: filteredTransactions.length,
                avgIncome: income.length > 0 ? totalIncome / income.length : 0,
                avgExpense: expenses.length > 0 ? totalExpense / expenses.length : 0,
                monthlyData: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))
            };

            setAnalytics(analyticsData);
            setTransactions(filteredTransactions);
        } catch (err) {
            console.error('Error loading analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className={`w-12 h-12 animate-spin ${darkMode ? 'text-white' : 'text-black'}`} />
            </div>
        );
    }

    const pieData = [
        { name: 'Income', value: analytics.totalIncome },
        { name: 'Expenses', value: analytics.totalExpense }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-1 sm:mb-2`}>
                        Financial Analytics
                    </h1>
                    <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Detailed insights into your financial trends</p>
                </div>
                <div className={`px-3 sm:px-4 py-1.5 sm:py-2 border text-xs sm:text-sm ${darkMode ? 'border-gray-800 text-gray-400' : 'border-gray-300 text-gray-600'}`}>
                    {getReportTypeLabel(reportType)}
                </div>
            </div>

            {/* Financial Insights */}
            {transactions.length > 0 && (
                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <FinancialInsights transactions={transactions} darkMode={darkMode} />
                </div>
            )}

            {/* Summary Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
                <div className={`p-4 sm:p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 border flex items-center justify-center ${darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </div>
                    <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Income</p>
                    <p className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                        ETB {analytics.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div className={`p-4 sm:p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 border flex items-center justify-center ${darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                            <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </div>
                    <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Expenses</p>
                    <p className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                        ETB {analytics.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div className={`p-4 sm:p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 border flex items-center justify-center ${darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </div>
                    <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Net Balance</p>
                    <p className={`text-xl sm:text-2xl font-bold ${analytics.balance >= 0 ? (darkMode ? 'text-white' : 'text-black') : (darkMode ? 'text-white' : 'text-black')}`}>
                        {analytics.balance >= 0 ? '+' : ''}ETB {analytics.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div className={`p-4 sm:p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 border flex items-center justify-center ${darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                            <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </div>
                    <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Transactions</p>
                    <p className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                        {analytics.transactionCount}
                    </p>
                </div>
            </div>

            {/* Monthly Trend */}
            <div className={`p-4 sm:p-6 border mb-4 sm:mb-6 ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-4 sm:mb-6`}>
                    Monthly Trend
                </h3>
                <div className="w-full overflow-x-auto">
                    <ResponsiveContainer width="100%" height={250} minHeight={200}>
                    <AreaChart data={analytics.monthlyData}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={darkMode ? '#FFFFFF' : '#000000'} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={darkMode ? '#FFFFFF' : '#000000'} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={darkMode ? '#9CA3AF' : '#6B7280'} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={darkMode ? '#9CA3AF' : '#6B7280'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                        <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                        <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                        <Tooltip contentStyle={{ backgroundColor: darkMode ? '#000000' : '#FFFFFF', border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`, color: darkMode ? '#FFFFFF' : '#000000' }} />
                        <Legend />
                        <Area type="monotone" dataKey="income" stroke={darkMode ? '#FFFFFF' : '#000000'} fillOpacity={1} fill="url(#colorIncome)" />
                        <Area type="monotone" dataKey="expense" stroke={darkMode ? '#9CA3AF' : '#6B7280'} fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Monthly Comparison */}
                <div className={`p-4 sm:p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-4 sm:mb-6`}>
                        Monthly Comparison
                    </h3>
                    <div className="w-full overflow-x-auto">
                        <ResponsiveContainer width="100%" height={250} minHeight={200}>
                            <BarChart data={analytics.monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                                <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} fontSize={12} />
                                <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: darkMode ? '#000000' : '#FFFFFF', border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`, color: darkMode ? '#FFFFFF' : '#000000' }} />
                                <Legend />
                                <Bar dataKey="income" fill={darkMode ? '#FFFFFF' : '#000000'} />
                                <Bar dataKey="expense" fill={darkMode ? '#9CA3AF' : '#6B7280'} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Income vs Expense Pie */}
                <div className={`p-4 sm:p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-4 sm:mb-6`}>
                        Income vs Expenses
                    </h3>
                    <div className="w-full overflow-x-auto">
                        <ResponsiveContainer width="100%" height={250} minHeight={200}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? (darkMode ? '#FFFFFF' : '#000000') : (darkMode ? '#9CA3AF' : '#6B7280')} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: darkMode ? '#000000' : '#FFFFFF', border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`, color: darkMode ? '#FFFFFF' : '#000000' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
                <div className={`p-4 sm:p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Income</p>
                    <p className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                        ETB {analytics.avgIncome.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                </div>
                <div className={`p-4 sm:p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Expense</p>
                    <p className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                        ETB {analytics.avgExpense.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                </div>
                <div className={`p-4 sm:p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Transaction Count</p>
                    <p className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                        {analytics.transactionCount}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
