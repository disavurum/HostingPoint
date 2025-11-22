const Forum = require('../models/Forum');
const MonitorService = require('./MonitorService');
const logger = require('../utils/logger');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs-extra');

const execAsync = promisify(exec);
const CUSTOMERS_DIR = path.join(__dirname, '../customers');

// Plan limits (in GB)
const PLAN_LIMITS = {
  starter: {
    storage: 10, // GB
    forums: 1,
    name: 'Başlangıç'
  },
  pro: {
    storage: 50, // GB
    forums: 3,
    name: 'Pro'
  },
  enterprise: {
    storage: Infinity, // Unlimited
    forums: Infinity,
    name: 'Kurumsal'
  }
};

class LimitService {
  /**
   * Get user's plan type (defaults to starter)
   */
  static async getUserPlan(userId) {
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);
      return user?.plan_type || 'starter';
    } catch (error) {
      return 'starter';
    }
  }

  /**
   * Get disk usage for a forum in GB
   */
  static async getForumDiskUsage(forumName) {
    try {
      const forumDir = path.join(CUSTOMERS_DIR, forumName);
      
      if (!(await fs.pathExists(forumDir))) {
        return 0;
      }

      // Use du command to get directory size (works on Linux/Mac)
      // For Windows, we'll use a Node.js solution
      let sizeInBytes = 0;

      if (process.platform === 'win32') {
        // Windows: Use PowerShell to get directory size
        const { stdout } = await execAsync(
          `powershell -Command "(Get-ChildItem -Path '${forumDir}' -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum"`
        );
        sizeInBytes = parseInt(stdout.trim()) || 0;
      } else {
        // Linux/Mac: Use du command
        const { stdout } = await execAsync(`du -sb ${forumDir}`);
        sizeInBytes = parseInt(stdout.split('\t')[0]) || 0;
      }

      // Convert bytes to GB
      const sizeInGB = sizeInBytes / (1024 * 1024 * 1024);
      return parseFloat(sizeInGB.toFixed(2));
    } catch (error) {
      console.error(`Error getting disk usage for ${forumName}:`, error);
      return 0;
    }
  }

  /**
   * Get total disk usage for all user's forums
   */
  static async getUserTotalDiskUsage(userId) {
    try {
      const forums = await Forum.findByUser(userId);
      let totalUsage = 0;

      for (const forum of forums) {
        const usage = await this.getForumDiskUsage(forum.name);
        totalUsage += usage;
      }

      return parseFloat(totalUsage.toFixed(2));
    } catch (error) {
      console.error(`Error getting total disk usage for user ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Check if user can deploy a new forum
   */
  static async canDeployForum(userId) {
    try {
      const plan = await this.getUserPlan(userId);
      const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
      
      // Check forum count limit
      const forums = await Forum.findByUser(userId);
      const activeForums = forums.filter(f => f.status === 'active');
      
      if (limits.forums !== Infinity && activeForums.length >= limits.forums) {
        return {
          allowed: false,
          reason: 'forum_limit',
          message: `Plan limitinize ulaştınız. ${limits.forums} forum hakkınız var.`,
          limit: limits.forums,
          current: activeForums.length
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking deploy limit:', error);
      return { allowed: true }; // Allow on error to not block users
    }
  }

  /**
   * Check if user has exceeded storage limit
   */
  static async checkStorageLimit(userId) {
    try {
      const plan = await this.getUserPlan(userId);
      const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
      
      if (limits.storage === Infinity) {
        return {
          exceeded: false,
          usage: 0,
          limit: Infinity,
          percent: 0
        };
      }

      const totalUsage = await this.getUserTotalDiskUsage(userId);
      const exceeded = totalUsage >= limits.storage;
      const percent = (totalUsage / limits.storage) * 100;

      return {
        exceeded,
        usage: totalUsage,
        limit: limits.storage,
        percent: parseFloat(percent.toFixed(2)),
        warning: percent >= 80, // Warn at 80%
        message: exceeded 
          ? `Depolama limitinizi aştınız! ${limits.storage}GB limitiniz var, ${totalUsage.toFixed(2)}GB kullanıyorsunuz.`
          : percent >= 80
          ? `Depolama limitinize yaklaşıyorsunuz. ${totalUsage.toFixed(2)}GB / ${limits.storage}GB kullanılıyor.`
          : null
      };
    } catch (error) {
      console.error('Error checking storage limit:', error);
      return {
        exceeded: false,
        usage: 0,
        limit: 0,
        percent: 0
      };
    }
  }

  /**
   * Get user's usage summary
   */
  static async getUserUsageSummary(userId) {
    try {
      const plan = await this.getUserPlan(userId);
      const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
      const forums = await Forum.findByUser(userId);
      const activeForums = forums.filter(f => f.status === 'active');
      const totalUsage = await this.getUserTotalDiskUsage(userId);

      return {
        plan: plan,
        planName: limits.name,
        forums: {
          used: activeForums.length,
          limit: limits.forums === Infinity ? 'Sınırsız' : limits.forums,
          percent: limits.forums === Infinity ? 0 : (activeForums.length / limits.forums) * 100
        },
        storage: {
          used: totalUsage,
          limit: limits.storage === Infinity ? 'Sınırsız' : limits.storage,
          percent: limits.storage === Infinity ? 0 : (totalUsage / limits.storage) * 100,
          unit: 'GB'
        }
      };
    } catch (error) {
      console.error('Error getting usage summary:', error);
      return null;
    }
  }

  /**
   * Enforce storage limit - stop containers if limit exceeded
   */
  static async enforceStorageLimit(userId) {
    try {
      const storageCheck = await this.checkStorageLimit(userId);
      
      if (storageCheck.exceeded) {
        // Get user's forums
        const forums = await Forum.findByUser(userId);
        
        // Stop the most recently created forum (or implement a better strategy)
        if (forums.length > 0) {
          const latestForum = forums.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          )[0];
          
          // Stop containers (but don't delete data)
          const DeployService = require('./DeployService');
          const customerDir = path.join(CUSTOMERS_DIR, latestForum.name);
          
          if (await fs.pathExists(customerDir)) {
            await execAsync(`cd ${customerDir} && docker-compose stop`);
            await Forum.updateStatus(latestForum.name, 'suspended');
            
            logger.warn(`Suspended forum ${latestForum.name} due to storage limit`);
          }
        }
      }
    } catch (error) {
      console.error('Error enforcing storage limit:', error);
    }
  }
}

module.exports = LimitService;

