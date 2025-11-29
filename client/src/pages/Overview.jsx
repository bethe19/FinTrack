import React, { useState, useMemo, useEffect } from 'react';
import { transactionAPI, profileAPI } from '../services/api';
import { Loader2, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import DotVisualization from '../components/DotVisualization';
import SummaryCards from '../components/SummaryCards';
import TransactionTable from '../components/TransactionTable';
import TransactionCalendar from '../components/TransactionCalendar';
import FinancialInsights from '../components/FinancialInsights';
import { getReportType, filterTransactionsByReportType, getReportTypeLabel } from '../utils/reportFilter';

const Overview = ({ darkMode }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const [reportType, setReportType] = useState(getReportType());

    useEffect(() => {
        loadData();
    }, []);

    // Listen for report type changes
    useEffect(() => {
        const handleReportTypeChange = (e) => {
            const newType = e.detail.type;
            if (newType !== reportType) {
                setReportType(newType);
                loadData();
            }
        };

        const handleStorageChange = () => {
            const newType = getReportType();
            if (newType !== reportType) {
                setReportType(newType);
                loadData();
            }
        };
        
        window.addEventListener('reportTypeChanged', handleReportTypeChange);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('reportTypeChanged', handleReportTypeChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [reportType]);

    // Reload data when report type changes
    useEffect(() => {
        if (!loading && data) {
            loadData();
        }
    }, [reportType]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [transactions, analytics, profileData] = await Promise.all([
                transactionAPI.getAll(),
                transactionAPI.getStats(),
                profileAPI.get().catch(() => null) // Don't fail if profile doesn't exist
            ]);
            
            if (profileData) {
                setProfile(profileData);
            }

            let formatted = transactions.map(t => ({
                ...t,
                date: new Date(t.transaction_date || t.created_at),
                dateStr: new Date(t.transaction_date || t.created_at).toLocaleDateString()
            }));

            // Filter transactions based on report type
            formatted = filterTransactionsByReportType(formatted, reportType);

            // Recalculate stats based on filtered transactions
            const income = formatted.filter(t => t.type === 'income');
            const expenses = formatted.filter(t => t.type === 'expense');
            
            const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
            const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
            const balance = totalIncome - totalExpense;

            const incomeCount = income.length;
            const expenseCount = expenses.length;

            setData({ 
                transactions: formatted, 
                stats: {
                    totalIncome,
                    totalExpense,
                    balance,
                    transactionCount: formatted.length,
                    income: {
                        count: incomeCount,
                        total: totalIncome,
                        average: incomeCount > 0 ? totalIncome / incomeCount : 0
                    },
                    expense: {
                        count: expenseCount,
                        total: totalExpense,
                        average: expenseCount > 0 ? totalExpense / expenseCount : 0
                    }
                }
            });
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Failed to load data');
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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const userName = profile?.name || 'there';

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className={`mb-4 sm:mb-6 lg:mb-8 p-4 sm:p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-1 sm:mb-2 truncate`}>
                            {getGreeting()}, {userName}!
                        </h1>
                        <p className={`text-sm sm:text-base lg:text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Here's your financial overview for today.
                        </p>
                    </div>
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 border flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                        <Wallet className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                    Financial Overview
                </h2>
                <div className={`px-3 sm:px-4 py-1.5 sm:py-2 border text-xs sm:text-sm ${darkMode ? 'border-gray-800 text-gray-400' : 'border-gray-300 text-gray-600'}`}>
                    {getReportTypeLabel(reportType)}
                </div>
            </div>

            {/* Summary Cards */}
            {data && <SummaryCards data={data.stats} darkMode={darkMode} />}

            {/* Financial Insights */}
            {data && data.transactions.length > 0 && (
                <div className="mb-8">
                    <FinancialInsights transactions={data.transactions} darkMode={darkMode} />
                </div>
            )}

            {/* Calendar Heatmap */}
            {data && (
                <div className="mb-8">
                    <TransactionCalendar transactions={data.transactions} darkMode={darkMode} />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
                {/* Visualizations */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
                    <div className={`p-4 sm:p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                         <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-4 sm:mb-6`}>
                            Income Distribution
                        </h3>
                        <div className="mt-4 overflow-x-auto">
                             <DotVisualization
                                value={data.stats.income.total}
                                max={Math.max(data.stats.income.total, data.stats.expense.total, 1)}
                                rows={4}
                                cols={20}
                                color="green"
                            />
                             <p className={`mt-3 sm:mt-4 text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Represents total income relative to expenses.
                            </p>
                        </div>
                    </div>

                     <div className={`p-4 sm:p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                         <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-4 sm:mb-6`}>
                            Expense Distribution
                        </h3>
                        <div className="mt-4 overflow-x-auto">
                             <DotVisualization
                                value={data.stats.expense.total}
                                max={Math.max(data.stats.income.total, data.stats.expense.total, 1)}
                                rows={4}
                                cols={20}
                                color="coral"
                            />
                             <p className={`mt-3 sm:mt-4 text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Represents total expenses relative to income.
                            </p>
                        </div>
                    </div>
                </div>

                 {/* Quick Stats / Mini Breakdown */}
                <div className={`p-4 sm:p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'} h-fit`}>
                    <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-4 sm:mb-6`}>
                        Quick Stats
                    </h3>
                    
                    <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 border flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                                    <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-white' : 'text-black'}`}>Transactions</p>
                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Count</p>
                                </div>
                            </div>
                            <span className={`text-base sm:text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                {data.stats.transactionCount}
                            </span>
                        </div>

                        <div className={`h-px ${darkMode ? 'bg-gray-800' : 'bg-gray-300'}`} />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 border flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-white' : 'text-black'}`}>Avg. Income</p>
                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Per Transaction</p>
                                </div>
                            </div>
                            <span className={`text-base sm:text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                {data.stats.income.count > 0 
                                    ? (data.stats.income.total / data.stats.income.count).toLocaleString(undefined, { maximumFractionDigits: 0 }) 
                                    : 0}
                            </span>
                        </div>

                         <div className={`h-px ${darkMode ? 'bg-gray-800' : 'bg-gray-300'}`} />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 border flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-white' : 'text-black'}`}>Avg. Expense</p>
                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Per Transaction</p>
                                </div>
                            </div>
                            <span className={`text-base sm:text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                {data.stats.expense.count > 0
                                    ? (data.stats.expense.total / data.stats.expense.count).toLocaleString(undefined, { maximumFractionDigits: 0 })
                                    : 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="mt-4 sm:mt-6 lg:mt-8">
                 <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-4 sm:mb-6`}>
                    Recent Activity
                </h3>
                <TransactionTable transactions={data.transactions.slice(0, 10)} darkMode={darkMode} />
            </div>
        </div>
    );
};

export default Overview;
