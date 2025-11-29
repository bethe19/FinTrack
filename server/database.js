const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH 
    ? (path.isAbsolute(process.env.DB_PATH) ? process.env.DB_PATH : path.join(__dirname, process.env.DB_PATH))
    : path.join(__dirname, 'finance.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
    // Profiles table
    db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone_number TEXT,
      account_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Transactions table
    db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      balance REAL,
      from_person TEXT,
      description TEXT NOT NULL,
      transaction_date TEXT,
      transaction_time TEXT,
      ref_no TEXT,
      sms_content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    console.log('Database initialized successfully');
});

// Profile operations
const createOrUpdateProfile = (profileData, callback) => {
    const { name, phone_number, account_number } = profileData;

    db.get('SELECT id FROM profiles LIMIT 1', (err, row) => {
        if (err) return callback(err);

        if (row) {
            // Update existing profile
            db.run(
                'UPDATE profiles SET name = ?, phone_number = ?, account_number = ? WHERE id = ?',
                [name, phone_number, account_number, row.id],
                callback
            );
        } else {
            // Create new profile
            db.run(
                'INSERT INTO profiles (name, phone_number, account_number) VALUES (?, ?, ?)',
                [name, phone_number, account_number],
                callback
            );
        }
    });
};

const getProfile = (callback) => {
    db.get('SELECT * FROM profiles LIMIT 1', callback);
};

// Transaction operations
const createTransaction = (transaction, callback) => {
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
    (type, amount, balance, from_person, description, transaction_date, transaction_time, ref_no, sms_content) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [type, amount, balance, from_person, description, transaction_date, transaction_time, ref_no, sms_content],
        callback
    );
};

const createMultipleTransactions = (transactions, callback) => {
    const stmt = db.prepare(`
    INSERT INTO transactions 
    (type, amount, balance, from_person, description, transaction_date, transaction_time, ref_no, sms_content) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                [type, amount, balance, from_person, description, transaction_date, transaction_time, ref_no, sms_content],
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

const getAllTransactions = (callback) => {
    db.all('SELECT * FROM transactions ORDER BY created_at DESC', callback);
};

const getTransactionStats = (callback) => {
    db.all(`
    SELECT 
      type,
      COUNT(*) as count,
      SUM(amount) as total,
      AVG(amount) as average
    FROM transactions
    GROUP BY type
  `, callback);
};

const deleteTransaction = (id, callback) => {
    db.run('DELETE FROM transactions WHERE id = ?', [id], callback);
};

const deleteAllTransactions = (callback) => {
    db.run('DELETE FROM transactions', callback);
};

module.exports = {
    db,
    createOrUpdateProfile,
    getProfile,
    createTransaction,
    createMultipleTransactions,
    getAllTransactions,
    getTransactionStats,
    deleteTransaction,
    deleteAllTransactions
};
