const {
    createMultipleTransactions,
    getAllTransactions,
    deleteTransaction,
    deleteAllTransactions
} = require('../database');
const { parseBulkSMS } = require('../smsParser');
const { parseCSVContent } = require('../csvParser');

/**
 * Process SMS and create transactions
 */
const processSMSHandler = (req, res) => {
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

    createMultipleTransactions(transactions, (err, result) => {
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

        createMultipleTransactions(transactions, (err, result) => {
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
    getAllTransactions((err, transactions) => {
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
    const { id } = req.params;
    
    deleteTransaction(id, (err) => {
        if (err) {
            console.error('Error deleting transaction:', err);
            return res.status(500).json({ error: 'Failed to delete transaction' });
        }
        res.json({ success: true, message: 'Transaction deleted successfully' });
    });
};

/**
 * Delete all transactions
 */
const deleteAllTransactionsHandler = (req, res) => {
    deleteAllTransactions((err) => {
        if (err) {
            console.error('Error deleting all transactions:', err);
            return res.status(500).json({ error: 'Failed to delete transactions' });
        }
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

