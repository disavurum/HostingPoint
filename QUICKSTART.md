# VibeHost Quick Start Guide

## Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose installed
- Domain name with DNS access
- Root or sudo access

## Installation Steps

### 1. Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Clone or Upload Project

```bash
# If using git
git clone <your-repo-url>
cd VibeHost

# Or upload files via SCP/SFTP
```

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit with your settings
nano .env
```

Required settings:
- `DOMAIN`: Your domain (e.g., `vibehost.io`)
- `ACME_EMAIL`: Email for Let's Encrypt certificates
- `POSTGRES_PASSWORD`: Strong password for PostgreSQL
- `REDIS_PASSWORD`: Strong password for Redis

### 4. Configure DNS

Add the following DNS records pointing to your server IP:

```
A     @                    YOUR_SERVER_IP
A     *                    YOUR_SERVER_IP  (wildcard for subdomains)
A     api                  YOUR_SERVER_IP
A     traefik              YOUR_SERVER_IP  (optional)
```

### 5. Configure Firewall

```bash
# Allow required ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp  # Traefik dashboard (optional)
sudo ufw enable
```

### 6. Deploy

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 7. Verify Installation

- Frontend: `https://yourdomain.com`
- Backend API: `https://api.yourdomain.com`
- Traefik Dashboard: `http://your-server-ip:8080` (or `https://traefik.yourdomain.com`)

## First Forum Deployment

1. Visit `https://yourdomain.com`
2. Click "Hemen Başla" (Get Started)
3. Enter:
   - Forum Name: `test-forum` (lowercase, alphanumeric, hyphens only)
   - Email: Your admin email
4. Wait for deployment (usually 2-5 minutes)
5. Access your forum at `https://test-forum.yourdomain.com`

## Troubleshooting

### Containers not starting
```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs backend
docker-compose logs traefik
```

### SSL certificates not generating
- Verify DNS is pointing correctly: `dig yourdomain.com`
- Check Traefik logs: `docker-compose logs traefik | grep acme`
- Ensure port 80 is accessible from internet

### Forum deployment fails
- Check backend logs: `docker-compose logs backend`
- Verify forum name format (no uppercase, spaces, or special chars)
- Check disk space: `df -h`
- Check Docker resources: `docker system df`

### Permission errors
```bash
# Fix letsencrypt directory permissions
sudo chown -R $USER:$USER letsencrypt
chmod 600 letsencrypt/acme.json 2>/dev/null || true
```

## Maintenance

### View all deployed forums
```bash
curl https://api.yourdomain.com/api/forums
```

### Check forum status
```bash
curl https://api.yourdomain.com/api/status/forum-name
```

### Update system
```bash
git pull
./deploy.sh
```

### Backup customer data
```bash
# Backup docker volumes
docker run --rm -v discourse_postgres_data_forumname:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres_backup.tar.gz /data
```

## Security Recommendations

1. **Change default passwords** in `.env`
2. **Use strong passwords** (16+ characters, mixed case, numbers, symbols)
3. **Keep system updated**: `sudo apt update && sudo apt upgrade`
4. **Monitor logs**: Set up log rotation and monitoring
5. **Firewall**: Only open necessary ports
6. **Backup**: Regular backups of customer data
7. **Rate limiting**: Consider adding rate limiting to API endpoints
8. **Authentication**: Add authentication layer for production use

## Support

For issues or questions, check:
- Backend logs: `docker-compose logs backend`
- Traefik logs: `docker-compose logs traefik`
- Container status: `docker-compose ps`

