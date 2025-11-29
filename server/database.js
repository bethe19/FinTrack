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
    db.run(`
      PRAGMA table_info(profiles)
    `, (err, rows) => {
        if (!err && rows) {
            const hasUserId = rows.some(col => col.name === 'user_id');
            if (!hasUserId) {
                // Migration: Add user_id column to profiles
                db.run(`
                  ALTER TABLE profiles ADD COLUMN user_id INTEGER
                `, (err) => {
                    if (err) console.error('Migration error (profiles.user_id):', err);
                });
            }
        }
    });

    db.run(`
      PRAGMA table_info(transactions)
    `, (err, rows) => {
        if (!err && rows) {
            const hasUserId = rows.some(col => col.name === 'user_id');
            if (!hasUserId) {
                // Migration: Add user_id column to transactions
                db.run(`
                  ALTER TABLE transactions ADD COLUMN user_id INTEGER
                `, (err) => {
                    if (err) console.error('Migration error (transactions.user_id):', err);
                });
            }
        }
    });

    // Create indexes for better performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);

    console.log('Database initialized successfully');
});

// User operations
const createUser = (email, passwordHash, callback) => {
    db.run(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        [email, passwordHash],
        function(err) {
            if (err) return callback(err);
            callback(null, { id: this.lastID, email });
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
    getTransactionStats,
    deleteTransaction,
    deleteAllTransactions
};
