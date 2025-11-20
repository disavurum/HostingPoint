const rateLimit = require('express-rate-limit');

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false, // Disable validation warnings for trust proxy
});

// Stricter limiter for deployment endpoint
const deployLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 deployments per hour
  message: {
    error: 'Too many deployment requests',
    message: 'Please wait before deploying another forum'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false, // Disable validation warnings for trust proxy
});

// Stricter limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  validate: false, // Disable validation warnings for trust proxy
});

module.exports = {
  apiLimiter,
  deployLimiter,
  authLimiter
};

