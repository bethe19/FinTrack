/**
 * Script to create the default admin user
 * 
 * This script will create the admin user if it doesn't exist,
 * or update the existing user to admin role if it does.
 * 
 * Usage: Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables
 * Example: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=securepass123 node scripts/createDefaultAdmin.js
 */

require('dotenv').config();
const { createUser, getUserByEmail, db } = require('../database');
const { hashPassword } = require('../utils/auth');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.argv[2];
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.argv[3];

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Error: Admin email and password are required');
    console.error('');
    console.error('Usage options:');
    console.error('  1. Set environment variables:');
    console.error('     ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=password123 node scripts/createDefaultAdmin.js');
    console.error('  2. Pass as command line arguments:');
    console.error('     node scripts/createDefaultAdmin.js admin@example.com password123');
    console.error('  3. Set in .env file:');
    console.error('     ADMIN_EMAIL=admin@example.com');
    console.error('     ADMIN_PASSWORD=password123');
    process.exit(1);
}

// Wait a moment for database initialization to complete
setTimeout(() => {
    // Check if user already exists
    getUserByEmail(ADMIN_EMAIL, async (err, existingUser) => {
        if (err) {
            console.error('Error checking user:', err);
            process.exit(1);
        }

        if (existingUser) {
            console.log('User already exists. Updating role to admin...');
            // First check if role column exists
            db.all('PRAGMA table_info(users)', (err, rows) => {
                if (err) {
                    console.error('Error checking users table:', err);
                    process.exit(1);
                }
                
                const hasRole = rows && rows.some(col => col.name === 'role');
                
                if (hasRole) {
                    // Check current role
                    if (existingUser.role === 'admin') {
                        console.log(`✅ Admin user already exists with admin role!`);
                        console.log(`   Email: ${ADMIN_EMAIL}`);
                        process.exit(0);
                    }
                    
                    // Update role directly
                    db.run('UPDATE users SET role = ? WHERE email = ?', ['admin', ADMIN_EMAIL], (err) => {
                        if (err) {
                            console.error('Error updating user role:', err);
                            process.exit(1);
                        }
                        console.log(`✅ User ${ADMIN_EMAIL} is now an admin!`);
                        process.exit(0);
                    });
                } else {
                    // Add role column first, then update
                    db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", (alterErr) => {
                        if (alterErr && !alterErr.message.includes('duplicate column')) {
                            console.error('Error adding role column:', alterErr);
                            process.exit(1);
                        }
                        // Now update the role
                        db.run('UPDATE users SET role = ? WHERE email = ?', ['admin', ADMIN_EMAIL], (updateErr) => {
                            if (updateErr) {
                                console.error('Error updating user role:', updateErr);
                                process.exit(1);
                            }
                            console.log(`✅ User ${ADMIN_EMAIL} is now an admin!`);
                            process.exit(0);
                        });
                    });
                }
            });
            return;
        }

        // Create new admin user
        try {
            const passwordHash = await hashPassword(ADMIN_PASSWORD);
            createUser(ADMIN_EMAIL, passwordHash, 'admin', (err, user) => {
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

