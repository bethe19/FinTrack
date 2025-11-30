import React from 'react';
import { 
    TrendingUp, 
    TrendingDown, 
    AlertTriangle, 
    Wallet, 
    Activity, 
    Sparkles,
    Award,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { analyzeFinancialInsights } from '../utils/financialInsights';

const FinancialInsights = ({ transactions, darkMode }) => {
    if (!transactions || transactions.length === 0) {
        return null;
    }

    const insights = analyzeFinancialInsights(transactions);

    const getIcon = (iconName) => {
        const icons = {
            AlertTriangle,
            TrendingUp,
            TrendingDown,
            Wallet,
            Activity,
            Sparkles,
            Award,
            Calendar
        };
        return icons[iconName] || Activity;
    };

    const getTypeStyles = (type) => {
        switch (type) {
            case 'success':
                return {
                    bg: darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200',
                    text: darkMode ? 'text-green-300' : 'text-green-800',
                    iconBg: darkMode ? 'bg-green-900/30' : 'bg-green-100',
                    iconColor: darkMode ? 'text-green-400' : 'text-green-600'
                };
            case 'warning':
                return {
                    bg: darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200',
                    text: darkMode ? 'text-yellow-300' : 'text-yellow-800',
                    iconBg: darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100',
                    iconColor: darkMode ? 'text-yellow-400' : 'text-yellow-600'
                };
            case 'info':
                return {
                    bg: darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200',
                    text: darkMode ? 'text-blue-300' : 'text-blue-800',
                    iconBg: darkMode ? 'bg-blue-900/30' : 'bg-blue-100',
                    iconColor: darkMode ? 'text-blue-400' : 'text-blue-600'
                };
            default:
                return {
                    bg: darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200',
                    text: darkMode ? 'text-gray-300' : 'text-gray-800',
                    iconBg: darkMode ? 'bg-gray-800' : 'bg-gray-100',
                    iconColor: darkMode ? 'text-gray-400' : 'text-gray-600'
                };
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Key Insights Cards */}
            {insights.insights.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-white' : 'text-black'}`} />
                        <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                            Key Insights
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {insights.insights.map((insight, index) => {
                            const Icon = getIcon(insight.icon);
                            const styles = getTypeStyles(insight.type);
                            
                            return (
                                <div
                                    key={index}
                                    className={`p-3 sm:p-4 border ${styles.bg} ${styles.text} transition-all hover:shadow-lg`}
                                >
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center ${styles.iconBg} flex-shrink-0`}>
                                            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${styles.iconColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-xs sm:text-sm mb-1">{insight.title}</h4>
                                            <p className="text-xs leading-relaxed">{insight.message}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Grid Layout: Overspent, Best Performing, and Spending Trends */}
            {(insights.overspentMonths.length > 0 || insights.bestMonths.length > 0 || insights.spendingStreaks.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Overspent Months */}
                    {insights.overspentMonths.length > 0 && (
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <AlertTriangle className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                                <h3 className={`text-base sm:text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                    Overspent
                                </h3>
                            </div>
                            <div className={`flex-1 p-4 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                                <div className="space-y-3">
                                    {insights.overspentMonths.slice(0, 3).map((month, index) => (
                                        <div
                                            key={month.month}
                                            className={`p-3 border ${
                                                darkMode ? 'bg-gray-900 border-gray-800' : 'bg-red-50 border-red-200'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 flex items-center justify-center text-xs ${
                                                        darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
                                                    } font-bold flex-shrink-0`}>
                                                        #{index + 1}
                                                    </div>
                                                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                                        {month.monthName}
                                                    </p>
                                                </div>
                                                <p className={`text-sm font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                                                    -{Math.abs(month.balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </p>
                                            </div>
                                            <div className={`pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'} grid grid-cols-2 gap-2 text-xs`}>
                                                <div>
                                                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Income</p>
                                                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
                                                        {month.income.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Expenses</p>
                                                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
                                                        {month.expenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Best Performing Months */}
                    {insights.bestMonths.length > 0 && (
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <Award className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                                <h3 className={`text-base sm:text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                    Best Performing
                                </h3>
                            </div>
                            <div className={`flex-1 p-4 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                                <div className="space-y-3">
                                    {insights.bestMonths.slice(0, 3).map((month, index) => (
                                        <div
                                            key={month.month}
                                            className={`p-3 border ${
                                                darkMode ? 'bg-gray-900 border-gray-800' : 'bg-green-50 border-green-200'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 ${
                                                        index === 0 
                                                            ? darkMode ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500' : 'bg-yellow-100 text-yellow-600 border border-yellow-400'
                                                            : darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
                                                    } font-bold`}>
                                                        {index === 0 ? (
                                                            <Award className="w-3 h-3" />
                                                        ) : (
                                                            `#${index + 1}`
                                                        )}
                                                    </div>
                                                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                                        {month.monthName}
                                                    </p>
                                                </div>
                                                <p className={`text-sm font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                                    +{month.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </p>
                                            </div>
                                            <div className={`pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'} grid grid-cols-2 gap-2 text-xs`}>
                                                <div>
                                                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Income</p>
                                                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
                                                        {month.income.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Savings</p>
                                                    <p className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                                        {month.savingsRate.toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Spending Trends */}
                    {insights.spendingStreaks.length > 0 && (
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <Activity className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                                <h3 className={`text-base sm:text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                    Spending Trends
                                </h3>
                            </div>
                            <div className={`flex-1 p-4 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                                <div className="space-y-3">
                                    {insights.spendingStreaks.slice(0, 3).map((streak, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 border ${
                                                darkMode ? 'bg-gray-900 border-gray-800' : 'bg-orange-50 border-orange-200'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'} mb-1`}>
                                                        Increasing Pattern
                                                    </p>
                                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {streak.startMonth} → {streak.endMonth}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                                        +{streak.increase.toFixed(1)}%
                                                    </p>
                                                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                        Increase
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FinancialInsights;

