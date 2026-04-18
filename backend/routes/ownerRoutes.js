const express = require('express');
const router = express.Router();
const { getAccounts, deleteAccount, updateAccountStatus, assignVolunteer } = require('../controllers/ownerController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check for owner role
const ownerCheck = (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied. Owner only.' });
  }
  next();
};

router.get('/accounts', authMiddleware, ownerCheck, getAccounts);
router.delete('/delete-account/:id', authMiddleware, ownerCheck, deleteAccount);
router.put('/update-status/:id', authMiddleware, ownerCheck, updateAccountStatus);
router.post('/assign-volunteer', authMiddleware, ownerCheck, assignVolunteer);

module.exports = router;
