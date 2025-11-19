const logger = require('../utils/logger');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.userId || 'anonymous'
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error: ' + message;
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Authentication failed';
  } else if (err.code === 'SQLITE_CONSTRAINT') {
    statusCode = 409;
    message = 'Resource already exists';
  } else if (err.code === 'ENOENT') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Don't expose internal errors in production
  const response = {
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      details: err.stack,
      originalError: err.message 
    })
  };

  res.status(statusCode).json(response);
};

/**
 * 404 handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};

