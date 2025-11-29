import React, { useState } from 'react';
import { User, Mail, Lock, Wallet, TrendingUp, BarChart3, ArrowRight, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import { setToken, setUser } from '../utils/auth';

const Login = ({ onLogin, darkMode }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Login
                const response = await authAPI.login(email, password);
                setToken(response.token);
                setUser(response.user);
                onLogin();
            } else {
                // Register
                if (!name.trim()) {
                    setError('Please enter your name');
                    setLoading(false);
                    return;
                }
                const response = await authAPI.register(email, password, name);
                setToken(response.token);
                setUser(response.user);
                onLogin();
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex flex-col lg:flex-row ${darkMode ? 'bg-black' : 'bg-white'}`}>
            {/* Left Side - Welcome & Description */}
            <div className={`hidden lg:flex lg:w-1/2 ${darkMode ? 'bg-black border-r border-gray-800' : 'bg-white border-r border-gray-300'} flex-col justify-center px-12 py-16`}>
                <div className="max-w-lg">
                    <div className={`flex items-center gap-3 mb-8`}>
                        <div className={`w-12 h-12 border-2 flex items-center justify-center ${darkMode ? 'border-white bg-black' : 'border-black bg-white'}`}>
                            <Wallet className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-black'}`} />
                        </div>
                        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                            FinTrack
                        </h1>
                    </div>

                    <h2 className={`text-5xl font-bold mb-6 leading-tight ${darkMode ? 'text-white' : 'text-black'}`}>
                        Welcome to Your Financial Dashboard
                    </h2>

                    <p className={`text-lg mb-8 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Track your income and expenses with ease. Import transactions from SMS messages or CSV files, analyze your spending patterns, and gain insights into your financial habits.
                    </p>

                    <div className="space-y-6 mb-8">
                        <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 border-2 flex items-center justify-center flex-shrink-0 ${darkMode ? 'border-white bg-black' : 'border-black bg-white'}`}>
                                <BarChart3 className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-black'}`} />
                            </div>
                            <div>
                                <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-black'}`}>
                                    Financial Analytics
                                </h3>
                                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Get detailed insights into your spending patterns and income trends
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 border-2 flex items-center justify-center flex-shrink-0 ${darkMode ? 'border-white bg-black' : 'border-black bg-white'}`}>
                                <TrendingUp className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-black'}`} />
                            </div>
                            <div>
                                <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-black'}`}>
                                    Smart Insights
                                </h3>
                                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Discover overspent months, best performing periods, and spending trends
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 border-2 flex items-center justify-center flex-shrink-0 ${darkMode ? 'border-white bg-black' : 'border-black bg-white'}`}>
                                <Wallet className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-black'}`} />
                            </div>
                            <div>
                                <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-black'}`}>
                                    Easy Import
                                </h3>
                                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Import transactions from SMS messages or CSV files in seconds
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Welcome Section */}
            <div className={`lg:hidden ${darkMode ? 'bg-black border-b border-gray-800' : 'bg-white border-b border-gray-300'} px-6 py-8`}>
                <div className={`flex items-center gap-3 mb-4`}>
                    <div className={`w-10 h-10 border-2 flex items-center justify-center ${darkMode ? 'border-white bg-black' : 'border-black bg-white'}`}>
                        <Wallet className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-black'}`} />
                    </div>
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                        FinTrack
                    </h1>
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                    Welcome to Your Financial Dashboard
                </h2>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Track your income and expenses with ease. Import transactions and gain insights into your financial habits.
                </p>
            </div>

            {/* Right Side - Login/Signup Form */}
            <div className={`w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 ${darkMode ? 'bg-black' : 'bg-white'}`}>
                <div className="w-full max-w-md">
                    <div className="mb-6 sm:mb-8">
                        <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                            {isLogin ? 'Welcome Back' : 'Get Started'}
                        </h2>
                        <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {isLogin ? 'Sign in to continue' : 'Create your account to begin tracking'}
                        </p>
                    </div>

                    {error && (
                        <div className={`border-l-4 border-black p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-3 ${darkMode ? 'bg-gray-900 border-white' : 'bg-gray-100 border-black'}`}>
                            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-white' : 'text-black'}`} />
                            <p className={`text-xs sm:text-sm ${darkMode ? 'text-white' : 'text-black'}`}>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6">
                        {!isLogin && (
                            <div>
                                <label className={`block text-xs sm:text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                                    Your Name *
                                </label>
                                <div className="relative">
                                    <User className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 ${darkMode 
                                            ? 'bg-black border-gray-800 text-white focus:border-white' 
                                            : 'bg-white border-gray-300 text-black focus:border-black'
                                        } focus:outline-none`}
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className={`block text-xs sm:text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                                Email Address *
                            </label>
                            <div className="relative">
                                <Mail className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 ${darkMode 
                                        ? 'bg-black border-gray-800 text-white focus:border-white' 
                                        : 'bg-white border-gray-300 text-black focus:border-black'
                                    } focus:outline-none`}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className={`block text-xs sm:text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                                Password *
                            </label>
                            <div className="relative">
                                <Lock className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 ${darkMode 
                                        ? 'bg-black border-gray-800 text-white focus:border-white' 
                                        : 'bg-white border-gray-300 text-black focus:border-black'
                                    } focus:outline-none`}
                                    required
                                    minLength={6}
                                />
                            </div>
                            {!isLogin && (
                                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                    Password must be at least 6 characters
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email || !password || (!isLogin && !name.trim())}
                            className={`w-full py-3 sm:py-4 border-2 font-bold flex items-center justify-center gap-2 transition-all text-sm sm:text-base ${
                                loading || !email || !password || (!isLogin && !name.trim())
                                    ? darkMode
                                        ? 'bg-black border-gray-800 text-gray-600 cursor-not-allowed'
                                        : 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                                    : darkMode
                                        ? 'bg-white text-black border-white hover:bg-gray-100'
                                        : 'bg-black text-white border-black hover:bg-gray-900'
                            }`}
                        >
                            {loading ? (
                                'Processing...'
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className={`mt-6 text-center`}>
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setPassword('');
                                if (isLogin) setName('');
                            }}
                            className={`text-sm font-medium ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                        >
                            {isLogin ? (
                                <>
                                    Don't have an account? <span className="underline">Sign up</span>
                                </>
                            ) : (
                                <>
                                    Already have an account? <span className="underline">Sign in</span>
                                </>
                            )}
                        </button>
                    </div>

                    <p className={`text-xs text-center mt-4 sm:mt-6 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Your data is secure and private. Each user has isolated access.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

