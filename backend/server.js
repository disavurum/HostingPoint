require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter, deployLimiter } = require('./middleware/rateLimiter');
const { authenticate } = require('./middleware/auth');

// Import models
const User = require('./models/User');
const Forum = require('./models/Forum');

// Import services
const DeployService = require('./services/DeployService');
const EmailService = require('./services/EmailService');

// Import routes
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'vibehost.io';

// Trust proxy (required when behind reverse proxy like Traefik)
// Set to 1 to trust only the first proxy (Traefik)
app.set('trust proxy', 1);

// Initialize database
async function initializeDatabase() {
  try {
    await User.init();
    await Forum.init();
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins (for now) to fix CORS issues
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check (no rate limiting)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'vibehost-backend',
    version: '1.0.0'
  });
});

// Auth routes (with auth rate limiting)
app.use('/api/auth', authRoutes);

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter);

// Deploy forum endpoint (with stricter rate limiting and authentication)
app.post('/api/deploy', authenticate, deployLimiter, async (req, res, next) => {
  try {
    const { forumName, email } = req.body;

    // Validation
    if (!forumName || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'forumName and email are required' 
      });
    }

    // Validate forum name format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(forumName)) {
      return res.status(400).json({ 
        error: 'Invalid forum name',
        message: 'Forum name must contain only lowercase letters, numbers, and hyphens' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        message: 'Please provide a valid email address' 
      });
    }

    // Check if forum already exists in database
    const existingForum = await Forum.findByName(forumName);
    if (existingForum) {
      return res.status(409).json({ 
        error: 'Forum already exists',
        message: `Forum "${forumName}" already exists` 
      });
    }

    // Create forum record in database
    const forumRecord = await Forum.create(forumName, req.userId, email, DOMAIN);
    
    logger.info('Starting forum deployment:', { 
      forumName, 
      userId: req.userId, 
      email 
    });

    // Deploy forum
    const result = await DeployService.deployForum(forumName, email, DOMAIN);
    
    // Update forum status
    await Forum.updateStatus(forumName, 'active');
    
    const forumUrl = `https://${forumName}.${DOMAIN}`;

    // Send welcome email
    EmailService.sendWelcomeEmail(email, forumName, forumUrl).catch(err => {
      logger.error('Failed to send welcome email:', err);
    });

    logger.info('Forum deployed successfully:', { forumName, forumUrl });

    res.json({
      success: true,
      message: 'Forum deployed successfully',
      forumUrl,
      forum: {
        id: forumRecord.id,
        name: forumName,
        status: 'active',
        url: forumUrl
      },
      ...result
    });
  } catch (error) {
    logger.error('Deployment error:', {
      error: error.message,
      stack: error.stack,
      forumName: req.body.forumName,
      userId: req.userId
    });

    // Update forum status to failed
    if (req.body.forumName) {
      Forum.updateStatus(req.body.forumName, 'failed').catch(err => {
        logger.error('Failed to update forum status:', err);
      });

      // Send failure email
      EmailService.sendDeploymentFailedEmail(
        req.body.email, 
        req.body.forumName, 
        error.message
      ).catch(err => {
        logger.error('Failed to send failure email:', err);
      });
    }

    next(error);
  }
});

// Get forum status (authenticated users can check their own forums)
app.get('/api/status/:forumName', authenticate, async (req, res, next) => {
  try {
    const { forumName } = req.params;
    
    if (!forumName || !/^[a-z0-9-]+$/.test(forumName)) {
      return res.status(400).json({ 
        error: 'Invalid forum name',
        message: 'Forum name must contain only lowercase letters, numbers, and hyphens' 
      });
    }

    // Check ownership (unless admin)
    const forum = await Forum.findByName(forumName);
    if (!forum) {
      return res.status(404).json({ 
        error: 'Forum not found',
        message: `Forum "${forumName}" does not exist` 
      });
    }

    if (forum.user_id !== req.userId && req.user.is_admin !== 1) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You do not have permission to access this forum' 
      });
    }

    const status = await DeployService.getForumStatus(forumName);
    
    res.json({
      ...status,
      forum: {
        id: forum.id,
        name: forum.name,
        email: forum.email,
        status: forum.status,
        createdAt: forum.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// List user's forums (authenticated)
app.get('/api/forums', authenticate, async (req, res, next) => {
  try {
    const userForums = await Forum.findByUser(req.userId);
    const forums = [];

    for (const forum of userForums) {
      try {
        const status = await DeployService.getForumStatus(forum.name);
        forums.push({
          id: forum.id,
          name: forum.name,
          email: forum.email,
          status: forum.status,
          url: `https://${forum.name}.${DOMAIN}`,
          createdAt: forum.created_at,
          running: status.running,
          containers: status.containers
        });
      } catch (error) {
        // If status check fails, still include the forum
        forums.push({
          id: forum.id,
          name: forum.name,
          email: forum.email,
          status: forum.status,
          url: `https://${forum.name}.${DOMAIN}`,
          createdAt: forum.created_at,
          running: false,
          error: 'Could not check container status'
        });
      }
    }

    res.json({ 
      success: true,
      forums 
    });
  } catch (error) {
    next(error);
  }
});

// Delete forum endpoint (authenticated, owner only)
app.delete('/api/forums/:forumName', authenticate, async (req, res, next) => {
  try {
    const { forumName } = req.params;
    
    if (!forumName || !/^[a-z0-9-]+$/.test(forumName)) {
      return res.status(400).json({ 
        error: 'Invalid forum name',
        message: 'Forum name must contain only lowercase letters, numbers, and hyphens' 
      });
    }

    // Check ownership
    const isOwner = await Forum.checkOwnership(forumName, req.userId);
    if (!isOwner && req.user.is_admin !== 1) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You do not have permission to delete this forum' 
      });
    }

    logger.info('Deleting forum:', { forumName, userId: req.userId });

    // Remove forum containers and files
    await DeployService.removeForum(forumName);
    
    // Remove from database
    await Forum.delete(forumName);

    logger.info('Forum deleted successfully:', { forumName });

    res.json({
      success: true,
      message: `Forum "${forumName}" deleted successfully`
    });
  } catch (error) {
    next(error);
  }
});

// Admin: List all forums
app.get('/api/admin/forums', authenticate, require('./middleware/auth').requireAdmin, async (req, res, next) => {
  try {
    const allForums = await Forum.findAll();
    const forums = [];

    for (const forum of allForums) {
      try {
        const status = await DeployService.getForumStatus(forum.name);
        forums.push({
          id: forum.id,
          name: forum.name,
          email: forum.email,
          userEmail: forum.user_email,
          userName: forum.user_name,
          status: forum.status,
          url: `https://${forum.name}.${DOMAIN}`,
          createdAt: forum.created_at,
          running: status.running,
          containers: status.containers
        });
      } catch (error) {
        forums.push({
          id: forum.id,
          name: forum.name,
          email: forum.email,
          userEmail: forum.user_email,
          userName: forum.user_name,
          status: forum.status,
          url: `https://${forum.name}.${DOMAIN}`,
          createdAt: forum.created_at,
          running: false,
          error: 'Could not check container status'
        });
      }
    }

    res.json({ 
      success: true,
      forums 
    });
  } catch (error) {
    next(error);
  }
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  await initializeDatabase();
  
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`VibeHost Backend API running on port ${PORT}`);
    logger.info(`Domain: ${DOMAIN}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  // Database pool handles its own shutdown usually, or we can explicitely end it if we exposed it.
  // User.close(); // Removed as pool manages connections
  // Forum.close();
  process.exit(0);
});

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
