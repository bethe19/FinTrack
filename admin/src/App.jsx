import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminActivities from './pages/AdminActivities';
import AdminReports from './pages/AdminReports';
import { healthCheck } from './services/api';
import { isAuthenticated, removeToken, removeUser } from './utils/auth';

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
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Backend Unavailable</h1>
                    <p className="text-gray-400 mb-4">
                        Unable to connect to the backend server. Please check your connection.
                    </p>
                    <button
                        onClick={checkBackendAndAuth}
                        className="px-4 py-2 bg-white text-black hover:bg-gray-100"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!authenticated) {
        return <AdminLogin onLogin={handleLogin} darkMode={darkMode} />;
    }

    return (
        <Router>
            <Routes>
                <Route path="/*" element={
                    <AdminLayout darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout}>
                        <Routes>
                            <Route path="/" element={<AdminDashboard darkMode={darkMode} />} />
                            <Route path="/users" element={<AdminUsers darkMode={darkMode} />} />
                            <Route path="/activities" element={<AdminActivities darkMode={darkMode} />} />
                            <Route path="/reports" element={<AdminReports darkMode={darkMode} />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AdminLayout>
                } />
            </Routes>
        </Router>
    );
}

export default App;

