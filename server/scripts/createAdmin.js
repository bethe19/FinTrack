/**
 * Script to create an admin user
 * Usage: node scripts/createAdmin.js <email> <password>
 */

require('dotenv').config();
const { createUser, getUserByEmail, db } = require('../database');
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
        // First check if role column exists
        db.all('PRAGMA table_info(users)', (err, rows) => {
            if (err) {
                console.error('Error checking users table:', err);
                process.exit(1);
            }
            
            const hasRole = rows && rows.some(col => col.name === 'role');
            
            if (hasRole) {
                // Update role directly
                db.run('UPDATE users SET role = ? WHERE email = ?', ['admin', email], (err) => {
                    if (err) {
                        console.error('Error updating user role:', err);
                        process.exit(1);
                    }
                    console.log(`✅ User ${email} is now an admin!`);
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
                    db.run('UPDATE users SET role = ? WHERE email = ?', ['admin', email], (updateErr) => {
                        if (updateErr) {
                            console.error('Error updating user role:', updateErr);
                            process.exit(1);
                        }
                        console.log(`✅ User ${email} is now an admin!`);
                        process.exit(0);
                    });
                });
            }
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

