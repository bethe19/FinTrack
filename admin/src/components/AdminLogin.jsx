import React, { useState } from 'react';
import { Shield, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { setToken, setUser } from '../utils/auth';
import { authAPI } from '../services/api';

const AdminLogin = ({ onLogin, darkMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Authenticate with backend
            const response = await authAPI.login(email, password);
            
            // Check if user is admin
            if (response.user && response.user.role === 'admin') {
                setToken(response.token);
                setUser(response.user);
                onLogin();
            } else {
                setError('Access denied. Admin privileges required.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 ${darkMode ? 'bg-black' : 'bg-white'}`}>
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 border-2 mb-4 ${darkMode ? 'border-white bg-black' : 'border-black bg-white'}`}>
                        <Shield className={`w-8 h-8 ${darkMode ? 'text-white' : 'text-black'}`} />
                    </div>
                    <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                        Admin Login
                    </h1>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Sign in to access the admin dashboard
                    </p>
                </div>

                {error && (
                    <div className={`border-l-4 border-black p-4 mb-6 flex items-start gap-3 ${darkMode ? 'bg-gray-900 border-white' : 'bg-gray-100 border-black'}`}>
                        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-white' : 'text-black'}`} />
                        <p className={`text-sm ${darkMode ? 'text-white' : 'text-black'}`}>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                className={`w-full pl-12 pr-4 py-4 text-base border-2 ${darkMode 
                                    ? 'bg-black border-gray-800 text-white focus:border-white' 
                                    : 'bg-white border-gray-300 text-black focus:border-black'
                                } focus:outline-none`}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                            Password
                        </label>
                        <div className="relative">
                            <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className={`w-full pl-12 pr-4 py-4 text-base border-2 ${darkMode 
                                    ? 'bg-black border-gray-800 text-white focus:border-white' 
                                    : 'bg-white border-gray-300 text-black focus:border-black'
                                } focus:outline-none`}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !email || !password}
                        className={`w-full py-4 border-2 font-bold flex items-center justify-center gap-2 transition-all ${
                            loading || !email || !password
                                ? darkMode
                                    ? 'bg-black border-gray-800 text-gray-600 cursor-not-allowed'
                                    : 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                                : darkMode
                                    ? 'bg-white text-black border-white hover:bg-gray-100'
                                    : 'bg-black text-white border-black hover:bg-gray-900'
                        }`}
                    >
                        {loading ? (
                            'Signing in...'
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;

