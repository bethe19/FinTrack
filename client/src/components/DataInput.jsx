import React, { useState, useRef } from 'react';
import { MessageSquare, Upload, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { transactionAPI } from '../services/api';

const DataInput = ({ onSuccess, onClose, darkMode }) => {
    const [activeTab, setActiveTab] = useState('sms'); // 'sms' or 'csv'
    const [smsText, setSmsText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleSMSSubmit = async (e) => {
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

    const handleCSVUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await transactionAPI.uploadCSV(file);
            setResult(response);
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (err) {
            console.error('Error uploading CSV:', err);
            setError(err.message || 'Failed to upload CSV file');
        } finally {
            setLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className={`p-4 sm:p-6 lg:p-8 border max-w-3xl w-full mx-2 sm:mx-4 ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
                <div className="min-w-0 flex-1">
                    <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                        Add Transactions
                    </h2>
                    <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Paste SMS messages or upload CSV file
                    </p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className={`p-2 border flex-shrink-0 ${darkMode 
                            ? 'border-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white' 
                            : 'border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-black'
                        }`}
                    >
                        <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-0 mb-4 sm:mb-6 border border-gray-300 dark:border-gray-800">
                <button
                    onClick={() => setActiveTab('sms')}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base font-medium border-r border-gray-300 dark:border-gray-800 ${
                        activeTab === 'sms'
                            ? darkMode ? 'bg-white text-black' : 'bg-black text-white'
                            : darkMode ? 'bg-black text-gray-400 hover:text-white' : 'bg-white text-gray-600 hover:text-black'
                    }`}
                >
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Paste SMS</span>
                    <span className="sm:hidden">SMS</span>
                </button>
                <button
                    onClick={() => setActiveTab('csv')}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base font-medium ${
                        activeTab === 'csv'
                            ? darkMode ? 'bg-white text-black' : 'bg-black text-white'
                            : darkMode ? 'bg-black text-gray-400 hover:text-white' : 'bg-white text-gray-600 hover:text-black'
                    }`}
                >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Upload CSV</span>
                    <span className="sm:hidden">CSV</span>
                </button>
            </div>

            {error && (
                <div className={`border p-3 sm:p-4 mb-4 sm:mb-6 ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <p className={`text-xs sm:text-sm ${darkMode ? 'text-white' : 'text-black'}`}>{error}</p>
                </div>
            )}

            {result && (
                <div className={`border p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3 ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-white' : 'text-black'}`} />
                    <div className="min-w-0">
                        <p className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Success!</p>
                        <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{result.message}</p>
                    </div>
                </div>
            )}

            {/* SMS Tab */}
            {activeTab === 'sms' && (
                <div>
                    <div className={`mb-3 sm:mb-4 p-3 sm:p-4 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                        <p className={`text-xs font-semibold mb-1 sm:mb-2 uppercase ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Example CBE SMS:
                        </p>
                        <p className={`text-xs sm:text-sm font-mono break-words ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Dear Bethe your Account 1*****4624 has been Credited with ETB 1,000.00...
                        </p>
                    </div>

                    <form onSubmit={handleSMSSubmit}>
                        <textarea
                            value={smsText}
                            onChange={(e) => setSmsText(e.target.value)}
                            placeholder="Paste your SMS messages here... You can paste multiple messages at once."
                            rows={8}
                            className={`w-full p-3 sm:p-4 border font-mono text-xs sm:text-sm ${darkMode 
                                ? 'bg-black text-white border-gray-800' 
                                : 'bg-white text-black border-gray-300'
                            } focus:outline-none focus:border-black dark:focus:border-white`}
                        />

                        <button
                            type="submit"
                            disabled={loading || !smsText.trim()}
                            className={`w-full mt-3 sm:mt-4 flex items-center justify-center gap-2 py-2.5 sm:py-3 border font-semibold text-sm sm:text-base ${
                                loading || !smsText.trim()
                                    ? darkMode 
                                        ? 'bg-black border-gray-800 text-gray-600 cursor-not-allowed' 
                                        : 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                                    : darkMode 
                                        ? 'bg-white text-black border-white hover:bg-gray-100' 
                                        : 'bg-black text-white border-black hover:bg-gray-900'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                    Submit SMS
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* CSV Tab */}
            {activeTab === 'csv' && (
                <div>
                    <div className={`mb-3 sm:mb-4 p-3 sm:p-4 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                        <p className={`text-xs font-semibold mb-1 sm:mb-2 uppercase ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            CSV Format:
                        </p>
                        <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Your CSV should have columns: Date, Time, Content (with CBE transaction messages)
                        </p>
                    </div>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed p-6 sm:p-12 text-center cursor-pointer transition-colors ${darkMode
                                ? 'border-gray-800 hover:border-gray-700 bg-black'
                                : 'border-gray-300 hover:border-gray-400 bg-white'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleCSVUpload}
                            className="hidden"
                        />
                        <Upload className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <h3 className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                            {loading ? 'Uploading...' : 'Click to upload CSV file'}
                        </h3>
                        <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Drag and drop or click to select your CBE export CSV
                        </p>
                    </div>
                </div>
            )}

            <div className={`mt-4 sm:mt-6 p-3 sm:p-4 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <strong>Tip:</strong> {activeTab === 'sms'
                        ? 'You can paste multiple SMS messages at once. Separate them with blank lines.'
                        : 'Make sure your CSV file has the standard CBE export format.'}
                </p>
            </div>
        </div>
    );
};

export default DataInput;
