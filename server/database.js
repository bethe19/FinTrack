const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH 
    ? (path.isAbsolute(process.env.DB_PATH) ? process.env.DB_PATH : path.join(__dirname, process.env.DB_PATH))
    : path.join(__dirname, 'finance.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
    // Users table
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Profiles table (updated to include user_id)
    db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone_number TEXT,
      account_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id)
    )
  `);

    // Transactions table (updated to include user_id)
    db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      balance REAL,
      from_person TEXT,
      description TEXT NOT NULL,
      transaction_date TEXT,
      transaction_time TEXT,
      ref_no TEXT,
      sms_content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    // Migrate existing data: Add user_id columns if they don't exist
    // Check if user_id column exists in profiles table and add if missing
    db.all(`PRAGMA table_info(profiles)`, (err, rows) => {
        if (err) {
            console.error('Error checking profiles columns:', err);
            return;
        }
        
        // Check if table exists and has columns
        if (rows && rows.length > 0) {
            const hasUserId = rows.some(col => col.name === 'user_id');
            if (!hasUserId) {
                // Migration: Add user_id column to profiles (nullable for existing data)
                // Note: We add it as nullable first to handle existing rows
                db.run(`ALTER TABLE profiles ADD COLUMN user_id INTEGER`, (err) => {
                    if (err) {
                        // If error, table might not exist yet or column already exists
                        if (!err.message.includes('duplicate column')) {
                            console.error('Migration error (profiles.user_id):', err);
                        }
                    } else {
                        console.log('Migration: Added user_id column to profiles table');
                    }
                });
            }
        } else {
            // Table doesn't exist yet, will be created with user_id above
        }
    });

    // Check if user_id column exists in transactions table and add if missing
    db.all(`PRAGMA table_info(transactions)`, (err, rows) => {
        if (err) {
            console.error('Error checking transactions columns:', err);
            return;
        }
        
        // Check if table exists and has columns
        if (rows && rows.length > 0) {
            const hasUserId = rows.some(col => col.name === 'user_id');
            if (!hasUserId) {
                // Migration: Add user_id column to transactions (nullable for existing data)
                // Note: We add it as nullable first to handle existing rows
                db.run(`ALTER TABLE transactions ADD COLUMN user_id INTEGER`, (err) => {
                    if (err) {
                        // If error, table might not exist yet or column already exists
                        if (!err.message.includes('duplicate column')) {
                            console.error('Migration error (transactions.user_id):', err);
                        }
                    } else {
                        console.log('Migration: Added user_id column to transactions table');
                    }
                });
            }
        } else {
            // Table doesn't exist yet, will be created with user_id above
        }
    });

    // Activities table for tracking user activities
    db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

    // Migrate existing users: Add role column if it doesn't exist
    db.all(`PRAGMA table_info(users)`, (err, rows) => {
        if (err) {
            console.error('Error checking users columns:', err);
            return;
        }
        
        if (rows && rows.length > 0) {
            const hasRole = rows.some(col => col.name === 'role');
            if (!hasRole) {
                db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`, (err) => {
                    if (err) {
                        console.error('Migration error (users.role):', err);
                    } else {
                        console.log('Migration: Added role column to users table');
                    }
                });
            }
        }
    });

    // Create indexes for better performance (with error handling for columns that might not exist yet)
    // These will be created after tables are set up, and IF NOT EXISTS will prevent duplicates
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    
    // Create indexes that depend on migrations - these will fail gracefully if columns don't exist yet
    // They'll be created properly once migrations complete
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`, (err) => {
        if (err && !err.message.includes('no such column')) {
            // Index creation will retry after role column is added
        }
    });

    console.log('Database initialized successfully');
    
    // Create remaining indexes after a short delay to allow migrations to complete
    setTimeout(() => {
        db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`, (err) => {
            if (err && !err.message.includes('no such column')) {
                console.error('Note: transactions.user_id index will be created after migration');
            }
        });
        db.run(`CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id)`, (err) => {
            if (err && !err.message.includes('no such column')) {
                console.error('Note: profiles.user_id index will be created after migration');
            }
        });
        db.run(`CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at)`);
    }, 500);
});

