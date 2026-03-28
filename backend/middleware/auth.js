const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ success: false, error: 'A token is required for authentication' });
  }

  try {
    // The token typically arrives as "Bearer <token_string>"
    const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid Token' });
  }

  return next();
};

module.exports = verifyToken;
