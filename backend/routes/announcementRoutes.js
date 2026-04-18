const express = require('express');
const router = express.Router();
const { sendAnnouncement, getLiveAnnouncements } = require('../controllers/announcementController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/send', authMiddleware, sendAnnouncement);
router.get('/live', getLiveAnnouncements);

module.exports = router;
