const { createOrUpdateProfile, getProfile } = require('../database');

/**
 * Create or update user profile
 */
const createOrUpdateProfileHandler = (req, res) => {
    const userId = req.userId; // From auth middleware
    const { name, phone_number, account_number } = req.body;
    
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name is required' });
    }
    
    // Clean up the data - remove empty strings, convert to null
    const cleanData = {
        name: name.trim(),
        phone_number: phone_number && phone_number.trim() ? phone_number.trim() : null,
        account_number: account_number && account_number.trim() ? account_number.trim() : null
    };
    
    createOrUpdateProfile(userId, cleanData, (err) => {
        if (err) {
            console.error('Error creating/updating profile:', err);
            return res.status(500).json({ error: 'Failed to save profile. Please try again.' });
        }
        
        // Fetch and return the updated profile
        getProfile(userId, (fetchErr, profile) => {
            if (fetchErr) {
                console.error('Error fetching updated profile:', fetchErr);
                // Still return success since the save worked
                return res.json({ success: true, message: 'Profile saved successfully' });
            }
            res.json({ success: true, message: 'Profile saved successfully', profile });
        });
    });
};

/**
 * Get user profile
 */
const getProfileHandler = (req, res) => {
    const userId = req.userId; // From auth middleware
    
    if (!userId) {
        console.error('No userId found in request');
        return res.status(401).json({ error: 'User not authenticated' });
    }
    
    getProfile(userId, (err, profile) => {
        if (err) {
            console.error('Error fetching profile:', err);
            return res.status(500).json({ error: 'Failed to fetch profile' });
        }
        
        // If no profile found, return null explicitly
        // db.get returns undefined when no row is found
        if (!profile || profile === undefined) {
            return res.status(200).json(null);
        }
        
        res.json(profile);
    });
};

module.exports = {
    createOrUpdateProfileHandler,
    getProfileHandler
};

