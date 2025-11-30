const {
    createMultipleTransactions,
    getAllTransactions,
    deleteTransaction,
    deleteAllTransactions
} = require('../database');
const { logActivity } = require('../database');
const { parseBulkSMS } = require('../smsParser');
const { parseCSVContent } = require('../csvParser');

/**
 * Process SMS and create transactions
 */
const processSMSHandler = (req, res) => {
    const userId = req.userId; // From auth middleware
    const smsText = typeof req.body === 'string' ? req.body : req.body.sms;
    
    if (!smsText) {
        return res.status(400).json({ error: 'SMS text is required' });
    }

    const transactions = parseBulkSMS(smsText);
    
    if (transactions.length === 0) {
        return res.status(400).json({
            error: 'No valid CBE transactions found in the SMS text',
            parsed: transactions
        });
    }

    createMultipleTransactions(userId, transactions, (err, result) => {
        if (err) {
            console.error('Error inserting transactions:', err);
            return res.status(500).json({ error: 'Failed to save transactions', details: err });
        }
        res.json({
            success: true,
            message: `${result.inserted} transaction(s) added successfully`,
            count: result.inserted,
            transactions: transactions
        });
    });
};

/**
 * Process CSV upload and create transactions
 */
const uploadCSVHandler = (req, res) => {
    const userId = req.userId; // From auth middleware
    
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const csvText = req.file.buffer.toString('utf-8');
        const transactions = parseCSVContent(csvText);

        if (transactions.length === 0) {
            return res.status(400).json({
                error: 'No valid transactions found in CSV file'
            });
        }

        createMultipleTransactions(userId, transactions, (err, result) => {
            if (err) {
                console.error('Error inserting transactions:', err);
                return res.status(500).json({ error: 'Failed to save transactions', details: err });
            }
            res.json({
                success: true,
                message: `${result.inserted} transaction(s) imported from CSV`,
                count: result.inserted,
                transactions: transactions
            });
        });
    } catch (error) {
        console.error('Error parsing CSV:', error);
        res.status(500).json({ error: 'Failed to parse CSV file', details: error.message });
    }
};

/**
 * Get all transactions
 */
const getAllTransactionsHandler = (req, res) => {
    const userId = req.userId; // From auth middleware
    
    getAllTransactions(userId, (err, transactions) => {
        if (err) {
            console.error('Error fetching transactions:', err);
            return res.status(500).json({ error: 'Failed to fetch transactions' });
        }
        res.json(transactions);
    });
};

/**
 * Delete a single transaction
 */
const deleteTransactionHandler = (req, res) => {
    const userId = req.userId; // From auth middleware
    const { id } = req.params;
    
    deleteTransaction(userId, id, (err) => {
        if (err) {
            console.error('Error deleting transaction:', err);
            return res.status(500).json({ error: 'Failed to delete transaction' });
        }
        
        // Log major activity
        const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        logActivity({
            user_id: userId,
            action: 'DELETE_TRANSACTION',
            entity_type: 'transaction',
            entity_id: id,
            details: null,
            ip_address: ipAddress,
            user_agent: userAgent
        }, () => {});
        
        res.json({ success: true, message: 'Transaction deleted successfully' });
    });
};

/**
 * Delete all transactions
 */
const deleteAllTransactionsHandler = (req, res) => {
    const userId = req.userId; // From auth middleware
    
    deleteAllTransactions(userId, (err, result) => {
        if (err) {
            console.error('Error deleting all transactions:', err);
            return res.status(500).json({ error: 'Failed to delete transactions' });
        }
        
        // Log major activity
        const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        logActivity({
            user_id: userId,
            action: 'DELETE_ALL_TRANSACTIONS',
            entity_type: 'transactions',
            entity_id: null,
            details: result ? JSON.stringify({ deletedCount: result.deletedCount }) : null,
            ip_address: ipAddress,
            user_agent: userAgent
        }, () => {});
        
        res.json({ success: true, message: 'All transactions deleted successfully' });
    });
};

module.exports = {
    processSMSHandler,
    uploadCSVHandler,
    getAllTransactionsHandler,
    deleteTransactionHandler,
    deleteAllTransactionsHandler
};

