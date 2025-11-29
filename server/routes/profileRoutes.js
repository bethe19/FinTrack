const express = require('express');
const router = express.Router();
const {
    createOrUpdateProfileHandler,
    getProfileHandler
} = require('../controllers/profileController');

// Profile endpoints
router.post('/', createOrUpdateProfileHandler);
router.get('/', getProfileHandler);

module.exports = router;

