const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkanban';

function authMiddleware(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ error: 'Token is not valid' });
  }
}

module.exports = authMiddleware;
