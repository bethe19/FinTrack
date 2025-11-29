import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Loader2, Users, Shield, User, Trash2, Edit } from 'lucide-react';

const AdminUsers = ({ darkMode }) => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [newRole, setNewRole] = useState('user');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminAPI.getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error('Error loading users:', err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId) => {
        try {
            await adminAPI.updateUserRole(userId, newRole);
            setEditingUser(null);
            loadUsers();
        } catch (err) {
            console.error('Error updating role:', err);
            alert(err.message || 'Failed to update user role');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            await adminAPI.deleteUser(userId);
            loadUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            alert(err.message || 'Failed to delete user');
        }
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
                            User Management
                        </h1>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Manage all users and their roles
                        </p>
                    </div>
                    <div className={`w-12 h-12 border flex items-center justify-center ${darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                        <Users className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {error && (
                <div className={`mb-6 p-4 border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-black'}`}>{error}</p>
                </div>
            )}

            {/* Users Table */}
            <div className={`border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-300'}`}>
                                <th className={`text-left p-4 font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Email</th>
                                <th className={`text-left p-4 font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Name</th>
                                <th className={`text-left p-4 font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Role</th>
                                <th className={`text-left p-4 font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Transactions</th>
                                <th className={`text-left p-4 font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Joined</th>
                                <th className={`text-left p-4 font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr 
                                    key={user.id}
                                    className={`border-b ${darkMode ? 'border-gray-800 hover:bg-gray-900' : 'border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <td className={`p-4 ${darkMode ? 'text-white' : 'text-black'}`}>
                                        {user.email}
                                    </td>
                                    <td className={`p-4 ${darkMode ? 'text-white' : 'text-black'}`}>
                                        {user.name || 'N/A'}
                                    </td>
                                    <td className="p-4">
                                        {editingUser === user.id ? (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={newRole}
                                                    onChange={(e) => setNewRole(e.target.value)}
                                                    className={`px-2 py-1 border ${darkMode 
                                                        ? 'bg-black border-gray-800 text-white' 
                                                        : 'bg-white border-gray-300 text-black'
                                                    }`}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <button
                                                    onClick={() => handleUpdateRole(user.id)}
                                                    className={`px-3 py-1 border ${darkMode 
                                                        ? 'border-gray-800 text-white hover:bg-gray-900' 
                                                        : 'border-gray-300 text-black hover:bg-gray-50'
                                                    }`}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingUser(null)}
                                                    className={`px-3 py-1 border ${darkMode 
                                                        ? 'border-gray-800 text-white hover:bg-gray-900' 
                                                        : 'border-gray-300 text-black hover:bg-gray-50'
                                                    }`}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {user.role === 'admin' ? (
                                                    <Shield className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                                                ) : (
                                                    <User className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                                )}
                                                <span className={`capitalize ${darkMode ? 'text-white' : 'text-black'}`}>
                                                    {user.role || 'user'}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(user.id);
                                                        setNewRole(user.role || 'user');
                                                    }}
                                                    className={`ml-2 p-1 ${darkMode 
                                                        ? 'text-gray-400 hover:text-white' 
                                                        : 'text-gray-600 hover:text-black'
                                                    }`}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className={`p-4 ${darkMode ? 'text-white' : 'text-black'}`}>
                                        {user.transaction_count || 0}
                                    </td>
                                    <td className={`p-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className={`p-2 ${darkMode 
                                                ? 'text-red-400 hover:text-red-300' 
                                                : 'text-red-600 hover:text-red-700'
                                            }`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {users.length === 0 && (
                <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No users found
                </div>
            )}
        </div>
    );
};

export default AdminUsers;

