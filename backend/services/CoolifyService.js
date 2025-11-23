const axios = require('axios');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class CoolifyService {
  constructor() {
    // Normalize URL - remove IPv6 brackets if present and use IPv4 or hostname
    let baseUrl = process.env.COOLIFY_URL || 'http://localhost:8000';
    
    // If URL contains IPv6 address, try to convert or use hostname
    if (baseUrl.includes('[') || baseUrl.match(/[0-9a-f:]+::/i)) {
      logger.warn('IPv6 address detected in COOLIFY_URL. Trying to resolve...');
      // Try to use hostname instead
      baseUrl = baseUrl.replace(/\[.*?\]/, 'localhost').replace(/[0-9a-f:]+::[0-9a-f:]+/i, 'localhost');
    }
    
    this.baseUrl = baseUrl;
    this.apiKey = process.env.COOLIFY_API_KEY;
    this.serverId = process.env.COOLIFY_SERVER_ID || 1;
    
    if (!this.apiKey) {
      logger.warn('COOLIFY_API_KEY not set. Coolify integration will not work.');
    }
    
    logger.info('CoolifyService initialized:', {
      baseUrl: this.baseUrl,
      serverId: this.serverId,
      hasApiKey: !!this.apiKey
    });
  }

  /**
   * Get axios instance with authentication
   */
  getApiClient() {
    if (!this.apiKey) {
      throw new Error('Coolify API key not configured');
    }

    const client = axios.create({
      baseURL: `${this.baseUrl}/api/v1`,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 60000, // 60 seconds for deployment operations
      // Force IPv4 if IPv6 issues occur
      family: 4, // Use IPv4 only
      // Additional connection options
      validateStatus: function (status) {
        return status < 500; // Don't throw on 4xx errors
      }
    });

    // Add request interceptor for better error logging
    client.interceptors.request.use(
      (config) => {
        logger.debug('Coolify API request:', {
          method: config.method,
          url: config.url,
          baseURL: config.baseURL
        });
        return config;
      },
      (error) => {
        logger.error('Coolify API request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for better error logging
    client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNREFUSED') {
          logger.error('Coolify connection refused. Check COOLIFY_URL:', {
            url: this.baseUrl,
            error: error.message,
            suggestion: 'Try using http://localhost:8000 or http://coolify:8000'
          });
        }
        return Promise.reject(error);
      }
    );

    return client;
  }

  /**
   * Create a new project in Coolify
   */
  async createProject(projectName) {
    try {
      const client = this.getApiClient();
      
      const response = await client.post('/projects', {
        name: projectName,
        description: `Discourse forum project for ${projectName}`
      });

      logger.info('Coolify project created:', { projectName, projectId: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Failed to create Coolify project:', {
        projectName,
        error: error.response?.data || error.message,
        code: error.code,
        url: this.baseUrl
      });
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Coolify'a bağlanılamıyor. COOLIFY_URL kontrol edin: ${this.baseUrl}. Önerilen: http://localhost:8000 veya http://coolify:8000`);
      }
      
      throw new Error(`Coolify proje oluşturulamadı: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create a Docker Compose application in Coolify
   */
  async createApplication(projectId, forumName, email, domain, customDomain = null) {
    try {
      const client = this.getApiClient();

      // Generate unique passwords
      const dbPassword = uuidv4().replace(/-/g, '');
      const redisPassword = uuidv4().replace(/-/g, '');

      // Determine full domain
      const fullDomain = customDomain || `${forumName}.${domain}`;

      // Generate docker-compose.yml content
      const dockerCompose = this.generateDockerCompose(
        forumName,
        email,
        fullDomain,
        dbPassword,
        redisPassword
      );

      // Create application
      const applicationData = {
        name: forumName,
        description: `Discourse forum: ${fullDomain}`,
        type: 'docker-compose',
        docker_compose: dockerCompose,
        docker_compose_file: 'docker-compose.yml',
        server_id: this.serverId,
        domain: fullDomain,
        port: 3000,
        // Environment variables
        env_variables: {
          DISCOURSE_HOSTNAME: fullDomain,
          DISCOURSE_SITENAME: forumName,
          DISCOURSE_DEVELOPER_EMAILS: email,
          DISCOURSE_DATABASE_HOST: `postgres-${forumName}`,
          DISCOURSE_DATABASE_PORT_NUMBER: '5432',
          DISCOURSE_DATABASE_USER: 'discourse',
          DISCOURSE_DATABASE_PASSWORD: dbPassword,
          DISCOURSE_DATABASE_NAME: 'discourse',
          DISCOURSE_REDIS_HOST: `redis-${forumName}`,
          DISCOURSE_REDIS_PORT_NUMBER: '6379',
          DISCOURSE_REDIS_PASSWORD: redisPassword,
          POSTGRES_PASSWORD: dbPassword,
          REDIS_PASSWORD: redisPassword
        }
      };

      const response = await client.post(`/projects/${projectId}/applications`, applicationData);

      logger.info('Coolify application created:', {
        forumName,
        applicationId: response.data.id,
        projectId
      });

      return {
        applicationId: response.data.id,
        projectId,
        dbPassword,
        redisPassword,
        domain: fullDomain
      };
    } catch (error) {
      logger.error('Failed to create Coolify application:', {
        forumName,
        projectId,
        error: error.response?.data || error.message
      });
      throw new Error(`Coolify uygulama oluşturulamadı: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Deploy application in Coolify
   */
  async deployApplication(projectId, applicationId) {
    try {
      const client = this.getApiClient();

      const response = await client.post(
        `/projects/${projectId}/applications/${applicationId}/deploy`
      );

      logger.info('Coolify deployment started:', { projectId, applicationId });
      return response.data;
    } catch (error) {
      logger.error('Failed to deploy Coolify application:', {
        projectId,
        applicationId,
        error: error.response?.data || error.message
      });
      throw new Error(`Coolify deployment başlatılamadı: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get application status
   */
  async getApplicationStatus(projectId, applicationId) {
    try {
      const client = this.getApiClient();

      const response = await client.get(
        `/projects/${projectId}/applications/${applicationId}`
      );

      return {
        status: response.data.status || 'unknown',
        running: response.data.status === 'running',
        url: response.data.fqdn || response.data.domain
      };
    } catch (error) {
      logger.error('Failed to get application status:', {
        projectId,
        applicationId,
        error: error.response?.data || error.message
      });
      return { status: 'unknown', running: false };
    }
  }

  /**
   * Delete application and project
   */
  async deleteApplication(projectId, applicationId) {
    try {
      const client = this.getApiClient();

      // Delete application
      await client.delete(`/projects/${projectId}/applications/${applicationId}`).catch(err => {
        logger.warn('Application deletion warning:', err.message);
      });

      // Delete project
      await client.delete(`/projects/${projectId}`).catch(err => {
        logger.warn('Project deletion warning:', err.message);
      });

      logger.info('Coolify resources deleted:', { projectId, applicationId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to delete Coolify resources:', {
        projectId,
        applicationId,
        error: error.response?.data || error.message
      });
      throw new Error(`Coolify kaynakları silinemedi: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Generate Docker Compose content for Discourse
   */
  generateDockerCompose(forumName, email, fullDomain, dbPassword, redisPassword) {
    return `version: '3.8'

services:
  postgres-${forumName}:
    image: postgres:15-alpine
    container_name: discourse-postgres-${forumName}
    restart: unless-stopped
    environment:
      - POSTGRES_USER=discourse
      - POSTGRES_PASSWORD=${dbPassword}
      - POSTGRES_DB=discourse
      - ALLOW_EMPTY_PASSWORD=no
    volumes:
      - postgres_data_${forumName}:/var/lib/postgresql/data
    networks:
      - discourse_${forumName}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U discourse"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis-${forumName}:
    image: redis:7-alpine
    container_name: discourse-redis-${forumName}
    restart: unless-stopped
    command: redis-server --requirepass ${redisPassword}
    volumes:
      - redis_data_${forumName}:/data
    networks:
      - discourse_${forumName}
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${redisPassword}", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  discourse-${forumName}:
    image: discourse/discourse:latest
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
    networks:
      - discourse_${forumName}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data_${forumName}:
  redis_data_${forumName}:

networks:
  discourse_${forumName}:
    driver: bridge
`;
  }
}

module.exports = new CoolifyService();

