const winston = require('winston');
const path = require('path');
const fs = require('fs');

const LOG_DIR = path.join(__dirname, '../logs');
const LOG_FILE = process.env.LOG_FILE || path.join(LOG_DIR, 'app.log');
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'vibehost-backend' },
  transports: [
    // Write all logs to file
    new winston.transports.File({ 
      filename: LOG_FILE,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write errors to separate file
    new winston.transports.File({ 
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

module.exports = logger;

