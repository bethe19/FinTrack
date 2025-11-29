import React, { useState, useEffect } from 'react';
import { profileAPI, transactionAPI } from '../services/api';
import { Loader2, User, Phone, CreditCard, Trash2, AlertTriangle, Calendar, Mail, Edit2, Save, Wallet, TrendingUp, Activity } from 'lucide-react';
import Alert from '../components/Alert';
import ConfirmDialog from '../components/ConfirmDialog';
import { getReportType, setReportType, REPORT_TYPES, getReportTypeLabel } from '../utils/reportFilter';

const Settings = ({ darkMode }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [account, setAccount] = useState('');
    const [selectedReportType, setSelectedReportType] = useState(REPORT_TYPES.ALL_TIME);
    const [alert, setAlert] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadProfile();
        setSelectedReportType(getReportType());
    }, []);

    useEffect(() => {
        // Auto-enable editing if no profile exists yet
        if (!loading && !profile) {
            setIsEditing(true);
        }
    }, [loading, profile]);

    const loadProfile = async () => {
        try {
            const data = await profileAPI.get();
            if (data) {
                setProfile(data);
                setName(data.name || '');
                setPhone(data.phone_number || '');
                setAccount(data.account_number || '');
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ type, message });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await profileAPI.createOrUpdate({ name, phone_number: phone, account_number: account });
            showAlert('success', 'Profile updated successfully!');
            loadProfile();
        } catch (err) {
            console.error('Error saving profile:', err);
            showAlert('error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleReportTypeChange = (type) => {
        setSelectedReportType(type);
        setReportType(type);
        showAlert('success', `Report type changed to ${getReportTypeLabel(type)}`);
        
        // Dispatch custom event to notify other pages
        window.dispatchEvent(new CustomEvent('reportTypeChanged', { detail: { type } }));
    };

    const handleDeleteAll = async () => {
        try {
            await transactionAPI.deleteAll();
            showAlert('success', 'All transactions deleted successfully');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            console.error('Error deleting transactions:', err);
            showAlert('error', 'Failed to delete transactions');
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className={`w-12 h-12 animate-spin ${darkMode ? 'text-white' : 'text-black'}`} />
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto">
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                    darkMode={darkMode}
                />
            )}

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteAll}
                title="Delete All Transactions"
                message="Are you absolutely sure you want to delete ALL transactions? This action cannot be undone and will permanently remove all your financial data. Please confirm this is what you want to do."
                confirmText="Yes, Delete All"
                cancelText="Cancel"
                type="danger"
                darkMode={darkMode}
            />

            {/* Profile Header Section */}
            <div className={`mb-4 sm:mb-6 lg:mb-8 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                <div className={`p-4 sm:p-6 lg:p-8 ${darkMode ? 'bg-gradient-to-r from-gray-900 to-black' : 'bg-gradient-to-r from-gray-50 to-white'}`}>
                    <div className="flex items-start gap-4 sm:gap-6">
                        {/* Profile Avatar */}
                        <div className={`relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center text-xl sm:text-2xl lg:text-3xl font-bold flex-shrink-0 ${
                            darkMode 
                                ? 'bg-white text-black border-4 border-white' 
                                : 'bg-black text-white border-4 border-black'
                        } shadow-lg`}>
                            {getInitials(name || profile?.name)}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold truncate ${darkMode ? 'text-white' : 'text-black'}`}>
                                    {name || profile?.name || 'Your Profile'}
                                </h1>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className={`p-1.5 sm:p-2 transition-colors flex-shrink-0 ${
                                            darkMode 
                                                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                                                : 'hover:bg-gray-100 text-gray-600 hover:text-black'
                                        }`}
                                    >
                                        <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                )}
                            </div>
                            <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 sm:mb-4`}>
                                Manage your personal information and preferences
                            </p>
                            
                            {/* Quick Stats */}
                            <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 sm:mt-4">
                                {phone && (
                                    <div className={`flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 ${
                                        darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="text-xs truncate">{phone}</span>
                                    </div>
                                )}
                                {account && (
                                    <div className={`flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 ${
                                        darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="text-xs truncate">{account.slice(0, 4)}****{account.slice(-4)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Settings */}
            <div className={`p-4 sm:p-6 lg:p-8 border mb-4 sm:mb-6 ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <h3 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3 ${darkMode ? 'text-white' : 'text-black'}`}>
                        <User className="w-5 h-5 sm:w-6 sm:h-6" />
                        Personal Information
                    </h3>
                    {isEditing && (
                        <button
                            onClick={() => setIsEditing(false)}
                            className={`text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 border transition-colors ${
                                darkMode
                                    ? 'border-gray-800 text-gray-400 hover:bg-gray-900'
                                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Cancel
                        </button>
                    )}
                </div>

                <div className="space-y-4 sm:space-y-6">
                    <div className={`p-3 sm:p-4 border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                        <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <User className="w-4 h-4 sm:w-5 sm:h-5" />
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!isEditing}
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border transition-all ${
                                darkMode 
                                    ? 'bg-black text-white border-gray-800 disabled:bg-gray-900 disabled:text-gray-500' 
                                    : 'bg-white text-black border-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
                            } focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:cursor-not-allowed`}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className={`p-3 sm:p-4 border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                        <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                            Phone Number
                            <span className={`text-xs font-normal ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>(Optional)</span>
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={!isEditing}
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border transition-all ${
                                darkMode 
                                    ? 'bg-black text-white border-gray-800 disabled:bg-gray-900 disabled:text-gray-500' 
                                    : 'bg-white text-black border-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
                            } focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:cursor-not-allowed`}
                            placeholder="+251 XXX XXX XXX"
                        />
                    </div>

                    <div className={`p-3 sm:p-4 border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                        <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                            CBE Account Number
                            <span className={`text-xs font-normal ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>(Optional)</span>
                        </label>
                        <input
                            type="text"
                            value={account}
                            onChange={(e) => setAccount(e.target.value)}
                            disabled={!isEditing}
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border transition-all ${
                                darkMode 
                                    ? 'bg-black text-white border-gray-800 disabled:bg-gray-900 disabled:text-gray-500' 
                                    : 'bg-white text-black border-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
                            } focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:cursor-not-allowed`}
                            placeholder="Enter your account number"
                        />
                    </div>

                    {isEditing && (
                        <button
                            onClick={async () => {
                                await handleSave();
                                setIsEditing(false);
                            }}
                            disabled={saving || !name}
                            className={`w-full py-3 sm:py-4 border-2 font-bold text-sm sm:text-base lg:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-all ${
                                saving || !name
                                    ? darkMode 
                                        ? 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed' 
                                        : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                    : darkMode 
                                        ? 'bg-white text-black border-white hover:bg-gray-100 shadow-lg' 
                                        : 'bg-black text-white border-black hover:bg-gray-900 shadow-lg'
                            }`}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Report Type Settings */}
            <div className={`p-4 sm:p-6 lg:p-8 border mb-4 sm:mb-6 ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                <h3 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3`}>
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                    View Preferences
                </h3>
                <p className={`text-xs sm:text-sm mb-4 sm:mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Customize how you view your financial data across all pages
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    {Object.values(REPORT_TYPES).map((type) => (
                        <label
                            key={type}
                            className={`relative flex flex-col p-4 sm:p-6 border-2 cursor-pointer transition-all group ${
                                selectedReportType === type
                                    ? darkMode
                                        ? 'border-white bg-gray-900 shadow-lg'
                                        : 'border-black bg-gray-50 shadow-lg'
                                    : darkMode
                                        ? 'border-gray-800 hover:border-gray-700 hover:bg-gray-900'
                                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                        >
                            <input
                                type="radio"
                                name="reportType"
                                value={type}
                                checked={selectedReportType === type}
                                onChange={() => handleReportTypeChange(type)}
                                className="sr-only"
                            />
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0 ${
                                    selectedReportType === type
                                        ? darkMode ? 'bg-white text-black' : 'bg-black text-white'
                                        : darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'
                                } transition-colors`}>
                                    {type === REPORT_TYPES.ALL_TIME && <Activity className="w-4 h-4 sm:w-5 sm:h-5" />}
                                    {type === REPORT_TYPES.PER_YEAR && <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
                                    {type === REPORT_TYPES.PER_MONTH && <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
                                </div>
                                <p className={`font-bold text-sm sm:text-base lg:text-lg ${darkMode ? 'text-white' : 'text-black'}`}>
                                    {getReportTypeLabel(type)}
                                </p>
                            </div>
                            <p className={`text-xs leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {type === REPORT_TYPES.ALL_TIME && 'View all your transactions from the beginning'}
                                {type === REPORT_TYPES.PER_YEAR && 'Focus on this year\'s financial activity'}
                                {type === REPORT_TYPES.PER_MONTH && 'See only the current month\'s data'}
                            </p>
                            {selectedReportType === type && (
                                <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center ${
                                    darkMode ? 'bg-white text-black' : 'bg-black text-white'
                                }`}>
                                    <div className="w-2 h-2 bg-current" />
                                </div>
                            )}
                        </label>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className={`p-4 sm:p-6 lg:p-8 border-2 ${darkMode ? 'bg-black border-red-900/50' : 'bg-white border-red-200'} relative overflow-hidden`}>
                <div className={`absolute inset-0 opacity-5 ${darkMode ? 'bg-red-500' : 'bg-red-600'}`} />
                <div className="relative">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 ${
                            darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'
                        } border-2`}>
                            <AlertTriangle className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                        </div>
                        <div>
                            <h3 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                Danger Zone
                            </h3>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Irreversible actions
                            </p>
                        </div>
                    </div>

                    <p className={`text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                        Permanently delete all your transaction data. This action <strong>cannot be undone</strong> and will remove all financial records from your account.
                    </p>

                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-2 font-bold text-sm sm:text-base transition-all w-full sm:w-auto ${
                            darkMode 
                                ? 'bg-red-600/20 border-red-600 text-red-400 hover:bg-red-600/30 hover:border-red-500' 
                                : 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400'
                        } shadow-lg hover:shadow-xl`}
                    >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Delete All Transactions</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
