// Use environment variable or fallback to local proxy for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
import { getToken, getAuthHeader } from '../utils/auth';

// Helper function to make authenticated requests
const authenticatedFetch = async (url, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers
    };

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
        // Clear invalid token
        localStorage.removeItem('fintrack_token');
        localStorage.removeItem('fintrack_user');
        // Redirect to login would be handled by App.jsx
        throw new Error('Authentication expired. Please login again.');
    }

    return response;
};

// Auth API
export const authAPI = {
    register: async (email, password, name) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }
        return response.json();
    },

    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }
        return response.json();
    }
};

// Profile API
export const profileAPI = {
    get: async () => {
        const response = await authenticatedFetch(`${API_BASE_URL}/profile`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        return response.json();
    },

    createOrUpdate: async (profileData) => {
        const response = await authenticatedFetch(`${API_BASE_URL}/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        if (!response.ok) throw new Error('Failed to save profile');
        return response.json();
    }
};

// Transaction API
export const transactionAPI = {
    getAll: async () => {
        const response = await authenticatedFetch(`${API_BASE_URL}/transactions`);
        if (!response.ok) throw new Error('Failed to fetch transactions');
        return response.json();
    },

    getStats: async () => {
        const response = await authenticatedFetch(`${API_BASE_URL}/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    },

    submitSMS: async (smsText) => {
        const response = await authenticatedFetch(`${API_BASE_URL}/sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sms: smsText })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to parse SMS');
        }
        return response.json();
    },

    uploadCSV: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await authenticatedFetch(`${API_BASE_URL}/upload-csv`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to upload CSV');
        }
        return response.json();
    },

    delete: async (id) => {
        const response = await authenticatedFetch(`${API_BASE_URL}/transactions/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete transaction');
        return response.json();
    },

    deleteAll: async () => {
        const response = await authenticatedFetch(`${API_BASE_URL}/transactions`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete all transactions');
        return response.json();
    }
};

// Health check
export const healthCheck = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch (error) {
        return false;
    }
};
