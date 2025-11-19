#!/bin/bash

set -e  # Exit on error

echo "🚀 Starting VibeHost deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please update .env with your configuration before continuing.${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example not found. Please create .env manually.${NC}"
    fi
fi

# Pull latest changes (if in git repo)
if [ -d .git ]; then
    echo -e "${BLUE}📥 Pulling latest changes...${NC}"
    git pull || echo "Not a git repository or unable to pull"
fi

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
if [ ! -d node_modules ]; then
    npm install
else
    npm install --production
fi
cd ..

# Install frontend dependencies and build
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd frontend
if [ ! -d node_modules ]; then
    npm install
else
    npm install
fi

echo -e "${BLUE}🔨 Building frontend...${NC}"
npm run build
cd ..

# Create necessary directories
echo -e "${BLUE}📁 Creating necessary directories...${NC}"
mkdir -p backend/customers
mkdir -p letsencrypt
chmod 600 letsencrypt 2>/dev/null || true

# Build and start Docker containers
echo -e "${BLUE}🐳 Building and starting Docker containers...${NC}"
docker-compose down 2>/dev/null || true
docker-compose up -d --build

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 5

# Check if containers are running
echo -e "${BLUE}🔍 Checking container status...${NC}"
docker-compose ps

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Traefik Dashboard: http://localhost:8080${NC}"
echo -e "${GREEN}🔧 Backend API: http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo -e "  1. Update DNS records to point your domain to this server"
echo -e "  2. Configure .env with your domain and email"
echo -e "  3. Ensure ports 80, 443, and 8080 are open in your firewall"

