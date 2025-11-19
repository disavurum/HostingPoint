# EC2 Ubuntu Server'a Deploy Rehberi

Bu rehber, VibeHost uygulamasını AWS EC2 Ubuntu sunucusuna deploy etmek için adım adım talimatlar içerir.

## Ön Gereksinimler

- AWS EC2 Ubuntu 20.04 veya 22.04 instance
- Domain adı (DNS ayarları yapılabilir)
- EC2 Security Group'unda açık portlar: 22 (SSH), 80 (HTTP), 443 (HTTPS), 8080 (Traefik Dashboard - opsiyonel)

## Adım 1: EC2 Instance'a Bağlanma

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

## Adım 2: Sistem Güncellemeleri ve Gerekli Paketlerin Kurulumu

```bash
# Sistem güncellemeleri
sudo apt update && sudo apt upgrade -y

# Docker kurulumu
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Docker Compose v2 kurulumu (eğer yoksa)
sudo apt install -y docker-compose

# Docker'ı kullanıcıya ekle (sudo olmadan kullanmak için)
sudo usermod -aG docker ubuntu
newgrp docker

# Git kurulumu
sudo apt install -y git

# Node.js kurulumu (opsiyonel, sadece manuel build için gerekli)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

## Adım 3: Projeyi Klonlama

```bash
# Ana dizine git
cd ~

# Projeyi klonla
git clone https://github.com/disavurum/HostingPoint.git
cd HostingPoint
```

## Adım 4: Environment Variables Ayarlama

```bash
# .env dosyası oluştur
cp .env.example .env
nano .env
```

`.env` dosyasında şu değişkenleri ayarlayın:

```env
# Domain ayarları
DOMAIN=yourdomain.com
ACME_EMAIL=admin@yourdomain.com

# Veritabanı şifreleri (güçlü şifreler kullanın!)
POSTGRES_PASSWORD=your-strong-postgres-password
REDIS_PASSWORD=your-strong-redis-password

# JWT Secret (güçlü bir key oluşturun)
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

# Veritabanı
DB_PATH=./backend/database.sqlite
NODE_ENV=production
PORT=3000

# Email ayarları (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=10
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

**Önemli:** JWT_SECRET için güçlü bir key oluşturun:
```bash
openssl rand -base64 32
```

## Adım 5: DNS Ayarları

Domain'inizin DNS kayıtlarını EC2 instance'ınızın public IP'sine yönlendirin:

- `A` kaydı: `yourdomain.com` → EC2 Public IP
- `A` kaydı: `*.yourdomain.com` → EC2 Public IP (wildcard subdomain için)
- `A` kaydı: `api.yourdomain.com` → EC2 Public IP
- `A` kaydı: `traefik.yourdomain.com` → EC2 Public IP (opsiyonel, Traefik dashboard için)

DNS değişikliklerinin yayılması 5-30 dakika sürebilir. Kontrol etmek için:
```bash
dig yourdomain.com
# veya
nslookup yourdomain.com
```

## Adım 6: Firewall Ayarları (UFW)

```bash
# UFW'yi etkinleştir
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8080/tcp  # Traefik Dashboard (opsiyonel)
sudo ufw enable
sudo ufw status
```

## Adım 7: Docker Socket İzinleri

```bash
# Docker socket'e erişim için izin ver
sudo chmod 666 /var/run/docker.sock
```

## Adım 8: Deployment Script'i Çalıştırma

```bash
# Script'e execute izni ver
chmod +x deploy.sh

# Deploy et
./deploy.sh
```

Veya manuel olarak:

```bash
# Gerekli dizinleri oluştur
mkdir -p backend/customers
mkdir -p letsencrypt
chmod 600 letsencrypt

# Docker container'ları build et ve başlat
docker compose up -d --build
```

## Adım 9: Container'ları Kontrol Etme

```bash
# Tüm container'ların durumunu kontrol et
docker compose ps

# Logları kontrol et
docker compose logs -f

# Belirli bir servisin loglarını kontrol et
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f traefik
```

## Adım 10: Servislerin Çalıştığını Doğrulama

```bash
# Backend API'yi test et
curl http://localhost:3000/api/health

# Traefik dashboard (eğer yapılandırıldıysa)
# Tarayıcıda: http://your-ec2-ip:8080
```

## Adım 11: Otomatik Başlatma (Opsiyonel)

Container'ların sistem yeniden başlatıldığında otomatik başlaması için:

```bash
# docker-compose.yml'de zaten restart: unless-stopped var
# Ama Docker servisinin otomatik başlaması için:
sudo systemctl enable docker
```

## Sorun Giderme

### Container'lar başlamıyor

```bash
# Docker servisini kontrol et
sudo systemctl status docker

# Logları detaylı incele
docker compose logs

# Container'ları yeniden başlat
docker compose restart
```

### SSL sertifikaları oluşmuyor

```bash
# Traefik loglarını kontrol et
docker compose logs traefik

# DNS'in doğru yönlendirildiğini kontrol et
dig yourdomain.com

# Port 80'in açık olduğunu kontrol et
sudo netstat -tulpn | grep :80
```

### Disk alanı sorunu

```bash
# Disk kullanımını kontrol et
df -h

# Kullanılmayan Docker image'ları temizle
docker system prune -a
```

### Permission hatası (Docker socket)

```bash
# Docker grubuna kullanıcıyı ekle
sudo usermod -aG docker ubuntu
# Yeni bir SSH session başlat veya
newgrp docker
```

## Güvenlik Önerileri

1. **Güçlü Şifreler:** Tüm default şifreleri değiştirin
2. **JWT Secret:** Güçlü, rastgele bir JWT secret kullanın
3. **Firewall:** Sadece gerekli portları açın
4. **SSH Key:** Password authentication yerine SSH key kullanın
5. **Düzenli Güncellemeler:** Sistem ve Docker image'larını düzenli güncelleyin
6. **Backup:** Veritabanını düzenli yedekleyin

## Güncelleme İşlemi

Yeni değişiklikleri deploy etmek için:

```bash
cd ~/HostingPoint
git pull
./deploy.sh
```

## Monitoring

```bash
# Container kaynak kullanımı
docker stats

# Disk kullanımı
df -h

# Sistem kaynakları
htop
# veya
top
```

## Yardımcı Komutlar

```bash
# Tüm container'ları durdur
docker compose down

# Tüm container'ları durdur ve volume'ları sil
docker compose down -v

# Belirli bir container'ı yeniden başlat
docker compose restart backend

# Container'ları rebuild et
docker compose up -d --build

# Logları takip et
docker compose logs -f
```

## Sonraki Adımlar

1. Domain'inizin DNS ayarlarını yapın
2. SSL sertifikalarının otomatik oluşturulmasını bekleyin (birkaç dakika)
3. Uygulamaya tarayıcıdan erişin: `https://yourdomain.com`
4. API'ye erişin: `https://api.yourdomain.com`
5. İlk kullanıcı hesabını oluşturun

## Destek

Sorun yaşarsanız:
- Container loglarını kontrol edin: `docker compose logs`
- Traefik loglarını kontrol edin: `docker compose logs traefik`
- Backend loglarını kontrol edin: `docker compose logs backend`

