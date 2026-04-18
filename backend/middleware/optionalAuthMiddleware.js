const jwt = require('jsonwebtoken');

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    // Ignore invalid token and proceed without user context
    req.user = null;
  }
  next();
};

module.exports = optionalAuthMiddleware;
