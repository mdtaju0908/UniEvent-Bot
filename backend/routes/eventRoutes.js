const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getMyEvents, getEventById, updateEvent, deleteEvent } = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/all', getEvents);
router.get('/my-events', authMiddleware, getMyEvents);
router.post('/create', authMiddleware, createEvent);
router.put('/update/:id', authMiddleware, updateEvent);
router.delete('/delete/:id', authMiddleware, deleteEvent);
router.get('/:id', getEventById);

module.exports = router;