// User operations
const createUser = (email, passwordHash, role, callback) => {
    const userRole = role || 'user';
    db.run(
        'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
        [email, passwordHash, userRole],
        function(err) {
            if (err) return callback(err);
            callback(null, { id: this.lastID, email, role: userRole });
        }
    );
};

const getUserByEmail = (email, callback) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], callback);
};

const getUserById = (id, callback) => {
    db.get('SELECT id, email, created_at FROM users WHERE id = ?', [id], callback);
};

// Profile operations (updated to include user_id)
const createOrUpdateProfile = (userId, profileData, callback) => {
    const { name, phone_number, account_number } = profileData;

    db.get('SELECT id FROM profiles WHERE user_id = ?', [userId], (err, row) => {
        if (err) return callback(err);

        if (row) {
            // Update existing profile
            db.run(
                'UPDATE profiles SET name = ?, phone_number = ?, account_number = ? WHERE user_id = ?',
                [name, phone_number, account_number, userId],
                callback
            );
        } else {
            // Create new profile
            db.run(
                'INSERT INTO profiles (user_id, name, phone_number, account_number) VALUES (?, ?, ?, ?)',
                [userId, name, phone_number, account_number],
                callback
            );
        }
    });
};

const getProfile = (userId, callback) => {
    db.get('SELECT * FROM profiles WHERE user_id = ?', [userId], callback);
};

// Transaction operations (updated to include user_id)
const createTransaction = (userId, transaction, callback) => {
    const {
        type,
        amount,
        balance,
        from_person,
        description,
        transaction_date,
        transaction_time,
        ref_no,
        sms_content
    } = transaction;

    db.run(
        `INSERT INTO transactions 
    (user_id, type, amount, balance, from_person, description, transaction_date, transaction_time, ref_no, sms_content) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, type, amount, balance, from_person, description, transaction_date, transaction_time, ref_no, sms_content],
        callback
    );
};

const createMultipleTransactions = (userId, transactions, callback) => {
    const stmt = db.prepare(`
    INSERT INTO transactions 
    (user_id, type, amount, balance, from_person, description, transaction_date, transaction_time, ref_no, sms_content) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    let errors = [];
    
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        
        transactions.forEach((transaction, index) => {
            const {
                type, amount, balance, from_person, description,
                transaction_date, transaction_time, ref_no, sms_content
            } = transaction;

            stmt.run(
                [userId, type, amount, balance, from_person, description, transaction_date, transaction_time, ref_no, sms_content],
                (err) => {
                    if (err) {
                        errors.push({ index, error: err.message });
                        console.error(`Error inserting transaction at index ${index}:`, err.message);
                    }
                }
            );
        });

        stmt.finalize();
        
        db.run("COMMIT", (err) => {
            if (err) {
                console.error("Transaction commit failed:", err);
                callback(err, null);
            } else {
                callback(errors.length > 0 ? errors : null, { inserted: transactions.length - errors.length });
            }
        });
    });
};

const getAllTransactions = (userId, callback) => {
    db.all('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC', [userId], callback);
};

const getAllTransactionsAdmin = (callback) => {
    // Check if user_id column exists first
    db.all(`PRAGMA table_info(transactions)`, (err, rows) => {
        if (err) {
            return callback(err);
        }
        
        const hasUserId = rows && rows.some(col => col.name === 'user_id');
        
        if (hasUserId) {
            db.all(`
                SELECT t.*, u.email as user_email 
                FROM transactions t 
                LEFT JOIN users u ON t.user_id = u.id 
                ORDER BY t.created_at DESC
            `, callback);
        } else {
            // Fallback: query without user_id join
            db.all(`
                SELECT t.*, NULL as user_email 
                FROM transactions t 
                ORDER BY t.created_at DESC
            `, callback);
        }
    });
};

const getTransactionStats = (userId, callback) => {
    db.all(`
    SELECT 
      type,
      COUNT(*) as count,
      SUM(amount) as total,
      AVG(amount) as average
    FROM transactions
    WHERE user_id = ?
    GROUP BY type
  `, [userId], callback);
};

