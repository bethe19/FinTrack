import React, { useState } from 'react';
import { User, Phone, CreditCard } from 'lucide-react';
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
        <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
            <div className={`w-full max-w-md p-8 rounded-3xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                        Welcome! 👋
                    </h1>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Let's set up your profile
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-6 rounded-r-xl">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Your Name *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                                    } focus:outline-none focus:ring-2 focus:ring-coral-500`}
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Phone Number (Optional)
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+251 912 345 678"
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                                    } focus:outline-none focus:ring-2 focus:ring-coral-500`}
                            />
                        </div>
                    </div>

                    {/* Account Number */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            CBE Account Number (Optional)
                        </label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                placeholder="1000XXXXXXXX"
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                                    } focus:outline-none focus:ring-2 focus:ring-coral-500`}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-semibold transition-colors ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-coral-500 to-orange-600 hover:from-coral-600 hover:to-orange-700'
                            } text-white`}
                    >
                        {loading ? 'Saving...' : 'Continue'}
                    </button>
                </form>

                <p className={`text-xs text-center mt-6 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    No authentication required. Your data stays on your device.
                </p>
            </div>
        </div>
    );
};

export default ProfileSetup;
