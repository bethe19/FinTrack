const { createOrUpdateProfile, getProfile } = require('../database');

/**
 * Create or update user profile
 */
const createOrUpdateProfileHandler = (req, res) => {
    const { name, phone_number, account_number } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    
    createOrUpdateProfile({ name, phone_number, account_number }, (err) => {
        if (err) {
            console.error('Error creating/updating profile:', err);
            return res.status(500).json({ error: 'Failed to save profile' });
        }
        res.json({ success: true, message: 'Profile saved successfully' });
    });
};

/**
 * Get user profile
 */
const getProfileHandler = (req, res) => {
    getProfile((err, profile) => {
        if (err) {
            console.error('Error fetching profile:', err);
            return res.status(500).json({ error: 'Failed to fetch profile' });
        }
        res.json(profile || null);
    });
};

module.exports = {
    createOrUpdateProfileHandler,
    getProfileHandler
};

