# EC2 Ubuntu'ya Hızlı Başlangıç

## 🚀 Hızlı Kurulum (5 Dakika)

### 1. EC2'ye Bağlan
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2. Projeyi Klonla
```bash
cd ~
git clone https://github.com/disavurum/HostingPoint.git
cd HostingPoint
```

### 3. Setup Script'ini Çalıştır
```bash
# Script'e çalıştırma izni ver ve çalıştır
chmod +x setup-ec2.sh
./setup-ec2.sh
```

**Not:** Eğer script çalışmazsa, manuel olarak kurulum yapın:
```bash
# Docker kur
sudo apt update
sudo apt install -y docker.io docker-compose git
sudo usermod -aG docker ubuntu
newgrp docker
```

### 4. .env Dosyasını Ayarla
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

### 5. DNS Ayarları
Domain'inizin DNS kayıtlarını EC2 IP'nize yönlendirin:
- `A` kaydı: `yourdomain.com` → EC2 IP
- `A` kaydı: `*.yourdomain.com` → EC2 IP (wildcard)
- `A` kaydı: `api.yourdomain.com` → EC2 IP

### 6. Firewall Ayarları
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 7. Deploy Et
```bash
chmod +x deploy.sh
./deploy.sh
```

### 8. Kontrol Et
```bash
# Container'ları kontrol et
docker compose ps

# Logları kontrol et
docker compose logs -f
```

## ✅ Başarılı!

Uygulamanız şu adreslerde çalışıyor olmalı:
- Frontend: `https://yourdomain.com`
- Backend API: `https://api.yourdomain.com`
- Traefik Dashboard: `http://your-ec2-ip:8080`

## 🔧 Sorun Giderme

### Container'lar başlamıyor
```bash
docker compose logs
docker compose restart
```

### SSL sertifikası oluşmuyor
- DNS'in doğru yönlendirildiğini kontrol edin
- Port 80'in açık olduğundan emin olun
- Traefik loglarını kontrol edin: `docker compose logs traefik`

### Permission hatası
```bash
sudo usermod -aG docker ubuntu
newgrp docker
```

## 📚 Detaylı Rehber

Daha detaylı bilgi için `DEPLOY_EC2.md` dosyasına bakın.

