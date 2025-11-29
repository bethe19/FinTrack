import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const Card = ({ title, amount, icon: Icon, darkMode }) => (
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
        </div>
    </div>
);

const SummaryCards = ({ data, darkMode }) => {
    if (!data) return null;
    
    const totalIncome = data.totalIncome || 0;
    const totalExpense = data.totalExpense || 0;
    const balance = data.balance || (totalIncome - totalExpense);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <Card
                title="Net Balance"
                amount={balance}
                icon={Wallet}
                darkMode={darkMode}
            />
        </div>
    );
};

export default SummaryCards;
