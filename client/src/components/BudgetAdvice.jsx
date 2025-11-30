import React, { useMemo } from 'react';
import { Lightbulb, TrendingUp, TrendingDown, Target, AlertCircle, Sparkles } from 'lucide-react';

const BudgetAdvice = ({ transactions, stats, darkMode }) => {
    const adviceCards = useMemo(() => {
        if (!transactions || transactions.length === 0 || !stats) return [];

        const cards = [];
        const totalIncome = stats.totalIncome || 0;
        const totalExpense = stats.totalExpense || 0;
        const netBalance = stats.balance || 0;
        const expenseCount = stats.expense?.count || 0;
        const incomeCount = stats.income?.count || 0;

        // Calculate expense ratio
        const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
        
        // Calculate average expense
        const avgExpense = expenseCount > 0 ? totalExpense / expenseCount : 0;
        const avgIncome = incomeCount > 0 ? totalIncome / incomeCount : 0;

        // Advice 1: Spending ratio
        if (expenseRatio > 90) {
            cards.push({
                icon: AlertCircle,
                color: 'red',
                title: 'High Spending Alert',
                message: `You're spending ${expenseRatio.toFixed(1)}% of your income. Consider reducing expenses to build savings.`,
                priority: 'high'
            });
        } else if (expenseRatio > 70) {
            cards.push({
                icon: Target,
                color: 'yellow',
                title: 'Budget Optimization',
                message: `You're spending ${expenseRatio.toFixed(1)}% of your income. Aim for 50-70% to maintain healthy savings.`,
                priority: 'medium'
            });
        } else if (expenseRatio < 50 && totalIncome > 0) {
            cards.push({
                icon: Sparkles,
                color: 'green',
                title: 'Great Savings Rate!',
                message: `You're only spending ${expenseRatio.toFixed(1)}% of your income. Excellent financial discipline!`,
                priority: 'low'
            });
        }

        // Advice 2: Net balance status
        if (netBalance < 0) {
            cards.push({
                icon: TrendingDown,
                color: 'red',
                title: 'Negative Net Balance',
                message: 'Your expenses exceed your income. Review your spending patterns and identify areas to cut back.',
                priority: 'high'
            });
        } else if (netBalance > 0 && totalIncome > 0) {
            const savingsRate = (netBalance / totalIncome) * 100;
            if (savingsRate > 20) {
                cards.push({
                    icon: TrendingUp,
                    color: 'green',
                    title: 'Strong Savings',
                    message: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep up the excellent work!`,
                    priority: 'low'
                });
            }
        }

        // Advice 3: Transaction frequency
        if (expenseCount > incomeCount * 2 && expenseCount > 10) {
            cards.push({
                icon: AlertCircle,
                color: 'yellow',
                title: 'Frequent Spending',
                message: `You have ${expenseCount} expense transactions vs ${incomeCount} income. Consider consolidating smaller purchases.`,
                priority: 'medium'
            });
        }

        // Advice 4: Average transaction size
        if (avgExpense > avgIncome * 0.5 && avgIncome > 0) {
            cards.push({
                icon: Target,
                color: 'yellow',
                title: 'Large Expense Transactions',
                message: `Your average expense (ETB ${avgExpense.toFixed(0)}) is significant compared to income. Plan major purchases carefully.`,
                priority: 'medium'
            });
        }

        // Advice 5: Positive net balance encouragement
        if (netBalance > 0 && totalIncome > 0) {
            const monthsCovered = Math.max(1, Math.ceil(transactions.length / 30));
            const monthlyAvg = netBalance / monthsCovered;
            if (monthlyAvg > 1000) {
                cards.push({
                    icon: Sparkles,
                    color: 'green',
                    title: 'Building Wealth',
                    message: `You're averaging ETB ${monthlyAvg.toFixed(0)} in savings. Consider investing or buying Useful tool.`,
                    priority: 'low'
                });
            }
        }

        // Sort by priority (high > medium > low) and limit to 3 cards
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return cards
            .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
            .slice(0, 3);
    }, [transactions, stats]);

    if (!adviceCards || adviceCards.length === 0) return null;

    const getColorClasses = (color) => {
        if (darkMode) {
            return {
                bg: color === 'red' ? 'bg-red-900/20 border-red-800' : 
                    color === 'yellow' ? 'bg-yellow-900/20 border-yellow-800' : 
                    'bg-green-900/20 border-green-800',
                icon: color === 'red' ? 'text-red-400' : 
                    color === 'yellow' ? 'text-yellow-400' : 
                    'text-green-400',
                border: color === 'red' ? 'border-red-800' : 
                    color === 'yellow' ? 'border-yellow-800' : 
                    'border-green-800'
            };
        } else {
            return {
                bg: color === 'red' ? 'bg-red-50 border-red-200' : 
                    color === 'yellow' ? 'bg-yellow-50 border-yellow-200' : 
                    'bg-green-50 border-green-200',
                icon: color === 'red' ? 'text-red-600' : 
                    color === 'yellow' ? 'text-yellow-600' : 
                    'text-green-600',
                border: color === 'red' ? 'border-red-200' : 
                    color === 'yellow' ? 'border-yellow-200' : 
                    'border-green-200'
            };
        }
    };

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                <Lightbulb className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-black'}`} />
                <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                    AI Budget Insights
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adviceCards.map((advice, index) => {
                    const colors = getColorClasses(advice.color);
                    const Icon = advice.icon;
                    return (
                        <div
                            key={index}
                            className={`p-4 sm:p-5 border ${colors.bg} ${colors.border} transition-all hover:shadow-lg`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 border ${darkMode ? 'bg-black/30 border-gray-700' : 'bg-white border-gray-200'} flex-shrink-0`}>
                                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm sm:text-base font-semibold mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>
                                        {advice.title}
                                    </h4>
                                    <p className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {advice.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BudgetAdvice;

