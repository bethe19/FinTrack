const express = require('express');
const router = express.Router();
const { registerHandler, loginHandler } = require('../controllers/authController');

// Register new user
router.post('/register', registerHandler);

// Login user
router.post('/login', loginHandler);

module.exports = router;

