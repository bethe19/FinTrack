import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TransactionCalendar = ({ transactions, darkMode }) => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date());

    // Group transactions by date
    const transactionsByDate = useMemo(() => {
        const grouped = {};
        transactions.forEach(t => {
            // Safely parse date
            const dateValue = t.transaction_date || t.created_at || t.date;
            if (!dateValue) return; // Skip transactions without dates
            
            const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
            
            // Validate date
            if (isNaN(date.getTime())) return; // Skip invalid dates
            
            try {
                const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
                
                if (!grouped[dateKey]) {
                    grouped[dateKey] = { income: 0, expense: 0, count: 0 };
                }
                
                // Ensure amount is a number (handle string amounts from API)
                const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0;
                
                if (t.type === 'income') {
                    grouped[dateKey].income += amount;
                } else {
                    grouped[dateKey].expense += amount;
                }
                grouped[dateKey].count += 1;
            } catch (error) {
                // Skip transactions that cause errors
                console.warn('Error processing transaction date:', error);
            }
        });
        return grouped;
    }, [transactions]);

    // Get max values for intensity calculation
    const maxValues = useMemo(() => {
        let maxIncome = 0;
        let maxExpense = 0;
        Object.values(transactionsByDate).forEach(day => {
            maxIncome = Math.max(maxIncome, day.income);
            maxExpense = Math.max(maxExpense, day.expense);
        });
        return { maxIncome: maxIncome || 1, maxExpense: maxExpense || 1 };
    }, [transactionsByDate]);

    const daysInMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
    ).getDay();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const getDayData = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateKey = date.toISOString().split('T')[0];
        return transactionsByDate[dateKey] || { income: 0, expense: 0, count: 0 };
    };

    const getIntensity = (value, max) => {
        if (value === 0) return 0;
        const ratio = value / max;
        if (ratio > 0.8) return 4;
        if (ratio > 0.5) return 3;
        if (ratio > 0.3) return 2;
        return 1;
    };

    const getDayColor = (day) => {
        const dayData = getDayData(day);
        
        if (dayData.count === 0) {
            return darkMode ? '#1F2937' : '#F3F4F6'; // Gray for no activity
        }

        // Determine if it's primarily income or expense day
        const isIncomeDay = dayData.income >= dayData.expense;
        
        if (isIncomeDay && dayData.income > 0) {
            // Income days - green shades
            const intensity = getIntensity(dayData.income, maxValues.maxIncome);
            const greenShades = {
                1: '#86EFAC', // light green
                2: '#4ADE80', // medium green
                3: '#22C55E', // green
                4: '#16A34A'  // dark green
            };
            return greenShades[intensity] || greenShades[1];
        } else if (!isIncomeDay && dayData.expense > 0) {
            // Expense days - red shades
            const intensity = getIntensity(dayData.expense, maxValues.maxExpense);
            const redShades = {
                1: '#FCA5A5', // light red
                2: '#F87171', // medium red
                3: '#EF4444', // red
                4: '#DC2626'  // dark red
            };
            return redShades[intensity] || redShades[1];
        }

        return darkMode ? '#1F2937' : '#F3F4F6';
    };

    const isToday = (day) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear()
        );
    };

    return (
        <div className={`p-4 sm:p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                    Transaction Calendar
                </h3>
                <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-start">
                    <button
                        onClick={handlePrevMonth}
                        className={`p-1.5 sm:p-1 border ${darkMode 
                            ? 'border-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white' 
                            : 'border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-black'
                        }`}
                    >
                        <ChevronLeft className="w-4 h-4 sm:w-3 sm:h-3" />
                    </button>
                    <span className={`px-3 sm:px-2 py-1 text-xs sm:text-xs font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
                        {monthNames[currentMonth.getMonth()].substring(0, 3)} {currentMonth.getFullYear()}
                    </span>
                    <button
                        onClick={handleNextMonth}
                        className={`p-1.5 sm:p-1 border ${darkMode 
                            ? 'border-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white' 
                            : 'border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-black'
                        }`}
                    >
                        <ChevronRight className="w-4 h-4 sm:w-3 sm:h-3" />
                    </button>
                </div>
            </div>

            <div className="flex items-start gap-4">
                {/* Days of week - compact */}
                <div className="flex flex-col gap-0.5 mt-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                        <div
                            key={day}
                            className={`text-center text-[9px] font-medium h-3 flex items-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days - compact GitHub style */}
                <div className="flex-1">
                    <div className="grid grid-cols-7 gap-0.5">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-3" />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayData = getDayData(day);
                            const color = getDayColor(day);
                            const today = isToday(day);
                            
                            return (
                                <div
                                    key={day}
                                    className="h-3 relative group"
                                >
                                    <div
                                        style={{ backgroundColor: color }}
                                        className={`w-full h-full transition-all ${
                                            today ? 'ring-1 ' + (darkMode ? 'ring-white' : 'ring-black') : ''
                                        }`}
                                        title={
                                            dayData.count > 0
                                                ? `${day}/${currentMonth.getMonth() + 1}/${currentMonth.getFullYear()}\nIncome: ETB ${dayData.income.toLocaleString()}\nExpense: ETB ${dayData.expense.toLocaleString()}\nTransactions: ${dayData.count}`
                                                : `${day}/${currentMonth.getMonth() + 1}/${currentMonth.getFullYear()}\nNo transactions`
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Compact Legend */}
            <div className={`mt-3 sm:mt-4 pt-3 border-t flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-[9px] sm:text-[10px] ${darkMode ? 'border-gray-800' : 'border-gray-300'}`}>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5" style={{ backgroundColor: '#86EFAC' }} />
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Less income</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5" style={{ backgroundColor: '#16A34A' }} />
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>More income</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5" style={{ backgroundColor: '#FCA5A5' }} />
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Less expense</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5" style={{ backgroundColor: '#DC2626' }} />
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>More expense</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No activity</span>
                </div>
            </div>
        </div>
    );
};

export default TransactionCalendar;
