const express = require('express');
const router = express.Router();
const { getDuties, getMyDuties } = require('../controllers/volunteerController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/my-duties', authMiddleware, getMyDuties);
router.get('/:id/duties', authMiddleware, getDuties);

module.exports = router;
