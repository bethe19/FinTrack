import React, { useState } from 'react';
import { User, Phone, CreditCard, Wallet, TrendingUp, BarChart3, ArrowRight } from 'lucide-react';
import { profileAPI } from '../services/api';

const ProfileSetup = ({ onComplete, darkMode }) => {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await profileAPI.createOrUpdate({
                name: name.trim(),
                phone_number: phoneNumber.trim(),
                account_number: accountNumber.trim()
            });
            onComplete();
        } catch (err) {
            console.error('Error saving profile:', err);
            setError('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex ${darkMode ? 'bg-black' : 'bg-white'}`}>
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

            {/* Right Side - Login Form */}
            <div className={`w-full lg:w-1/2 flex items-center justify-center px-8 py-16 ${darkMode ? 'bg-black' : 'bg-white'}`}>
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                            Get Started
                        </h2>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Enter your details to begin tracking your finances
                        </p>
                    </div>

                    {error && (
                        <div className={`border-l-4 border-black p-4 mb-6 ${darkMode ? 'bg-gray-900 border-white' : 'bg-gray-100 border-black'}`}>
                            <p className={`text-sm ${darkMode ? 'text-white' : 'text-black'}`}>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                                Your Name *
                            </label>
                            <div className="relative">
                                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className={`w-full pl-12 pr-4 py-4 border-2 ${darkMode 
                                        ? 'bg-black border-gray-800 text-white focus:border-white' 
                                        : 'bg-white border-gray-300 text-black focus:border-black'
                                    } focus:outline-none`}
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                                Phone Number
                                <span className={`text-xs font-normal ml-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>(Optional)</span>
                            </label>
                            <div className="relative">
                                <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+251 912 345 678"
                                    className={`w-full pl-12 pr-4 py-4 border-2 ${darkMode 
                                        ? 'bg-black border-gray-800 text-white focus:border-white' 
                                        : 'bg-white border-gray-300 text-black focus:border-black'
                                    } focus:outline-none`}
                                />
                            </div>
                        </div>

                        {/* Account Number */}
                        <div>
                            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                                CBE Account Number
                                <span className={`text-xs font-normal ml-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>(Optional)</span>
                            </label>
                            <div className="relative">
                                <CreditCard className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder="1000XXXXXXXX"
                                    className={`w-full pl-12 pr-4 py-4 border-2 ${darkMode 
                                        ? 'bg-black border-gray-800 text-white focus:border-white' 
                                        : 'bg-white border-gray-300 text-black focus:border-black'
                                    } focus:outline-none`}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className={`w-full py-4 border-2 font-bold flex items-center justify-center gap-2 transition-all ${
                                loading || !name.trim()
                                    ? darkMode
                                        ? 'bg-black border-gray-800 text-gray-600 cursor-not-allowed'
                                        : 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                                    : darkMode
                                        ? 'bg-white text-black border-white hover:bg-gray-100'
                                        : 'bg-black text-white border-black hover:bg-gray-900'
                            }`}
                        >
                            {loading ? (
                                'Saving...'
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className={`text-xs text-center mt-6 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Your data stays on your device. No authentication required.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;
