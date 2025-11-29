import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Loader2, Activity, Filter, Calendar } from 'lucide-react';

const AdminActivities = ({ darkMode }) => {
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState([]);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        action: '',
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminAPI.getActivities({ ...filters, limit: 100 });
            setActivities(data);
        } catch (err) {
            console.error('Error loading activities:', err);
            setError('Failed to load activities');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        loadActivities();
    };

    const getActionColor = (action) => {
        if (action.includes('LOGIN') || action.includes('REGISTER')) return 'green';
        if (action.includes('DELETE')) return 'red';
        if (action.includes('UPDATE') || action.includes('CREATE')) return 'blue';
        return 'gray';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-screen">
                <Loader2 className={`w-12 h-12 animate-spin ${darkMode ? 'text-white' : 'text-black'}`} />
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className={`mb-6 p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-2`}>
                            Activity Log
                        </h1>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Track all user activities and system events
                        </p>
                    </div>
                    <div className={`w-12 h-12 border flex items-center justify-center ${darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                        <Activity className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className={`mb-6 p-6 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                <div className="flex items-center gap-2 mb-4">
                    <Filter className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-black'}`} />
                    <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Filters</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                            Action
                        </label>
                        <input
                            type="text"
                            value={filters.action}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                            placeholder="e.g., LOGIN, CREATE"
                            className={`w-full px-3 py-2 border ${darkMode 
                                ? 'bg-black border-gray-800 text-white' 
                                : 'bg-white border-gray-300 text-black'
                            }`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => handleFilterChange('start_date', e.target.value)}
                            className={`w-full px-3 py-2 border ${darkMode 
                                ? 'bg-black border-gray-800 text-white' 
                                : 'bg-white border-gray-300 text-black'
                            }`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                            End Date
                        </label>
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => handleFilterChange('end_date', e.target.value)}
                            className={`w-full px-3 py-2 border ${darkMode 
                                ? 'bg-black border-gray-800 text-white' 
                                : 'bg-white border-gray-300 text-black'
                            }`}
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={applyFilters}
                            className={`w-full px-4 py-2 border ${darkMode 
                                ? 'bg-white text-black border-white hover:bg-gray-100' 
                                : 'bg-black text-white border-black hover:bg-gray-900'
                            }`}
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className={`mb-6 p-4 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-black'}`}>{error}</p>
                </div>
            )}

            {/* Activities List */}
            <div className={`border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-300'}`}>
                                <th className={`text-left p-4 font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Time</th>
                                <th className={`text-left p-4 font-bold ${darkMode ? 'text-white' : 'text-black'}`}>User</th>
                                <th className={`text-left p-4 font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Action</th>
                                <th className={`text-left p-4 font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Entity</th>
                                <th className={`text-left p-4 font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Details</th>
                                <th className={`text-left p-4 font-bold ${darkMode ? 'text-white' : 'text-black'}`}>IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((activity) => (
                                <tr 
                                    key={activity.id}
                                    className={`border-b ${darkMode ? 'border-gray-800 hover:bg-gray-900' : 'border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <td className={`p-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {new Date(activity.created_at).toLocaleString()}
                                    </td>
                                    <td className={`p-4 ${darkMode ? 'text-white' : 'text-black'}`}>
                                        {activity.user_email || 'System'}
                                    </td>
                                    <td className="p-4">
                                        <span 
                                            className={`px-2 py-1 text-xs font-medium ${
                                                getActionColor(activity.action) === 'green' 
                                                    ? darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                                                    : getActionColor(activity.action) === 'red'
                                                    ? darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
                                                    : getActionColor(activity.action) === 'blue'
                                                    ? darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                                                    : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {activity.action}
                                        </span>
                                    </td>
                                    <td className={`p-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {activity.entity_type ? `${activity.entity_type}${activity.entity_id ? ` #${activity.entity_id}` : ''}` : 'N/A'}
                                    </td>
                                    <td className={`p-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {activity.details ? (
                                            <details>
                                                <summary className="cursor-pointer">View Details</summary>
                                                <pre className="mt-2 text-xs overflow-auto">
                                                    {JSON.stringify(activity.details, null, 2)}
                                                </pre>
                                            </details>
                                        ) : 'N/A'}
                                    </td>
                                    <td className={`p-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {activity.ip_address || 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {activities.length === 0 && (
                <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No activities found
                </div>
            )}
        </div>
    );
};

export default AdminActivities;

