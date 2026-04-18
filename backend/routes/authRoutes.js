const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, checkStatus } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/status/:id', checkStatus);

module.exports = router;
