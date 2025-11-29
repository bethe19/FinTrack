const { createUser, getUserByEmail, createOrUpdateProfile } = require('../database');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

/**
 * Register a new user
 */
const registerHandler = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        getUserByEmail(email, async (err, existingUser) => {
            if (err) {
                console.error('Error checking user:', err);
                return res.status(500).json({ error: 'Failed to check user existence' });
            }

            if (existingUser) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }

            // Hash password
            const passwordHash = await hashPassword(password);

            // Create user
            createUser(email, passwordHash, async (err, user) => {
                if (err) {
                    console.error('Error creating user:', err);
                    return res.status(500).json({ error: 'Failed to create user' });
                }

                // Generate token
                const token = generateToken(user.id);

                // Create initial profile with name if provided
                if (name && name.trim()) {
                    createOrUpdateProfile(user.id, {
                        name: name.trim(),
                        phone_number: null,
                        account_number: null
                    }, (profileErr) => {
                        if (profileErr) {
                            console.error('Error creating initial profile:', profileErr);
                            // Continue anyway - profile can be created later
                        }
                        
                        res.status(201).json({
                            success: true,
                            message: 'User registered successfully',
                            token,
                            user: {
                                id: user.id,
                                email: user.email
                            }
                        });
                    });
                } else {
                    res.status(201).json({
                        success: true,
                        message: 'User registered successfully',
                        token,
                        user: {
                            id: user.id,
                            email: user.email
                        }
                    });
                }
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

/**
 * Login user
 */
const loginHandler = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        getUserByEmail(email, async (err, user) => {
            if (err) {
                console.error('Error finding user:', err);
                return res.status(500).json({ error: 'Failed to find user' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Verify password
            const isPasswordValid = await comparePassword(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Generate token
            const token = generateToken(user.id);

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email
                }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
};

module.exports = {
    registerHandler,
    loginHandler
};

