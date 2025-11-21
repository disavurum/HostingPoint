const Docker = require('dockerode');
const logger = require('../utils/logger');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

class MonitorService {
  /**
   * Get resource usage stats for a forum's containers
   * @param {string} forumName 
   */
  static async getForumStats(forumName) {
    try {
      const containers = [
        `discourse-${forumName}`,
        `discourse-postgres-${forumName}`,
        `discourse-redis-${forumName}`
      ];

      const stats = await Promise.all(
        containers.map(async (containerName) => {
          try {
            const container = docker.getContainer(containerName);
            const containerStats = await container.stats({ stream: false });
            
            return {
              name: containerName,
              cpu: this.calculateCpuPercent(containerStats),
              memory: this.calculateMemoryUsage(containerStats),
              status: 'running'
            };
          } catch (error) {
            return {
              name: containerName,
              cpu: 0,
              memory: { used: 0, limit: 0, percent: 0 },
              status: 'stopped' // or not found
            };
          }
        })
      );

      return {
        forumName,
        timestamp: new Date().toISOString(),
        containers: stats
      };
    } catch (error) {
      logger.error(`Failed to get stats for forum ${forumName}:`, error);
      throw error;
    }
  }

  /**
   * Calculate CPU percentage from Docker stats
   */
  static calculateCpuPercent(stats) {
    if (!stats || !stats.cpu_stats || !stats.precpu_stats) return 0;

    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuCount = stats.cpu_stats.online_cpus || stats.cpu_stats.cpu_usage.percpu_usage?.length || 1;

    if (systemDelta > 0 && cpuDelta > 0) {
      return parseFloat(((cpuDelta / systemDelta) * cpuCount * 100).toFixed(2));
    }
    return 0;
  }

  /**
   * Calculate Memory usage from Docker stats
   */
  static calculateMemoryUsage(stats) {
    if (!stats || !stats.memory_stats) return { used: 0, limit: 0, percent: 0 };

    const used = stats.memory_stats.usage - (stats.memory_stats.stats?.cache || 0);
    const limit = stats.memory_stats.limit;
    const percent = limit > 0 ? parseFloat(((used / limit) * 100).toFixed(2)) : 0;

    return {
      used: this.formatBytes(used),
      limit: this.formatBytes(limit),
      percent
    };
  }

  static formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

module.exports = MonitorService;
