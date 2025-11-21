const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const Docker = require('dockerode');
const { v4: uuidv4 } = require('uuid');

const execAsync = promisify(exec);
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const CUSTOMERS_DIR = path.join(__dirname, '../customers');
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'changeme';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || 'changeme';

// Ensure customers directory exists
fs.ensureDirSync(CUSTOMERS_DIR);

class DeployService {
  /**
   * Deploy a new Discourse forum
   */
  static async deployForum(forumName, email, domain) {
    const customerDir = path.join(CUSTOMERS_DIR, forumName);

    // Check if forum already exists
    if (await fs.pathExists(customerDir)) {
      throw new Error(`Forum "${forumName}" already exists`);
    }

    try {
      // Create customer directory
      await fs.ensureDir(customerDir);

      // Generate unique passwords for this instance
      const dbPassword = uuidv4().replace(/-/g, '');
      const redisPassword = uuidv4().replace(/-/g, '');

      // Generate docker-compose.yml
      const composeContent = this.generateDockerCompose(
        forumName,
        email,
        domain,
        dbPassword,
        redisPassword
      );

      const composePath = path.join(customerDir, 'docker-compose.yml');
      await fs.writeFile(composePath, composeContent);

      // Deploy using docker-compose
      const deployCommand = `cd ${customerDir} && docker-compose up -d`;
      const { stdout, stderr } = await execAsync(deployCommand);

      if (stderr && !stderr.includes('Creating') && !stderr.includes('Starting')) {
        console.warn('Deployment warnings:', stderr);
      }

      // Wait a bit for containers to start
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verify containers are running
      const status = await this.getForumStatus(forumName);
      if (!status.running) {
        throw new Error('Containers failed to start properly');
      }

      return {
        forumName,
        status: 'deployed',
        containers: status.containers
      };
    } catch (error) {
      // Cleanup on failure
      try {
        await this.removeForum(forumName);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      throw error;
    }
  }

  /**
   * Generate docker-compose.yml content for a forum
   */
  static generateDockerCompose(forumName, email, domain, dbPassword, redisPassword) {
    const fullDomain = `${forumName}.${domain}`;

    return `version: '3.8'

services:
  postgres-${forumName}:
    image: bitnami/postgresql:15
    container_name: discourse-postgres-${forumName}
    restart: unless-stopped
    environment:
      - POSTGRES_USER=discourse
      - POSTGRES_PASSWORD=${dbPassword}
      - POSTGRES_DB=discourse
      - ALLOW_EMPTY_PASSWORD=no
    volumes:
      - postgres_data_${forumName}:/bitnami/postgresql/data
    networks:
      - discourse_${forumName}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U discourse"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis-${forumName}:
    image: bitnami/redis:7
    container_name: discourse-redis-${forumName}
    restart: unless-stopped
    environment:
      - REDIS_PASSWORD=${redisPassword}
      - ALLOW_EMPTY_PASSWORD=no
    volumes:
      - redis_data_${forumName}:/bitnami/redis/data
    networks:
      - discourse_${forumName}
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  discourse-${forumName}:
    image: bitnami/discourse:latest
    container_name: discourse-${forumName}
    restart: unless-stopped
    depends_on:
      postgres-${forumName}:
        condition: service_healthy
      redis-${forumName}:
        condition: service_healthy
    environment:
      - DISCOURSE_HOSTNAME=${fullDomain}
      - DISCOURSE_SITENAME=${forumName}
      - DISCOURSE_DEVELOPER_EMAILS=${email}
      - DISCOURSE_DATABASE_HOST=postgres-${forumName}
      - DISCOURSE_DATABASE_PORT_NUMBER=5432
      - DISCOURSE_DATABASE_USER=discourse
      - DISCOURSE_DATABASE_PASSWORD=${dbPassword}
      - DISCOURSE_DATABASE_NAME=discourse
      - DISCOURSE_REDIS_HOST=redis-${forumName}
      - DISCOURSE_REDIS_PORT_NUMBER=6379
      - DISCOURSE_REDIS_PASSWORD=${redisPassword}
      - DISCOURSE_SKIP_INSTALL=no
      - POSTGRESQL_HOST=postgres-${forumName}
      - POSTGRESQL_PORT_NUMBER=5432
      - POSTGRESQL_USER=discourse
      - POSTGRESQL_PASSWORD=${dbPassword}
      - POSTGRESQL_DATABASE=discourse
      - REDIS_HOST=redis-${forumName}
      - REDIS_PORT_NUMBER=6379
      - REDIS_PASSWORD=${redisPassword}
    volumes:
      - discourse_data_${forumName}:/bitnami/discourse
    networks:
      - discourse_${forumName}
      - coolify
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.${forumName}.rule=Host(\`${fullDomain}\`)"
      - "traefik.http.routers.${forumName}.entrypoints=websecure"
      - "traefik.http.routers.${forumName}.tls=true"
      - "traefik.http.routers.${forumName}.tls.certresolver=letsencrypt"
      - "traefik.http.services.${forumName}.loadbalancer.server.port=3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data_${forumName}:
  redis_data_${forumName}:
  discourse_data_${forumName}:

networks:
  discourse_${forumName}:
    driver: bridge
  coolify:
    external: true
`;
  }

  /**
   * Get status of a forum
   */
  static async getForumStatus(forumName) {
    try {
      const containers = [
        `discourse-${forumName}`,
        `discourse-postgres-${forumName}`,
        `discourse-redis-${forumName}`
      ];

      const statuses = await Promise.all(
        containers.map(async (containerName) => {
          try {
            const container = docker.getContainer(containerName);
            const info = await container.inspect();
            return {
              name: containerName,
              running: info.State.Running,
              status: info.State.Status
            };
          } catch (error) {
            return {
              name: containerName,
              running: false,
              status: 'not found'
            };
          }
        })
      );

      const running = statuses.every(s => s.running);

      return {
        forumName,
        running,
        containers: statuses
      };
    } catch (error) {
      throw new Error(`Failed to check status: ${error.message}`);
    }
  }

  /**
   * List all deployed forums
   */
  static async listForums() {
    try {
      const dirs = await fs.readdir(CUSTOMERS_DIR);
      const forums = [];

      for (const dir of dirs) {
        const forumPath = path.join(CUSTOMERS_DIR, dir);
        const stats = await fs.stat(forumPath);

        if (stats.isDirectory()) {
          const status = await this.getForumStatus(dir).catch(() => ({
            forumName: dir,
            running: false,
            containers: []
          }));
          forums.push(status);
        }
      }

      return forums;
    } catch (error) {
      throw new Error(`Failed to list forums: ${error.message}`);
    }
  }

  /**
   * Remove a forum
   */
  static async removeForum(forumName) {
    const customerDir = path.join(CUSTOMERS_DIR, forumName);

    if (!(await fs.pathExists(customerDir))) {
      // Directory doesn't exist, but that's okay - might have been manually deleted
      return { success: true, message: `Forum "${forumName}" removed successfully` };
    }

    try {
      // Stop and remove containers
      const removeCommand = `cd ${customerDir} && docker-compose down -v`;
      await execAsync(removeCommand).catch(err => {
        // Log but don't fail if containers are already removed
        console.warn('Container removal warning:', err.message);
      });

      // Remove directory
      await fs.remove(customerDir);

      return { success: true, message: `Forum "${forumName}" removed successfully` };
    } catch (error) {
      throw new Error(`Failed to remove forum: ${error.message}`);
    }
  }
}

module.exports = DeployService;

