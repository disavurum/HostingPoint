require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

/**
 * Middleware to verify JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log('=== AUTH MIDDLEWARE ===');
    console.log('Auth header:', authHeader ? `Bearer ${authHeader.substring(7, 17)}...` : 'MISSING');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('ERROR: Missing or invalid auth header');
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid token'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    console.log('JWT_SECRET (first 10 chars):', JWT_SECRET.substring(0, 10));
    console.log('Token (first 20 chars):', token.substring(0, 20));

    const decoded = jwt.verify(token, JWT_SECRET);

    console.log('Token decoded successfully. UserID:', decoded.userId);

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log(`ERROR: User ${decoded.userId} not found in database`);
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    console.log('User found:', user.email);
    req.user = user;
    req.userId = decoded.userId;
    console.log('=== AUTH SUCCESS ===');
    next();
  } catch (error) {
    console.error('=== AUTH ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is malformed'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please login again'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'Internal server error'
    });
  }
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }
  next();
};

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn });
  console.log(`Generated token for user ${userId} (first 20 chars): ${token.substring(0, 20)}`);
  return token;
};

module.exports = {
  authenticate,
  requireAdmin,
  generateToken
};
