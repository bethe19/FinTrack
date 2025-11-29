const TOKEN_KEY = 'fintrack_token';
const USER_KEY = 'fintrack_user';

/**
 * Get stored authentication token
 */
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store authentication token
 */
export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove authentication token
 */
export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

/**
 * Get stored user info
 */
export const getUser = () => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
};

/**
 * Store user info
 */
export const setUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!getToken();
};

/**
 * Get authorization header
 */
export const getAuthHeader = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

