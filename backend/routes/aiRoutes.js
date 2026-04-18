const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/aiController');
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware');

router.post('/chat', optionalAuthMiddleware, chat);

module.exports = router;
