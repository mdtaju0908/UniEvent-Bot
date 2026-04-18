const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch latest user status from DB to enforce bans/blocks immediately
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Universal Status Check
    // If user is NOT approved (pending, blocked, rejected), deny access.
    // Exception: Owner is the superuser, but usually should be approved.
    if (user.approvalStatus !== 'approved' && user.role !== 'owner') {
       return res.status(403).json({ 
         message: `Account is ${user.approvalStatus}. Please contact support.` 
       });
    }

    req.user = user; // Attach full user object (safest)
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
