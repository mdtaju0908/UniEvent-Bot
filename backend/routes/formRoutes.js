const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check for admin role
const adminCheck = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Admin Routes
router.post('/create', authMiddleware, adminCheck, formController.createForm);
router.get('/all', authMiddleware, adminCheck, formController.getForms);
router.get('/:formId/submissions', authMiddleware, adminCheck, formController.getFormSubmissions);
router.delete('/:id', authMiddleware, adminCheck, formController.deleteForm);
router.put('/:id', authMiddleware, adminCheck, formController.updateForm);

// Public Routes
router.get('/:id', formController.getFormById);
router.post('/submit/:formId', formController.submitForm);

module.exports = router;
