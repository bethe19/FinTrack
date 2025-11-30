/**
 * Script to create an admin user
 * Usage: node scripts/createAdmin.js <email> <password>
 */

require('dotenv').config();
const { createUser, getUserByEmail, updateUserRole } = require('../database');
const { hashPassword } = require('../utils/auth');

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.error('Usage: node scripts/createAdmin.js <email> <password>');
    process.exit(1);
}

if (password.length < 6) {
    console.error('Password must be at least 6 characters long');
    process.exit(1);
}

// Wait a moment for database initialization to complete
setTimeout(() => {
    // Check if user already exists
    getUserByEmail(email, async (err, existingUser) => {
        if (err) {
            console.error('Error checking user:', err);
            process.exit(1);
        }

        if (existingUser) {
            console.log('User already exists. Updating role to admin...');
            
            // Update role to admin
            updateUserRole(existingUser.id, 'admin', (updateErr) => {
                if (updateErr) {
                    console.error('Error updating user role:', updateErr);
                    process.exit(1);
                }
                console.log(`✅ User ${email} is now an admin!`);
                process.exit(0);
            });
            return;
        }

        // Create new admin user
        try {
            const passwordHash = await hashPassword(password);
            createUser(email, passwordHash, 'admin', (err, user) => {
                if (err) {
                    console.error('Error creating admin user:', err);
                    process.exit(1);
                }
                console.log(`✅ Admin user created successfully!`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: admin`);
                process.exit(0);
            });
        } catch (error) {
            console.error('Error hashing password:', error);
            process.exit(1);
        }
    });
}, 500);

