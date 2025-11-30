import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Activity, BarChart3, Moon, Sun, Menu, X, LogOut, Shield } from 'lucide-react';
import { getUser } from '../utils/auth';

const AdminLayout = ({ children, darkMode, setDarkMode, onLogout }) => {
    const [user] = useState(getUser());
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', path: '/', icon: Home },
        { name: 'Users', path: '/users', icon: Users },
        { name: 'Activities', path: '/activities', icon: Activity },
        { name: 'Reports', path: '/reports', icon: BarChart3 },
    ];

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className={`min-h-screen flex ${darkMode ? 'bg-black' : 'bg-white'} transition-colors duration-200`}>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`fixed lg:relative z-40 h-screen ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'} border-r transition-all duration-300 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                } ${sidebarOpen ? 'w-72' : 'w-0 lg:w-20'} overflow-hidden lg:overflow-visible`}
            >
                <div className="flex flex-col h-full p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 px-2">
                        {sidebarOpen && (
                            <div className="flex items-center gap-2">
                                <Shield className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-black'}`} />
                                <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                    Admin Panel
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
                                    onClick={() => {
                                        if (window.innerWidth < 1024) {
                                            setSidebarOpen(false);
                                        }
                                    }}
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

                        {sidebarOpen && user && (
                            <div className={`flex items-center gap-3 px-2 py-1 mb-3`}>
                                <div className={`w-9 h-9 border flex items-center justify-center font-bold ${darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                                    {user.email ? user.email.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <p className={`font-bold text-sm truncate ${darkMode ? 'text-white' : 'text-black'}`}>
                                        {user.email || 'Admin'}
                                    </p>
                                    <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Administrator
                                    </p>
                                </div>
                            </div>
                        )}

                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className={`flex items-center gap-3 w-full p-2 border ${darkMode 
                                    ? 'border-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white' 
                                    : 'border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-black'
                                } ${!sidebarOpen ? 'justify-center' : ''}`}
                            >
                                <LogOut className="w-5 h-5" />
                                {sidebarOpen && (
                                    <span className="font-medium text-sm">Logout</span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile Menu Button */}
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`fixed top-4 left-4 z-50 lg:hidden p-2 border ${darkMode 
                        ? 'bg-black border-gray-800 text-white' 
                        : 'bg-white border-gray-300 text-black'
                    }`}
                >
                    <Menu className="w-6 h-6" />
                </button>
            )}

            {/* Main Content Area */}
            <main className={`flex-1 overflow-x-hidden overflow-y-auto h-screen scroll-smooth transition-all duration-300 w-full`}>
                <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;


