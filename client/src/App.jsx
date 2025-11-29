import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Overview from './pages/Overview';
import Analytics from './pages/Analytics';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminActivities from './pages/admin/AdminActivities';
import AdminReports from './pages/admin/AdminReports';
import { healthCheck } from './services/api';
import { isAuthenticated, removeToken, removeUser, getUser } from './utils/auth';

function App() {
    const [authenticated, setAuthenticated] = useState(null);
    const [backendAvailable, setBackendAvailable] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        checkBackendAndAuth();
    }, []);

    const checkBackendAndAuth = async () => {
        const isAvailable = await healthCheck();
        setBackendAvailable(isAvailable);

        if (!isAvailable) {
            console.error('Backend is not available');
            setAuthenticated(false);
            return;
        }

        // Check if user is authenticated (has valid token)
        const authenticated = isAuthenticated();
        setAuthenticated(authenticated);
    };

    const handleLogin = () => {
        setAuthenticated(true);
    };

    const handleLogout = () => {
        removeToken();
        removeUser();
        setAuthenticated(false);
    };

    if (!backendAvailable) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md p-8 bg-white rounded-3xl shadow-xl">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Backend Not Running</h2>
                    <p className="text-gray-600 mb-6">
                        Please start the backend server to use the finance dashboard.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-xl text-left">
                        <p className="text-sm font-semibold text-gray-700 mb-2">To start the backend:</p>
                        <code className="text-xs text-gray-600 block">
                            cd server && npm run dev
                        </code>
                    </div>
                </div>
            </div>
        );
    }

    if (authenticated === null) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-white'}`}>
                <div className="text-center">
                    <div className={`w-12 h-12 border-4 ${darkMode ? 'border-white border-t-transparent' : 'border-black border-t-transparent'} animate-spin mx-auto mb-4`} />
                    <p className={darkMode ? 'text-white' : 'text-black'}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!authenticated) {
        return <Login onLogin={handleLogin} darkMode={darkMode} />;
    }

    const user = getUser();
    const isAdmin = user?.role === 'admin';

    return (
        <Router>
            <Routes>
                {/* Admin Routes */}
                {isAdmin && (
                    <Route path="/admin/*" element={
                        <AdminLayout darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout}>
                            <Routes>
                                <Route path="/" element={<AdminDashboard darkMode={darkMode} />} />
                                <Route path="/users" element={<AdminUsers darkMode={darkMode} />} />
                                <Route path="/activities" element={<AdminActivities darkMode={darkMode} />} />
                                <Route path="/reports" element={<AdminReports darkMode={darkMode} />} />
                                <Route path="*" element={<Navigate to="/admin" replace />} />
                            </Routes>
                        </AdminLayout>
                    } />
                )}
                
                {/* Regular User Routes */}
                <Route path="/*" element={
                    <Layout darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout}>
                        <Routes>
                            <Route path="/" element={<Overview darkMode={darkMode} />} />
                            <Route path="/analytics" element={<Analytics darkMode={darkMode} />} />
                            <Route path="/transactions" element={<Transactions darkMode={darkMode} />} />
                            <Route path="/settings" element={<Settings darkMode={darkMode} />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Layout>
                } />
            </Routes>
        </Router>
    );
}

export default App;
