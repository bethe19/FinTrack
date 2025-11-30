import React from 'react';
import { BarChart3, FileText, TrendingUp, Wallet, Home as HomeIcon, PieChart, Settings, TrendingDown, BarChart2 } from 'lucide-react';

const Sidebar = ({ darkMode, data, onMenuSelect, activeMenu }) => {
    const menuItems = [
        { id: 'overview', icon: BarChart3, label: 'Overview' },
        { id: 'transactions', icon: FileText, label: 'All Transactions' },
        { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    // Calculate stats from data
    const stats = data ? {
        totalTransactions: data.transactions.length,
        incomeCount: data.transactions.filter(t => t.type === 'Income').length,
        expenseCount: data.transactions.filter(t => t.type === 'Expense').length,
        avgTransaction: data.transactions.reduce((sum, t) => sum + t.amount, 0) / data.transactions.length,
    } : null;

    return (
        <div className={`w-64 h-screen fixed left-0 top-0 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-r ${darkMode ? 'border-gray-800' : 'border-gray-100'} flex flex-col overflow-y-auto`}>
            {/* Logo */}
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                        <HomeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>FinTrack</h1>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>CBE Analytics</p>
                    </div>
                </div>
            </div>

            {/* Stats Banner */}
            {data && (
                <div className={`mx-4 mb-6 p-4 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-coral-50 to-orange-50'}`}>
                    <p className={`text-sm font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <BarChart2 className="w-4 h-4" />
                        Quick Stats
                    </p>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Transactions</span>
                            <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalTransactions}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Amount</span>
                            <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                ETB {stats.avgTransaction.toFixed(0)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* HOME Menu */}
            <div className="px-4 mb-6">
                <p className={`text-xs font-semibold mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-wider`}>
                    NAVIGATION
                </p>
                <div className="space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onMenuSelect(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeMenu === item.id
                                    ? darkMode
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-900 text-white'
                                    : darkMode
                                        ? 'text-gray-400 hover:bg-gray-800'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{item.label}</span>
                            {activeMenu === item.id && (
                                <div className="ml-auto w-2 h-2 bg-coral-500 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* SUMMARY Section */}
            {data && (
                <div className="px-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <p className={`text-xs font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-wider`}>
                            SUMMARY
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            <div className="flex-1">
                                <p className="text-xs text-gray-500">Income</p>
                                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {stats.incomeCount} items
                                </p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-red-50'}`}>
                            <TrendingDown className="w-5 h-5 text-coral-500" />
                            <div className="flex-1">
                                <p className="text-xs text-gray-500">Expenses</p>
                                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {stats.expenseCount} items
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Help Banner */}
            <div className="mt-auto mx-4 mb-6">
                <div className={`relative overflow-hidden rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'} p-6`}>
                    <div className="relative z-10">
                        <h3 className={`text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Need Help? 👋
                        </h3>
                        <p className={`text-xs mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Just ask me anything!
                        </p>
                        <button className="bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-gray-800 transition-colors w-full">
                            Get Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
