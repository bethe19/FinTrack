import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Alert = ({ type = 'success', message, onClose, duration = 3000, darkMode }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            if (onClose) onClose();
        }, 300); // Wait for fade-out animation
    };

    if (!isVisible) return null;

    const icons = {
        success: CheckCircle2,
        error: XCircle,
        warning: AlertCircle,
        info: Info
    };

    const Icon = icons[type] || CheckCircle2;

    const styles = {
        success: darkMode 
            ? 'bg-green-900/20 border-green-700 text-green-300' 
            : 'bg-green-50 border-green-200 text-green-800',
        error: darkMode 
            ? 'bg-red-900/20 border-red-700 text-red-300' 
            : 'bg-red-50 border-red-200 text-red-800',
        warning: darkMode 
            ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300' 
            : 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: darkMode 
            ? 'bg-blue-900/20 border-blue-700 text-blue-300' 
            : 'bg-blue-50 border-blue-200 text-blue-800'
    };

    return (
        <div 
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 border rounded-lg shadow-lg transition-all duration-300 ${styles[type]} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
            style={{ minWidth: '300px', maxWidth: '500px' }}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={handleClose}
                className={`flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Alert;

