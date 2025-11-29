import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const CustomTooltip = ({ active, payload, darkMode }) => {
    if (active && payload && payload.length) {
        return (
            <div className={`p-4 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <p className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {payload[0].payload.name}
                </p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                            {entry.name}: ETB {entry.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const Charts = ({ data, darkMode }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart */}
            <div className={`p-6 rounded-2xl transition-all ${darkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Monthly Overview
                </h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                            <Legend
                                wrapperStyle={{ fontSize: '14px', color: darkMode ? '#d1d5db' : '#4b5563' }}
                            />
                            <Bar dataKey="Income" fill="#10b981" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="Expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Area Chart */}
            <div className={`p-6 rounded-2xl transition-all ${darkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Trend Analysis
                </h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                            <Legend
                                wrapperStyle={{ fontSize: '14px', color: darkMode ? '#d1d5db' : '#4b5563' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="Income"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorIncome)"
                            />
                            <Area
                                type="monotone"
                                dataKey="Expense"
                                stroke="#ef4444"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorExpense)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Charts;
