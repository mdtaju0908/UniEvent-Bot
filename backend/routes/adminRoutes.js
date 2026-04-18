const express = require('express');
const router = express.Router();
const { getUsers, assignDuty, deleteUser, getAssignedVolunteers } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.get('/volunteers', authMiddleware, adminMiddleware, getAssignedVolunteers);
router.post('/assign-duty', authMiddleware, adminMiddleware, assignDuty);
router.delete('/delete-user/:id', authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
