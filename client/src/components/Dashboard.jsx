import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './Sidebar';
import Calendar from './Calendar';
import DataInput from './DataInput';
import DotVisualization from './DotVisualization';
import { transactionAPI } from '../services/api';
import { Loader2, Search, MoreVertical, Filter, X, Download, RefreshCw, Plus } from 'lucide-react';

const Dashboard = ({ darkMode, setDarkMode }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeMenu, setActiveMenu] = useState('overview');
    const [showSMSInput, setShowSMSInput] = useState(false);

    //  Filter states
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);

    // Parse date helper function
    const parseDate = (dateStr) => {
        // Parse DD/MM/YYYY format
        const [day, month, year] = dateStr.split('/');
        return new Date(year, month - 1, day);
    };

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            const transactions = await transactionAPI.getAll();

            // Ensure transactions is an array
            if (!Array.isArray(transactions)) {
                setData({ transactions: [] });
                return;
            }

            // Convert to frontend format
            const formattedTransactions = transactions.map(t => ({
                id: t.id,
                type: t.type === 'income' ? 'Income' : 'Expense',
                amount: t.amount || 0,
                balance: t.balance || 0,
                description: t.description || '',
                dateStr: t.transaction_date || new Date(t.created_at).toLocaleDateString(),
                date: t.transaction_date ? parseDate(t.transaction_date) : new Date(t.created_at),
                from_person: t.from_person || '',
                ref_no: t.ref_no || ''
            }));

            setData({ transactions: formattedTransactions });
        } catch (err) {
            console.error('Error loading transactions:', err);
            setError('Failed to load transactions');
            setData({ transactions: [] });
        } finally {
            setLoading(false);
        }
    };

    const handleSMSSuccess = () => {
        setShowSMSInput(false);
        loadTransactions(); // Reload data
    };

    // Filtered transactions
    const filteredTransactions = useMemo(() => {
        if (!data) return [];

        let filtered = [...data.transactions];

        if (filterType !== 'all') {
            filtered = filtered.filter(t => t.type.toLowerCase() === filterType);
        }

        if (selectedDate) {
            filtered = filtered.filter(t => {
                return t.date.toDateString() === selectedDate.toDateString();
            });
        }

        if (searchQuery) {
            filtered = filtered.filter(t =>
                t.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered.sort((a, b) => b.date - a.date);
    }, [data, filterType, searchQuery, selectedDate]);

    // Calculate aggregates
    const aggregates = useMemo(() => {
        if (!filteredTransactions.length) return { totalIncome: 0, totalExpense: 0, balance: 0 };

        const totalIncome = filteredTransactions
            .filter(t => t.type === 'Income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = filteredTransactions
            .filter(t => t.type === 'Expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense
        };
    }, [filteredTransactions]);

    const exportToCSV = () => {
        if (!filteredTransactions.length) return;

        const headers = ['Date', 'Type', 'Amount', 'Description'];
        const rows = filteredTransactions.map(t => [
            t.dateStr,
            t.type,
            t.amount,
            `"${t.description.replace(/"/g, '""')}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (showSMSInput) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <DataInput
                    onSuccess={handleSMSSuccess}
                    onClose={() => setShowSMSInput(false)}
                    darkMode={darkMode}
                />
            </div>
        );
    }

    return (
        <div className={`flex ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
            <Sidebar
                darkMode={darkMode}
                data={data}
                onMenuSelect={setActiveMenu}
                activeMenu={activeMenu}
            />

            <div className="ml-64 flex-1 overflow-auto">
                {/* Header */}
                <div className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div className="px-8 py-4 flex items-center justify-between">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${darkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-50 text-gray-900 placeholder-gray-400'
                                        } focus:outline-none focus:ring-2 focus:ring-coral-500`}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Calendar
                                darkMode={darkMode}
                                selectedDate={selectedDate}
                                onDateSelect={(date) => {
                                    setSelectedDate(date);
                                }}
                            />

                            <button
                                onClick={() => setShowSMSInput(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-coral-500 to-orange-600 text-white rounded-xl hover:from-cor al-600 hover:to-orange-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Data
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full" />
                                <div>
                                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Finance Manager
                                    </p>
                                    <p className="text-xs text-gray-500">CBE Dashboard</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-8">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-xl">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96">
                            <Loader2 className="w-12 h-12 text-coral-500 animate-spin mb-4" />
                            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading your data...</p>
                        </div>
                    ) : !data || data.transactions.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Plus className="w-10 h-10 text-gray-400" />
                            </div>
                            <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                No Transactions Yet
                            </h2>
                            <p className={`text-${darkMode ? 'gray-400' : 'gray-600'} mb-6`}>
                                Start by adding your CBE SMS messages to track your finances
                            </p>
                            <button
                                onClick={() => setShowSMSInput(true)}
                                className="px-6 py-3 bg-gradient-to-r from-coral-500 to-orange-600 text-white rounded-xl hover:from-coral-600 hover:to-orange-700 transition-colors font-semibold"
                            >
                                Add Your First Transaction
                            </button>
                        </div>
                    ) : (
                        <div>
                            {/* Title */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                        Financial Overview
                                    </h1>
                                    <p className="text-gray-500">
                                        Home &gt; {activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}
                                        {selectedDate && ` > ${selectedDate.toLocaleDateString()}`}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={exportToCSV}
                                        className="flex items-center gap-2 px-4 py-2 bg-coral-500 text-white rounded-xl hover:bg-coral-600 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Export CSV
                                    </button>
                                </div>
                            </div>

                            {/* Active Filters */}
                            {(selectedDate || filterType !== 'all' || searchQuery) && (
                                <div className="flex items-center gap-3 mb-6 flex-wrap">
                                    <span className="text-sm text-gray-500">Active filters:</span>
                                    {selectedDate && (
                                        <button
                                            onClick={() => setSelectedDate(null)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                                                }`}
                                        >
                                            Date: {selectedDate.toLocaleDateString()}
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                    {filterType !== 'all' && (
                                        <button
                                            onClick={() => setFilterType('all')}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                                                }`}
                                        >
                                            Type: {filterType}
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                                                }`}
                                        >
                                            Search: "{searchQuery}"
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Top Cards Row */}
                            <div className="grid grid-cols-4 gap-6 mb-6">
                                {/* Transaction Count Card */}
                                <div className={`p-6 rounded-3xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-sm font-medium text-gray-500">TRANSACTIONS</h3>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">Total in period</p>
                                    <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                                        {filteredTransactions.length}
                                    </p>
                                    <div className="pt-4 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">From total dataset</p>
                                        <p className="text-sm font-bold text-gray-900">
                                            {data.transactions.length} records
                                        </p>
                                    </div>
                                </div>

                                {/* Total Income */}
                                <div className={`p-6 rounded-3xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <DotVisualization
                                            value={aggregates.totalIncome}
                                            max={Math.max(aggregates.totalIncome, aggregates.totalExpense, 1)}
                                            rows={5}
                                            cols={15}
                                            color="blue"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mb-1">Total income</p>
                                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        <span className="text-sm font-normal">ETB</span>{' '}
                                        {aggregates.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>

                                {/* Total Expenses */}
                                <div className={`p-6 rounded-3xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-6 h-6 bg-coral-100 rounded-lg flex items-center justify-center">
                                            <div className="w-3 h-3 bg-coral-500 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <DotVisualization
                                            value={aggregates.totalExpense}
                                            max={Math.max(aggregates.totalIncome, aggregates.totalExpense, 1)}
                                            rows={5}
                                            cols={15}
                                            color="coral"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mb-1">Total expenses</p>
                                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        <span className="text-sm font-normal">ETB</span>{' '}
                                        {aggregates.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>

                                {/* Balance Card */}
                                <div className={`p-6 rounded-3xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm relative overflow-hidden`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-6 h-6 ${aggregates.balance >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
                                            <div className={`w-3 h-3 ${aggregates.balance >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-sm`} />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-1">Net Balance</p>
                                    <p className={`text-3xl font-bold ${aggregates.balance >= 0 ? 'text-green-500' : 'text-red-500'} mb-2`}>
                                        {aggregates.balance >= 0 ? '+' : ''}
                                        <span className="text-lg font-normal">ETB</span>{' '}
                                        {aggregates.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {aggregates.balance >= 0 ? 'Surplus' : 'Deficit'}
                                    </p>
                                </div>
                            </div>

                            {/* Transaction List */}
                            <div className={`p-6 rounded-3xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Transaction History
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {filteredTransactions.length} transactions
                                    </span>
                                </div>

                                {/* Filter Pills */}
                                <div className="flex items-center gap-3 mb-6">
                                    <button
                                        onClick={() => setFilterType('all')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'all'
                                            ? 'bg-gray-900 text-white'
                                            : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setFilterType('income')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'income'
                                            ? 'bg-gray-900 text-white'
                                            : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        Income
                                    </button>
                                    <button
                                        onClick={() => setFilterType('expense')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'expense'
                                            ? 'bg-gray-900 text-white'
                                            : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        Expenses
                                    </button>
                                </div>

                                {/* Transaction List */}
                                {filteredTransactions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            No transactions found for the selected filters
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                        {filteredTransactions.slice(0, 50).map((t) => (
                                            <div
                                                key={t.id}
                                                className={`flex items-center justify-between p-4 rounded-xl ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                                                    } transition-colors`}
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className={`w-2 h-2 rounded-full ${t.type === 'Income' ? 'bg-green-500' : 'bg-coral-500'
                                                        }`} />
                                                    <div className="flex-1">
                                                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {t.type}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate max-w-2xl">{t.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className="text-xs text-gray-500 whitespace-nowrap">{t.dateStr}</span>
                                                    <span className={`text-sm font-bold whitespace-nowrap ${t.type === 'Income' ? 'text-green-500' : 'text-coral-500'
                                                        }`}>
                                                        {t.type === 'Income' ? '+' : '-'} ETB {t.amount.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
