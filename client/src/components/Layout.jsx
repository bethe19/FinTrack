import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, List, Settings, Plus, Moon, Sun, Menu, X } from 'lucide-react';
import DataInput from './DataInput';

const Layout = ({ children, darkMode, setDarkMode }) => {
    const location = useLocation();
    const [showSMSInput, setShowSMSInput] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navigation = [
        { name: 'Overview', path: '/', icon: Home },
        { name: 'Analytics', path: '/analytics', icon: TrendingUp },
        { name: 'Transactions', path: '/transactions', icon: List },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    if (showSMSInput) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-white'}`}>
                <div className={`absolute inset-0 ${darkMode ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
                    <DataInput
                        onSuccess={() => {
                            setShowSMSInput(false);
                            window.location.reload();
                        }}
                        onClose={() => setShowSMSInput(false)}
                        darkMode={darkMode}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex ${darkMode ? 'bg-black' : 'bg-white'} transition-colors duration-200`}>
            {/* Sidebar */}
            <aside 
                className={`fixed lg:relative z-40 h-screen ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'} border-r transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-72' : 'w-20 lg:w-24'}`}
            >
                <div className="flex flex-col h-full p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 px-2">
                        {sidebarOpen && (
                            <div className="flex items-center gap-2">
                                <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                    FinTrack
                                </span>
                            </div>
                        )}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className={`p-2 border ${darkMode 
                                ? 'border-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white' 
                                : 'border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-black'
                            }`}
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1 flex-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`group flex items-center gap-3 px-4 py-3 border transition-all duration-200 ${
                                        active
                                            ? darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                                            : darkMode ? 'border-gray-800 text-gray-400 hover:text-white hover:border-gray-700' : 'border-transparent text-gray-600 hover:text-black hover:border-gray-300'
                                    } ${!sidebarOpen ? 'justify-center px-2' : ''}`}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Add Data Button */}
                    <div className="mb-6">
                         <button
                            onClick={() => setShowSMSInput(true)}
                            className={`w-full flex items-center justify-center gap-2 p-4 border ${darkMode 
                                ? 'bg-black text-white border-gray-800 hover:bg-gray-900' 
                                : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                            } group`}
                            title={!sidebarOpen ? "Add Data" : ""}
                        >
                            <Plus className="w-5 h-5" strokeWidth={2} />
                            {sidebarOpen && (
                                <span className="font-bold text-sm">Add Transaction</span>
                            )}
                        </button>
                    </div>

                    {/* Footer Actions */}
                    <div className={`pt-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-300'} space-y-4`}>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`flex items-center gap-3 w-full p-2 border ${darkMode 
                                ? 'border-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white' 
                                : 'border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-black'
                            } ${!sidebarOpen ? 'justify-center' : ''}`}
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            {sidebarOpen && (
                                <span className="font-medium text-sm">
                                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                                </span>
                            )}
                        </button>

                        {sidebarOpen && (
                            <div className={`flex items-center gap-3 px-2 py-1`}>
                                <div className={`w-9 h-9 border flex items-center justify-center font-bold ${darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                                    B
                                </div>
                                <div className="overflow-hidden">
                                    <p className={`font-bold text-sm truncate ${darkMode ? 'text-white' : 'text-black'}`}>Bethe</p>
                                    <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>CBE Account</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`flex-1 overflow-x-hidden overflow-y-auto h-screen scroll-smooth transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
                <div className="container mx-auto p-6 lg:p-8 max-w-7xl">
                     {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
