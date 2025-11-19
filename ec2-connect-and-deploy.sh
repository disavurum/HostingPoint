#!/bin/bash

# EC2 Sunucusuna Bağlan ve Deploy Et
# Bu script'i yerel bilgisayarınızda çalıştırın

set -e

# Renkler
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 EC2 Sunucusuna Bağlan ve Deploy Et${NC}"
echo ""

# SSH bilgileri
SSH_KEY="saasmain.pem"
SSH_USER="ubuntu"
SSH_HOST="ec2-13-61-225-144.eu-north-1.compute.amazonaws.com"

# Key dosyasının var olduğunu kontrol et
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${YELLOW}⚠️  SSH key dosyası bulunamadı: $SSH_KEY${NC}"
    echo -e "${YELLOW}⚠️  Lütfen key dosyasının yolunu kontrol edin${NC}"
    exit 1
fi

# Key dosyasına doğru izinleri ver
echo -e "${BLUE}🔐 SSH key izinleri ayarlanıyor...${NC}"
chmod 400 "$SSH_KEY"

echo -e "${BLUE}📡 EC2 sunucusuna bağlanılıyor...${NC}"
echo -e "${YELLOW}Sunucu: $SSH_USER@$SSH_HOST${NC}"
echo ""

# SSH ile bağlan ve komutları çalıştır
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" << 'ENDSSH'
    set -e
    
    echo "✅ Sunucuya bağlandı!"
    echo ""
    
    # Sistem güncellemeleri
    echo "📦 Sistem güncellemeleri yapılıyor..."
    sudo apt update && sudo apt upgrade -y
    
    # Docker kurulumu
    if ! command -v docker &> /dev/null; then
        echo "🐳 Docker kuruluyor..."
        sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt update
        sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        sudo apt install -y docker-compose
    else
        echo "✅ Docker zaten kurulu"
    fi
    
    # Git kurulumu
    if ! command -v git &> /dev/null; then
        echo "📦 Git kuruluyor..."
        sudo apt install -y git
    else
        echo "✅ Git zaten kurulu"
    fi
    
    # Kullanıcıyı docker grubuna ekle
    echo "👤 Docker grubu ayarlanıyor..."
    sudo usermod -aG docker ubuntu || true
    
    # Projeyi klonla veya güncelle
    echo "📥 Proje kontrol ediliyor..."
    if [ -d "HostingPoint" ]; then
        echo "📁 Proje zaten var, güncelleniyor..."
        cd HostingPoint
        git pull || echo "Git pull başarısız, devam ediliyor..."
    else
        echo "📥 Proje klonlanıyor..."
        git clone https://github.com/disavurum/HostingPoint.git
        cd HostingPoint
    fi
    
    # .env dosyasını kontrol et
    if [ ! -f .env ]; then
        echo "⚙️  .env dosyası oluşturuluyor..."
        if [ -f .env.example ]; then
            cp .env.example .env
            echo "⚠️  .env dosyası oluşturuldu. Lütfen düzenleyin: nano .env"
        else
            echo "⚠️  .env.example bulunamadı. Manuel olarak oluşturun."
        fi
    fi
    
    # Gerekli dizinleri oluştur
    echo "📁 Dizinler oluşturuluyor..."
    mkdir -p backend/customers
    mkdir -p letsencrypt
    chmod 600 letsencrypt 2>/dev/null || true
    
    # Firewall ayarları
    echo "🔥 Firewall ayarlanıyor..."
    sudo ufw allow 22/tcp 2>/dev/null || true
    sudo ufw allow 80/tcp 2>/dev/null || true
    sudo ufw allow 443/tcp 2>/dev/null || true
    sudo ufw allow 8080/tcp 2>/dev/null || true
    
    echo ""
    echo "✅ Kurulum tamamlandı!"
    echo ""
    echo "📝 Sonraki adımlar:"
    echo "  1. .env dosyasını düzenleyin: nano .env"
    echo "  2. DNS ayarlarını yapın (domain'i EC2 IP'ye yönlendirin)"
    echo "  3. Deploy edin: ./deploy.sh"
    echo ""
    echo "🔧 Manuel deploy için:"
    echo "  cd ~/HostingPoint"
    echo "  chmod +x deploy.sh"
    echo "  ./deploy.sh"
ENDSSH

echo ""
echo -e "${GREEN}✅ İşlem tamamlandı!${NC}"
echo ""
echo -e "${YELLOW}📝 Şimdi yapmanız gerekenler:${NC}"
echo "  1. SSH ile tekrar bağlanın:"
echo "     ssh -i saasmain.pem ubuntu@ec2-13-61-225-144.eu-north-1.compute.amazonaws.com"
echo ""
echo "  2. .env dosyasını düzenleyin:"
echo "     cd ~/HostingPoint"
echo "     nano .env"
echo ""
echo "  3. DNS ayarlarını yapın (domain'inizi EC2 IP'ye yönlendirin)"
echo ""
echo "  4. Deploy edin:"
echo "     chmod +x deploy.sh"
echo "     ./deploy.sh"

