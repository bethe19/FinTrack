import React from 'react';
import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react';

const Card = ({ title, amount, subtitle, icon: Icon, darkMode }) => (
    <div className={`p-4 sm:p-6 border transition-all ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
        <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className={`p-2 sm:p-3 border ${darkMode ? 'bg-white border-white' : 'bg-black border-black'}`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-black' : 'text-white'}`} />
            </div>
        </div>
        <div>
            <p className={`text-xs sm:text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {title}
            </p>
            <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                <span className="text-sm sm:text-base lg:text-lg font-normal">ETB</span>{' '}
                {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            {subtitle && (
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {subtitle}
                </p>
            )}
        </div>
    </div>
);

const SummaryCards = ({ data, darkMode }) => {
    if (!data) return null;
    
    // Ensure all values are numbers
    const totalIncome = typeof data.totalIncome === 'number' ? data.totalIncome : parseFloat(data.totalIncome) || 0;
    const totalExpense = typeof data.totalExpense === 'number' ? data.totalExpense : parseFloat(data.totalExpense) || 0;
    const balance = typeof data.balance === 'number' ? data.balance : (totalIncome - totalExpense);
    const currentBalance = data.currentBalance != null ? 
        (typeof data.currentBalance === 'number' ? data.currentBalance : parseFloat(data.currentBalance)) : null;
    const netChange = typeof data.netChange === 'number' ? data.netChange : (totalIncome - totalExpense);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card
                title="Total Income"
                amount={totalIncome}
                icon={TrendingUp}
                darkMode={darkMode}
            />
            <Card
                title="Total Expenses"
                amount={totalExpense}
                icon={TrendingDown}
                darkMode={darkMode}
            />
            {currentBalance != null && (
                <Card
                    title="Current Balance"
                    amount={currentBalance}
                    subtitle="From latest SMS"
                    icon={Wallet}
                    darkMode={darkMode}
                />
            )}
            <Card
                title="Net Change"
                amount={netChange}
                subtitle={`Calculated (${netChange >= 0 ? '+' : ''}${netChange.toFixed(2)})`}
                icon={DollarSign}
                darkMode={darkMode}
            />
        </div>
    );
};

export default SummaryCards;
