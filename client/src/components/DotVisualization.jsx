import React from 'react';

const DotVisualization = ({ value, max, rows = 5, cols = 15, color = 'coral' }) => {
    const total = rows * cols;
    const percentage = (value / max) * 100;
    const filledDots = Math.round((percentage / 100) * total);

    const colorClasses = {
        coral: 'bg-coral-500',
        blue: 'bg-blue-500',
        gray: 'bg-gray-300'
    };

    return (
        <div className="inline-flex flex-col gap-1.5">
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-1.5">
                    {Array.from({ length: cols }).map((_, colIndex) => {
                        const dotIndex = rowIndex * cols + colIndex;
                        const isFilled = dotIndex < filledDots;
                        return (
                            <div
                                key={colIndex}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${isFilled ? colorClasses[color] : 'bg-gray-200'
                                    }`}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default DotVisualization;
