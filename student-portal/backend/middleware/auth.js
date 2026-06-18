const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Invalid token format.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'modern_group_secret_key_2026');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

const isTeacher = (req, res, next) => {
  if (!req.user || (req.user.role !== 'teacher' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Access denied. Teacher/Admin role required.' });
  }
  next();
};

const isParent = (req, res, next) => {
  if (!req.user || req.user.role !== 'parent') {
    return res.status(403).json({ error: 'Access denied. Parent role required.' });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isTeacher,
  isParent
};
