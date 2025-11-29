import React, { useState } from 'react';
import { MessageSquare, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { transactionAPI } from '../services/api';

const SMSInput = ({ onSuccess, onClose, darkMode }) => {
    const [smsText, setSmsText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!smsText.trim()) {
            setError('Please paste your SMS messages');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await transactionAPI.submitSMS(smsText);
            setResult(response);
            setSmsText('');
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (err) {
            console.error('Error parsing SMS:', err);
            setError(err.message || 'Failed to parse SMS messages');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`p-8 rounded-3xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl max-w-3xl w-full`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-coral-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Add Transactions
                        </h2>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Paste your CBE SMS messages below
                        </p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                        <XCircle className="w-6 h-6 text-gray-400" />
                    </button>
                )}
            </div>

            {/* Example */}
            <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>
                    Example CBE SMS:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    Dear Bethe your Account 1*****4624 has been Credited with ETB 1,000.00 from Fitsum Gmariam...
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-xl">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {result && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r-xl flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-green-800">Success!</p>
                        <p className="text-sm text-green-700">{result.message}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <textarea
                    value={smsText}
                    onChange={(e) => setSmsText(e.target.value)}
                    placeholder="Paste your SMS messages here... You can paste multiple messages at once."
                    rows={12}
                    className={`w-full p-4 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-coral-500 font-mono text-sm`}
                />

                <div className="flex gap-3 mt-6">
                    <button
                        type="submit"
                        disabled={loading || !smsText.trim()}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors ${loading || !smsText.trim()
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-coral-500 to-orange-600 hover:from-coral-600 hover:to-orange-700'
                            } text-white`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Submit SMS
                            </>
                        )}
                    </button>

                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-6 py-3 rounded-xl font-semibold ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>💡 Tip:</strong> You can paste multiple SMS messages at once. Separate them with blank lines or paste them as they appear in your messages app.
                </p>
            </div>
        </div>
    );
};

export default SMSInput;
