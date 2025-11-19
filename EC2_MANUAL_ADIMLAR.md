# EC2 Sunucusuna Manuel Bağlanma ve Deploy

## 🔐 SSH Bağlantısı

### 1. SSH Key İzinlerini Ayarla
```bash
chmod 400 saasmain.pem
```

### 2. Sunucuya Bağlan
```bash
ssh -i "saasmain.pem" ubuntu@ec2-13-61-225-144.eu-north-1.compute.amazonaws.com
```

## 📦 İlk Kurulum (Sadece İlk Seferinde)

### 1. Sistem Güncellemeleri
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Docker Kurulumu
```bash
# Docker kur
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo apt install -y docker-compose

# Kullanıcıyı docker grubuna ekle
sudo usermod -aG docker ubuntu
newgrp docker  # Veya yeni bir SSH session başlat
```

### 3. Git Kurulumu
```bash
sudo apt install -y git
```

### 4. Projeyi Klonla
```bash
cd ~
git clone https://github.com/disavurum/HostingPoint.git
cd HostingPoint
```

## ⚙️ Yapılandırma

### 1. .env Dosyasını Oluştur
```bash
cp .env.example .env
nano .env
```

**Minimum gerekli ayarlar:**
```env
DOMAIN=yourdomain.com
ACME_EMAIL=admin@yourdomain.com
POSTGRES_PASSWORD=güçlü-şifre-buraya
REDIS_PASSWORD=güçlü-şifre-buraya
JWT_SECRET=$(openssl rand -base64 32)
```

JWT_SECRET oluşturmak için:
```bash
openssl rand -base64 32
```

### 2. Firewall Ayarları
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw enable
```

### 3. Gerekli Dizinleri Oluştur
```bash
mkdir -p backend/customers
mkdir -p letsencrypt
chmod 600 letsencrypt
```

## 🚀 Deploy

### 1. Deploy Script'ini Çalıştır
```bash
chmod +x deploy.sh
./deploy.sh
```

### 2. Container'ları Kontrol Et
```bash
docker compose ps
docker compose logs -f
```

## 🔄 Güncelleme (Sonraki Deploy'lar İçin)

```bash
cd ~/HostingPoint
git pull
./deploy.sh
```

## 📋 Hızlı Komutlar

```bash
# Container durumunu kontrol et
docker compose ps

# Logları görüntüle
docker compose logs -f

# Belirli servisin logları
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f traefik

# Container'ları yeniden başlat
docker compose restart

# Container'ları durdur
docker compose down

# Container'ları yeniden build et
docker compose up -d --build
```

## 🌐 DNS Ayarları

Domain'inizin DNS kayıtlarını EC2 instance'ınızın public IP'sine yönlendirin:

- `A` kaydı: `yourdomain.com` → EC2 Public IP
- `A` kaydı: `*.yourdomain.com` → EC2 Public IP (wildcard)
- `A` kaydı: `api.yourdomain.com` → EC2 Public IP

EC2 Public IP'yi öğrenmek için:
```bash
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

## ✅ Başarı Kontrolü

Deploy başarılı olduktan sonra:

1. **Frontend:** `https://yourdomain.com`
2. **Backend API:** `https://api.yourdomain.com`
3. **Traefik Dashboard:** `http://ec2-ip:8080`

## 🔧 Sorun Giderme

### Permission Hatası
```bash
sudo usermod -aG docker ubuntu
newgrp docker
```

### Container'lar Başlamıyor
```bash
docker compose logs
docker compose restart
```

### SSL Sertifikası Oluşmuyor
- DNS'in doğru yönlendirildiğini kontrol edin
- Port 80'in açık olduğundan emin olun
- Traefik loglarını kontrol edin: `docker compose logs traefik`

