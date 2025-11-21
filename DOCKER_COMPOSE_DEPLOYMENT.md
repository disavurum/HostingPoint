# VibeHost - Docker Compose Deployment Guide

## Quick Start

Deploy the entire VibeHost stack (frontend + backend) with a single command in Coolify.

## Prerequisites

1. ✅ Coolify installed on EC2
2. ✅ DNS configured (A records for `@`, `api`, `*` pointing to EC2 IP)
3. ✅ GitHub repository accessible

## Deployment Steps

### 1. In Coolify Dashboard

1. **Create New Resource**
   - Go to your project (or create one: "VibeHost")
   - Click **"Add Resource"**
   - Select **"Docker Compose"**

2. **Configure Repository**
   - **Git Repository URL:** Your GitHub repo (e.g., `https://github.com/disavurum/HostingPoint`)
   - **Branch:** `master`
   - **Base Directory:** `/` (leave empty or use root)
   - **Docker Compose File:** `docker-compose.yml` (default)

3. **Set Environment Variables**
   
   Click "Environment Variables" tab and add:
   
   ```env
   DOMAIN=hostingpoint.net
   FRONTEND_URL=https://hostingpoint.net
   JWT_SECRET=<generate-random-32-char-string>
   JWT_EXPIRES_IN=7d
   BCRYPT_ROUNDS=10
   ACME_EMAIL=admin@hostingpoint.net
   
   # Optional - Stripe (for billing features)
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PRICE_ID=price_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
   
   **Generate JWT_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

4. **Deploy**
   - Click **"Deploy"** button
   - Wait 3-5 minutes for:
     - Backend build
     - Frontend build
     - Container startup
     - SSL certificate generation

### 2. Verify Deployment

After deployment completes:

**Backend API:**
```
https://api.hostingpoint.net
```
Should return 404 or "Cannot GET /" (this is normal, API is running)

**Frontend:**
```
https://hostingpoint.net
https://www.hostingpoint.net
```
Should show the VibeHost landing page

## Architecture

The docker-compose setup creates:

```
┌─────────────────────────────────────┐
│         Coolify/Traefik             │
│         (Reverse Proxy)             │
└────────────┬────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌────▼─────┐
│Frontend│      │ Backend  │
│(nginx) │      │ (Node.js)│
│Port: 80│      │Port: 3000│
└────────┘      └──────┬───┘
                       │
                  ┌────▼────┐
                  │ SQLite  │
                  │ Volume  │
                  └─────────┘
```

## Services

### Backend (vibehost-api)
- **Container:** `vibehost-api`
- **Domain:** `api.DOMAIN`
- **Port:** 3000 (internal)
- **Volume:** `backend-data:/app/data` (SQLite persistence)
- **Docker Socket:** Mounted for forum deployment

### Frontend (vibehost-web)
- **Container:** `vibehost-web`
- **Domain:** `DOMAIN` and `www.DOMAIN`
- **Port:** 80 (internal)
- **Build:** Multi-stage (Node build → Nginx serve)

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DOMAIN` | Yes | `hostingpoint.net` | Your domain |
| `FRONTEND_URL` | Yes | `https://hostingpoint.net` | Frontend URL |
| `JWT_SECRET` | Yes | - | Random secret for JWT |
| `ACME_EMAIL` | No | `admin@DOMAIN` | Email for SSL certs |
| `STRIPE_SECRET_KEY` | No | - | Stripe API key (optional) |
| `STRIPE_PRICE_ID` | No | - | Stripe price ID (optional) |

## Updating/Redeploying

1. **Push changes to GitHub**
2. **In Coolify:**
   - Go to your Docker Compose resource
   - Click **"Redeploy"**
   - Coolify will pull latest code and rebuild

## Logs & Monitoring

**View Logs:**
- In Coolify → Your Resource → **"Logs"** tab
- Select service: `backend` or `frontend`

**Health Checks:**
- Backend: `http://api.hostingpoint.net/api/health`
- Frontend: `http://hostingpoint.net/health`

## Troubleshooting

### Build Fails

**Check logs:**
- Coolify → Resource → Logs
- Look for error messages during build

**Common issues:**
- Missing environment variables
- Syntax errors in docker-compose.yml
- Network connectivity

### Containers Not Starting

**Check Coolify network:**
```bash
# SSH to EC2
docker network ls | grep coolify
```

Should show `coolify` network. If missing:
```bash
docker network create coolify
```

### SSL Certificate Issues

- Ensure DNS is pointing to EC2 IP
- Wait 1-2 minutes for Let's Encrypt validation
- Check Traefik logs: `docker logs coolify-proxy`

### Backend Can't Spawn Forums

**Verify Docker socket mount:**
```bash
docker exec vibehost-api ls -la /var/run/docker.sock
```

Should show the socket file.

## Scaling

To add more resources:

1. **Redis (for caching):**
   Add to `docker-compose.yml`:
   ```yaml
   redis:
     image: redis:alpine
     networks:
       - coolify
   ```

2. **PostgreSQL (instead of SQLite):**
   Add postgres service and update backend `DB_PATH`

3. **Multiple backends (load balancing):**
   Use Coolify's built-in load balancing

## Backup

**Database:**
```bash
# SSH to EC2
docker cp vibehost-api:/app/data/database.sqlite ./backup-$(date +%Y%m%d).sqlite
```

**Volume backup:**
```bash
docker run --rm -v backend-data:/data -v $(pwd):/backup alpine tar czf /backup/backend-data.tar.gz /data
```

## Rollback

If deployment fails, rollback to previous version:

1. Coolify → Resource → **"Deployments"** tab
2. Find previous successful deployment
3. Click **"Redeploy"** on that version

---

## Success Checklist

- [ ] Environment variables set in Coolify
- [ ] Deployment completed without errors
- [ ] `https://hostingpoint.net` shows landing page
- [ ] `https://api.hostingpoint.net` returns API response
- [ ] Can register and login
- [ ] Can deploy a test forum
- [ ] SSL certificates working (green padlock)

🎉 **Deployment Complete!**
