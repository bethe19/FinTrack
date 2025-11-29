import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    type = 'danger',
    darkMode 
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            {/* Backdrop */}
            <div className={`absolute inset-0 ${darkMode ? 'bg-black/80' : 'bg-black/50'} backdrop-blur-sm`} />
            
            {/* Dialog */}
            <div 
                className={`relative w-full max-w-md border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'} shadow-2xl transform transition-all`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center gap-4 p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        type === 'danger' 
                            ? darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'
                            : darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'
                    } border`}>
                        <AlertTriangle className={`w-6 h-6 ${
                            type === 'danger' 
                                ? darkMode ? 'text-red-400' : 'text-red-600'
                                : darkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors`}
                    >
                        <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className={`flex gap-3 p-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <button
                        onClick={onClose}
                        className={`flex-1 py-3 px-4 border font-medium transition-colors ${
                            darkMode
                                ? 'border-gray-800 text-gray-300 hover:bg-gray-900'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 py-3 px-4 border font-medium transition-colors ${
                            type === 'danger'
                                ? darkMode
                                    ? 'bg-red-600 border-red-600 text-white hover:bg-red-700'
                                    : 'bg-red-600 border-red-600 text-white hover:bg-red-700'
                                : darkMode
                                    ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;

