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
const MonitorService = require('./services/MonitorService');
const BillingService = require('./services/BillingService');
const BackupService = require('./services/BackupService');
const LimitService = require('./services/LimitService');

// Import routes
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'vibehost.io';
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_12345';

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
    service: 'hostingpoint-backend',
    version: '1.0.0'
  });
});

// Auth routes (rate limiting temporarily disabled for debugging)
app.use('/api/auth', authRoutes);

// Apply general rate limiting to all API routes (temporarily disabled)
// app.use('/api', apiLimiter);

// Generate random subdomain
function generateRandomSubdomain() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'app-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Deploy forum endpoint (rate limiting temporarily disabled)
app.post('/api/deploy', authenticate, async (req, res, next) => {
  try {
    const { forumName, customDomain, autoGenerate } = req.body;

    let finalForumName = forumName;
    let finalDomain = DOMAIN;
    let customDomainValue = null;

    // Handle custom domain
    if (customDomain) {
      // Validate custom domain format
      const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
      if (!domainRegex.test(customDomain)) {
        return res.status(400).json({
          error: 'Invalid domain format',
          message: 'Please provide a valid domain name (e.g., example.com)'
        });
      }

      // For custom domain, use the domain as the forum name
      finalForumName = customDomain.replace(/\./g, '-').toLowerCase();
      finalDomain = customDomain;
      customDomainValue = customDomain;
    } else {
      // Handle auto-generated or manual subdomain
      if (autoGenerate || !forumName) {
        // Generate random subdomain
        let attempts = 0;
        do {
          finalForumName = generateRandomSubdomain();
          const existing = await Forum.findByName(finalForumName);
          if (!existing) break;
          attempts++;
        } while (attempts < 10);

        if (attempts >= 10) {
          return res.status(500).json({
            error: 'Failed to generate unique subdomain',
            message: 'Please try again or provide a custom subdomain name'
          });
        }
      } else {
        // Validate forum name format (alphanumeric and hyphens only)
        if (!/^[a-z0-9-]+$/.test(forumName)) {
          return res.status(400).json({
            error: 'Invalid forum name',
            message: 'Forum name must contain only lowercase letters, numbers, and hyphens'
          });
        }
        finalForumName = forumName;
      }

      // Check if forum already exists in database
      const existingForum = await Forum.findByName(finalForumName);
      if (existingForum) {
        return res.status(409).json({
          error: 'Forum already exists',
          message: `Forum "${finalForumName}" already exists`
        });
      }
    }

    // Use logged-in user's email
    const email = req.user.email;
    if (!email) {
      return res.status(400).json({
        error: 'User email not found',
        message: 'User email is required for forum deployment'
      });
    }

    // Check deployment limits before creating forum
    const canDeploy = await LimitService.canDeployForum(req.userId);
    if (!canDeploy.allowed) {
      return res.status(403).json({
        error: 'Limit exceeded',
        message: canDeploy.message,
        limit: canDeploy.limit,
        current: canDeploy.current
      });
    }

    // Check storage limit
    const storageCheck = await LimitService.checkStorageLimit(req.userId);
    if (storageCheck.exceeded) {
      return res.status(403).json({
        error: 'Storage limit exceeded',
        message: storageCheck.message,
        usage: storageCheck.usage,
        limit: storageCheck.limit
      });
    }

    // Create forum record in database
    const forumRecord = await Forum.create(finalForumName, req.userId, email, finalDomain, customDomainValue);

    logger.info('Starting forum deployment:', {
      forumName: finalForumName,
      customDomain: customDomainValue,
      userId: req.userId,
      email
    });

    // Check if localhost
    const isLocalhost = finalDomain === 'localhost' || finalDomain === '127.0.0.1' || DOMAIN === 'localhost' || DOMAIN === '127.0.0.1';

    // Deploy forum
    const result = await DeployService.deployForum(finalForumName, email, finalDomain, customDomainValue);

    // Update forum status
    await Forum.updateStatus(finalForumName, 'active');

    // Generate forum URL based on environment
    let forumUrl;
    if (customDomainValue) {
      forumUrl = `https://${customDomainValue}`;
    } else if (isLocalhost) {
      // For localhost, use the port from deployment result
      const port = result.port || 3001;
      forumUrl = `http://localhost:${port}`;
    } else {
      forumUrl = `https://${finalForumName}.${DOMAIN}`;
    }

    // Send welcome email
    EmailService.sendWelcomeEmail(email, finalForumName, forumUrl).catch(err => {
      logger.error('Failed to send welcome email:', err);
    });

    logger.info('Forum deployed successfully:', { forumName: finalForumName, forumUrl });

    res.json({
      success: true,
      message: 'Forum deployed successfully',
      forumUrl,
      port: result.port || null,
      forum: {
        id: forumRecord.id,
        name: finalForumName,
        customDomain: customDomainValue,
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
      const userEmail = req.user?.email;
      if (userEmail) {
        EmailService.sendDeploymentFailedEmail(
          userEmail,
          req.body.forumName,
          error.message
        ).catch(err => {
          logger.error('Failed to send failure email:', err);
        });
      }
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

// Get forum stats (CPU/RAM)
app.get('/api/forums/:forumName/stats', authenticate, async (req, res, next) => {
  try {
    const { forumName } = req.params;

    // Check ownership
    const forum = await Forum.findByName(forumName);
    if (!forum) {
      return res.status(404).json({ error: 'Forum not found' });
    }

    if (forum.user_id !== req.userId && req.user.is_admin !== 1) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const stats = await MonitorService.getForumStats(forumName);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Create checkout session
app.post('/api/billing/checkout', authenticate, async (req, res, next) => {
  try {
    const session = await BillingService.createCheckoutSession(
      req.userId,
      req.user.email,
      STRIPE_PRICE_ID
    );
    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

// Get forum backups
app.get('/api/forums/:forumName/backups', authenticate, async (req, res, next) => {
  try {
    // Check ownership logic here (omitted for brevity, same as above)
    const backups = await BackupService.listBackups(req.params.forumName);
    res.json({ backups });
  } catch (error) {
    next(error);
  }
});

// Create backup
app.post('/api/forums/:forumName/backups', authenticate, async (req, res, next) => {
  try {
    const backup = await BackupService.createBackup(req.params.forumName);
    res.json({ success: true, backup });
  } catch (error) {
    next(error);
  }
});

// Admin Middleware
const isAdmin = (req, res, next) => {
  if (req.user.is_admin !== 1) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Admin Routes
app.get('/api/admin/stats', authenticate, isAdmin, async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalForums = await Forum.count();
    // Mock revenue
    const revenue = totalForums * 5;

    res.json({
      users: totalUsers,
      forums: totalForums,
      revenue: revenue
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/users', authenticate, isAdmin, async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/forums', authenticate, isAdmin, async (req, res, next) => {
  try {
    const forums = await Forum.findAll();
    res.json({ forums });
  } catch (error) {
    next(error);
  }
});

// Get user usage summary
app.get('/api/usage', authenticate, async (req, res, next) => {
  try {
    const usage = await LimitService.getUserUsageSummary(req.userId);
    res.json({ success: true, usage });
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
    logger.info(`HostingPoint Backend API running on port ${PORT}`);
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
