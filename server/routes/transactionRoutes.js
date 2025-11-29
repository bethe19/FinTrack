const express = require('express');
const router = express.Router();
const {
    getAllTransactionsHandler,
    deleteTransactionHandler,
    deleteAllTransactionsHandler
} = require('../controllers/transactionController');

// Get all transactions
router.get('/', getAllTransactionsHandler);

// Delete a single transaction (must come before delete all to match /:id pattern)
router.delete('/:id', deleteTransactionHandler);

// Delete all transactions
router.delete('/', deleteAllTransactionsHandler);

module.exports = router;

