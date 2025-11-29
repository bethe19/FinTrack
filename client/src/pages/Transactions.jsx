import React, { useState, useEffect, useMemo } from 'react';
import { transactionAPI } from '../services/api';
import { Loader2, Search, Calendar, Download, Trash2, X, TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react';

const Transactions = ({ darkMode }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showDateFilter, setShowDateFilter] = useState(false);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            const data = await transactionAPI.getAll();
            setTransactions(data.map(t => ({
                ...t,
                date: new Date(t.transaction_date || t.created_at)
            })));
        } catch (err) {
            console.error('Error loading transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = useMemo(() => {
        let filtered = [...transactions];

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(t => t.type === filterType);
        }

        // Filter by date range
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            filtered = filtered.filter(t => {
                const tDate = new Date(t.transaction_date || t.created_at);
                tDate.setHours(0, 0, 0, 0);
                return tDate >= start;
            });
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(t => {
                const tDate = new Date(t.transaction_date || t.created_at);
                return tDate <= end;
            });
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(t =>
                (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.from_person || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.amount || 0).toString().includes(searchQuery)
            );
        }

        return filtered.sort((a, b) => b.date - a.date);
    }, [transactions, filterType, searchQuery, startDate, endDate]);

    // Calculate summary from filtered transactions
    const summary = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'income');
        const expenses = filteredTransactions.filter(t => t.type === 'expense');
        
        const totalIncome = income.reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalExpense = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);
        const balance = totalIncome - totalExpense;
        
        return {
            totalIncome,
            totalExpense,
            balance,
            count: filteredTransactions.length,
            incomeCount: income.length,
            expenseCount: expenses.length
        };
    }, [filteredTransactions]);

    const clearDateFilter = () => {
        setStartDate('');
        setEndDate('');
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Type', 'Amount', 'Description', 'From', 'Balance'];
        const rows = filteredTransactions.map(t => [
            new Date(t.transaction_date || t.created_at).toLocaleDateString(),
            t.type,
            t.amount,
            t.description || '-',
            t.from_person || '-',
            t.balance || '-'
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const deleteTransaction = async (id) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await transactionAPI.delete(id);
            loadTransactions();
        } catch (err) {
            console.error('Error deleting transaction:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-12 h-12 text-black dark:text-white animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="mb-4 sm:mb-6 lg:mb-8">
                <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-1 sm:mb-2`}>
                    All Transactions
                </h1>
                <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Complete history of your financial transactions</p>
            </div>

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
                        ETB {summary.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {summary.incomeCount} transaction{summary.incomeCount !== 1 ? 's' : ''}
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
                        ETB {summary.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {summary.expenseCount} transaction{summary.expenseCount !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className={`p-4 sm:p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 border flex items-center justify-center ${darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </div>
                    <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Net Balance</p>
                    <p className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                        {summary.balance >= 0 ? '+' : ''}ETB {summary.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {summary.balance >= 0 ? 'Surplus' : 'Deficit'}
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
                        {summary.count}
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Filtered results
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                {/* Search and Type Filter Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    <div className="relative flex-1">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border ${darkMode 
                                ? 'bg-black text-white border-gray-800' 
                                : 'bg-white text-black border-gray-300'
                            } focus:outline-none focus:border-black dark:focus:border-white`}
                        />
                    </div>

                    <div className="flex gap-0 border border-gray-300 dark:border-gray-800 w-full sm:w-auto">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-medium border-r border-gray-300 dark:border-gray-800 ${
                                filterType === 'all'
                                    ? darkMode ? 'bg-white text-black' : 'bg-black text-white'
                                    : darkMode ? 'bg-black text-gray-400 hover:text-white' : 'bg-white text-gray-600 hover:text-black'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterType('income')}
                            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-medium border-r border-gray-300 dark:border-gray-800 ${
                                filterType === 'income'
                                    ? darkMode ? 'bg-white text-black' : 'bg-black text-white'
                                    : darkMode ? 'bg-black text-gray-400 hover:text-white' : 'bg-white text-gray-600 hover:text-black'
                            }`}
                        >
                            Income
                        </button>
                        <button
                            onClick={() => setFilterType('expense')}
                            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-medium ${
                                filterType === 'expense'
                                    ? darkMode ? 'bg-white text-black' : 'bg-black text-white'
                                    : darkMode ? 'bg-black text-gray-400 hover:text-white' : 'bg-white text-gray-600 hover:text-black'
                            }`}
                        >
                            Expenses
                        </button>
                    </div>

                    <button
                        onClick={() => setShowDateFilter(!showDateFilter)}
                        className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border ${darkMode 
                            ? 'bg-black text-white border-gray-800 hover:bg-gray-900' 
                            : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span className="hidden sm:inline">Date Range</span>
                        <span className="sm:hidden">Date</span>
                    </button>

                    <button
                        onClick={exportToCSV}
                        className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border ${darkMode 
                            ? 'bg-black text-white border-gray-800 hover:bg-gray-900' 
                            : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>

                {/* Date Range Filter */}
                {showDateFilter && (
                    <div className={`border p-3 sm:p-4 ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className={`text-sm sm:text-base font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Filter by Date Range</h3>
                            <button
                                onClick={() => setShowDateFilter(false)}
                                className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
                            <div className="flex-1">
                                <label className={`block text-xs sm:text-sm mb-1 sm:mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border ${darkMode 
                                        ? 'bg-black text-white border-gray-800' 
                                        : 'bg-white text-black border-gray-300'
                                    } focus:outline-none focus:border-black dark:focus:border-white`}
                                />
                            </div>
                            <div className="flex-1">
                                <label className={`block text-xs sm:text-sm mb-1 sm:mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border ${darkMode 
                                        ? 'bg-black text-white border-gray-800' 
                                        : 'bg-white text-black border-gray-300'
                                    } focus:outline-none focus:border-black dark:focus:border-white`}
                                />
                            </div>
                            {(startDate || endDate) && (
                                <div className="flex items-end">
                                    <button
                                        onClick={clearDateFilter}
                                        className={`w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm sm:text-base border ${darkMode 
                                            ? 'bg-black text-white border-gray-800 hover:bg-gray-900' 
                                            : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>
                        {(startDate || endDate) && (
                            <div className={`mt-3 text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Showing transactions from {startDate || 'beginning'} to {endDate || 'today'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Transaction Table/Cards */}
            <div className={`border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                {/* Mobile Card View */}
                <div className="block md:hidden divide-y divide-gray-300 dark:divide-gray-800">
                    {filteredTransactions.length === 0 ? (
                        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <p className="text-sm">No transactions found</p>
                        </div>
                    ) : (
                        filteredTransactions.map((t, index) => (
                            <div
                                key={t.id || index}
                                className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                            >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 text-xs font-semibold border ${
                                                t.type === 'income'
                                                    ? darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                                                    : darkMode ? 'bg-black text-white border-gray-800' : 'bg-white text-black border-gray-300'
                                            }`}>
                                                {t.type}
                                            </span>
                                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {new Date(t.transaction_date || t.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-black'}`}>
                                            {t.description || '-'}
                                        </p>
                                        {t.from_person && (
                                            <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                From: {t.from_person}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => deleteTransaction(t.id)}
                                        className={`p-1.5 border flex-shrink-0 ${darkMode 
                                            ? 'border-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white' 
                                            : 'border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-black'
                                        }`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                        {t.type === 'income' ? '+' : '-'} ETB {t.amount.toLocaleString()}
                                    </span>
                                    {t.balance && (
                                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Balance: ETB {t.balance.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className={darkMode ? 'bg-black border-b border-gray-800' : 'bg-white border-b border-gray-300'}>
                            <tr>
                                <th className={`px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Date</th>
                                <th className={`px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Type</th>
                                <th className={`px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Amount</th>
                                <th className={`px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Description</th>
                                <th className={`px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>From</th>
                                <th className={`px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Balance</th>
                                <th className={`px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((t, index) => (
                                <tr
                                    key={t.id || index}
                                    className={`border-b ${darkMode ? 'border-gray-800 hover:bg-gray-900' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                                >
                                    <td className={`px-4 lg:px-6 py-3 lg:py-4 text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {new Date(t.transaction_date || t.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold border ${
                                            t.type === 'income'
                                                ? darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                                                : darkMode ? 'bg-black text-white border-gray-800' : 'bg-white text-black border-gray-300'
                                        }`}>
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className={`px-4 lg:px-6 py-3 lg:py-4 font-bold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-black'}`}>
                                        {t.type === 'income' ? '+' : '-'} ETB {t.amount.toLocaleString()}
                                    </td>
                                    <td className={`px-4 lg:px-6 py-3 lg:py-4 text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.description || '-'}</td>
                                    <td className={`px-4 lg:px-6 py-3 lg:py-4 text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.from_person || '-'}</td>
                                    <td className={`px-4 lg:px-6 py-3 lg:py-4 text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {t.balance ? `ETB ${t.balance.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                                        <button
                                            onClick={() => deleteTransaction(t.id)}
                                            className={`p-2 border ${darkMode 
                                                ? 'border-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white' 
                                                : 'border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-black'
                                            }`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredTransactions.length === 0 && (
                    <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <p className="text-sm">No transactions found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;
