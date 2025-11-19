#!/bin/bash

# EC2 Ubuntu Server Setup Script for VibeHost
# Bu script EC2 Ubuntu sunucusunda gerekli tüm paketleri kurar

set -e  # Exit on error

echo "🚀 EC2 Ubuntu Server Setup başlatılıyor..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  Bu script bazı komutlar için sudo gerektirir.${NC}"
    echo -e "${YELLOW}⚠️  Sudo şifrenizi girmeniz istenebilir.${NC}"
fi

# Update system
echo -e "${BLUE}📦 Sistem güncellemeleri yapılıyor...${NC}"
sudo apt update && sudo apt upgrade -y

# Install basic packages
echo -e "${BLUE}📦 Temel paketler kuruluyor...${NC}"
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common git

# Install Docker
echo -e "${BLUE}🐳 Docker kuruluyor...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    echo -e "${GREEN}✅ Docker kuruldu${NC}"
else
    echo -e "${YELLOW}⚠️  Docker zaten kurulu${NC}"
fi

# Install Docker Compose (standalone, if needed)
if ! command -v docker-compose &> /dev/null; then
    echo -e "${BLUE}🐳 Docker Compose kuruluyor...${NC}"
    sudo apt install -y docker-compose
    echo -e "${GREEN}✅ Docker Compose kuruldu${NC}"
else
    echo -e "${YELLOW}⚠️  Docker Compose zaten kurulu${NC}"
fi

# Add user to docker group
echo -e "${BLUE}👤 Kullanıcı docker grubuna ekleniyor...${NC}"
sudo usermod -aG docker $USER || sudo usermod -aG docker ubuntu
echo -e "${GREEN}✅ Kullanıcı docker grubuna eklendi${NC}"
echo -e "${YELLOW}⚠️  Değişikliklerin etkili olması için yeni bir SSH session başlatmanız gerekebilir${NC}"

# Install Node.js (optional, for manual builds)
echo -e "${BLUE}📦 Node.js kuruluyor...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}✅ Node.js kuruldu${NC}"
else
    echo -e "${YELLOW}⚠️  Node.js zaten kurulu: $(node --version)${NC}"
fi

# Configure UFW Firewall
echo -e "${BLUE}🔥 Firewall yapılandırılıyor...${NC}"
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8080/tcp  # Traefik Dashboard
echo -e "${YELLOW}⚠️  UFW'yi etkinleştirmek için: sudo ufw enable${NC}"

# Docker service auto-start
echo -e "${BLUE}⚙️  Docker servisinin otomatik başlaması ayarlanıyor...${NC}"
sudo systemctl enable docker
sudo systemctl start docker

# Check installations
echo -e "${BLUE}🔍 Kurulumlar kontrol ediliyor...${NC}"
echo ""
echo -e "${GREEN}=== Kurulum Özeti ===${NC}"
echo -e "Docker: $(docker --version 2>/dev/null || echo 'Kurulu değil')"
echo -e "Docker Compose: $(docker-compose --version 2>/dev/null || docker compose version 2>/dev/null || echo 'Kurulu değil')"
echo -e "Node.js: $(node --version 2>/dev/null || echo 'Kurulu değil')"
echo -e "Git: $(git --version 2>/dev/null || echo 'Kurulu değil')"
echo ""

echo -e "${GREEN}✅ Kurulum tamamlandı!${NC}"
echo ""
echo -e "${YELLOW}📝 Sonraki adımlar:${NC}"
echo -e "  1. Yeni bir SSH session başlatın (docker grubu için)"
echo -e "  2. Projeyi klonlayın: git clone https://github.com/disavurum/HostingPoint.git"
echo -e "  3. .env dosyasını yapılandırın"
echo -e "  4. ./deploy.sh çalıştırın"
echo ""
echo -e "${YELLOW}⚠️  Önemli:${NC}"
echo -e "  - DNS ayarlarınızı EC2 IP'nize yönlendirin"
echo -e "  - .env dosyasında güçlü şifreler kullanın"
echo -e "  - UFW'yi etkinleştirin: sudo ufw enable"

