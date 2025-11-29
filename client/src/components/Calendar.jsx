import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = ({ darkMode, onDateSelect, selectedDate }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isOpen, setIsOpen] = useState(false);

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

    const handleDayClick = (day) => {
        const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        onDateSelect(selected);
        setIsOpen(false);
    };

    const isSelectedDate = (day) => {
        if (!selectedDate) return false;
        const compareDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return compareDate.toDateString() === selectedDate.toDateString();
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                    } transition-colors`}
            >
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <div className="text-left">
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedDate ? selectedDate.getDate() : new Date().getDate()}
                    </p>
                    <p className="text-xs text-gray-500">
                        {selectedDate ?
                            selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long' }) :
                            new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long' })
                        }
                    </p>
                </div>
            </button>

            {isOpen && (
                <div className={`absolute right-0 top-full mt-2 p-4 rounded-2xl shadow-xl z-50 ${darkMode ? 'bg-gray-800' : 'bg-white'
                    } w-80`}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={handlePrevMonth}
                            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <button
                            onClick={handleNextMonth}
                            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Days of week */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                            <div
                                key={day}
                                className="text-center text-xs font-medium text-gray-500 py-2"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isSelected = isSelectedDate(day);
                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDayClick(day)}
                                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${isSelected
                                            ? 'bg-coral-500 text-white'
                                            : darkMode
                                                ? 'text-gray-300 hover:bg-gray-700'
                                                : 'text-gray-900 hover:bg-gray-100'
                                        }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => {
                                onDateSelect(new Date());
                                setIsOpen(false);
                            }}
                            className="w-full py-2 text-sm font-medium text-coral-500 hover:bg-coral-50 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