const deleteTransaction = (userId, id, callback) => {
    db.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId], callback);
};

const deleteAllTransactions = (userId, callback) => {
    db.run('DELETE FROM transactions WHERE user_id = ?', [userId], callback);
};

// Admin operations
const getAllUsers = (callback) => {
    // First check if user_id column exists in transactions table
    db.all(`PRAGMA table_info(transactions)`, (err, rows) => {
        if (err) {
            return callback(err);
        }
        
        const hasUserId = rows && rows.some(col => col.name === 'user_id');
        
        if (hasUserId) {
            // Use the full query with user_id
            db.all(`
                SELECT u.id, u.email, u.role, u.created_at,
                       p.name, p.phone_number, p.account_number,
                       (SELECT COUNT(*) FROM transactions WHERE user_id = u.id) as transaction_count
                FROM users u
                LEFT JOIN profiles p ON u.id = p.user_id
                ORDER BY u.created_at DESC
            `, callback);
        } else {
            // Fallback: query without user_id (for old databases)
            db.all(`
                SELECT u.id, u.email, COALESCE(u.role, 'user') as role, u.created_at,
                       p.name, p.phone_number, p.account_number,
                       0 as transaction_count
                FROM users u
                LEFT JOIN profiles p ON u.id = p.user_id
                ORDER BY u.created_at DESC
            `, callback);
        }
    });
};

const updateUserRole = (userId, role, callback) => {
    db.run('UPDATE users SET role = ? WHERE id = ?', [role, userId], callback);
};

const deleteUser = (userId, callback) => {
    db.run('DELETE FROM users WHERE id = ?', [userId], callback);
};

// Activity logging operations
const logActivity = (activity, callback) => {
    const { user_id, action, entity_type, entity_id, details, ip_address, user_agent } = activity;
    db.run(
        `INSERT INTO activities (user_id, action, entity_type, entity_id, details, ip_address, user_agent) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user_id, action, entity_type, entity_id, details, ip_address, user_agent],
        function(err) {
            if (err) return callback(err);
            callback(null, { id: this.lastID });
        }
    );
};

const getActivities = (filters, callback) => {
    let query = 'SELECT a.*, u.email as user_email FROM activities a LEFT JOIN users u ON a.user_id = u.id WHERE 1=1';
    const params = [];

    if (filters.user_id) {
        query += ' AND a.user_id = ?';
        params.push(filters.user_id);
    }

    if (filters.action) {
        query += ' AND a.action = ?';
        params.push(filters.action);
    }

    if (filters.start_date) {
        query += ' AND a.created_at >= ?';
        params.push(filters.start_date);
    }

    if (filters.end_date) {
        query += ' AND a.created_at <= ?';
        params.push(filters.end_date);
    }

    query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(filters.limit || 100, filters.offset || 0);

    db.all(query, params, callback);
};

const getActivityStats = (callback) => {
    db.all(`
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count,
            COUNT(DISTINCT user_id) as unique_users
        FROM activities
        WHERE created_at >= datetime('now', '-30 days')
        GROUP BY DATE(created_at)
        ORDER BY date DESC
    `, callback);
};

const getSystemStats = (callback) => {
    db.all(`
        SELECT 
            (SELECT COUNT(*) FROM users) as total_users,
            (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_count,
            (SELECT COUNT(*) FROM transactions) as total_transactions,
            (SELECT COUNT(*) FROM profiles) as total_profiles,
            (SELECT COUNT(*) FROM activities WHERE created_at >= datetime('now', '-24 hours')) as activities_today
    `, (err, rows) => {
        if (err) return callback(err);
        callback(null, rows[0]);
    });
};

module.exports = {
    db,
    createUser,
    getUserByEmail,
    getUserById,
    createOrUpdateProfile,
    getProfile,
    createTransaction,
    createMultipleTransactions,
    getAllTransactions,
    getAllTransactionsAdmin,
    getTransactionStats,
    deleteTransaction,
    deleteAllTransactions,
    getAllUsers,
    updateUserRole,
    deleteUser,
    logActivity,
    getActivities,
    getActivityStats,
    getSystemStats
};
