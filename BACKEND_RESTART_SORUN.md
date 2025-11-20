# Backend Restart Sorunu - Çözüm Rehberi

## 🔍 Hemen Yapılacaklar

### 1. Backend Loglarını Kontrol Et

```bash
cd ~/HostingPoint
docker compose logs backend
```

**Son 50 satırı görmek için:**
```bash
docker compose logs --tail=50 backend
```

**Canlı logları takip et:**
```bash
docker compose logs -f backend
```

Bu loglarda **hata mesajları** göreceksiniz. En yaygın hatalar:

---

## 🚨 Yaygın Hatalar ve Çözümleri

### Hata 1: Veritabanı Bağlantı Hatası

**Belirtiler:**
```
Error: SQLITE_CANTOPEN: unable to open database file
Cannot connect to database
```

**Çözüm:**
```bash
# Veritabanı dizinini oluştur
mkdir -p backend/logs
mkdir -p backend/database

# İzinleri düzelt
sudo chown -R $USER:$USER backend/
chmod 755 backend/
```

---

### Hata 2: Port Zaten Kullanılıyor

**Belirtiler:**
```
Error: listen EADDRINUSE: address already in use :::3000
Port 3000 is already in use
```

**Çözüm:**
```bash
# Port 3000'i kullanan process'i bul
sudo lsof -i :3000
# veya
sudo netstat -tulpn | grep :3000

# Process'i durdur
sudo kill -9 <PID>

# Container'ı yeniden başlat
docker compose restart backend
```

---

### Hata 3: Environment Variables Eksik

**Belirtiler:**
```
JWT_SECRET is required
DOMAIN is not defined
```

**Çözüm:**
```bash
# .env dosyasını kontrol et
cat .env

# Eksik değişkenleri ekle
nano .env
```

**Minimum gerekli değişkenler:**
```env
DOMAIN=hostingpoint.net
JWT_SECRET=iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=
NODE_ENV=production
PORT=3000
DB_PATH=./backend/database.sqlite
```

---

### Hata 4: Node Modules Eksik veya Bozuk

**Belirtiler:**
```
Cannot find module 'express'
Module not found
```

**Çözüm:**
```bash
# Backend container'ını durdur
docker compose stop backend

# Backend'i yeniden build et
docker compose build --no-cache backend

# Yeniden başlat
docker compose up -d backend
```

---

### Hata 5: Docker Socket İzni Yok

**Belirtiler:**
```
Cannot connect to the Docker daemon
Permission denied while trying to connect to the Docker daemon socket
```

**Çözüm:**
```bash
# Docker socket izinlerini düzelt
sudo chmod 666 /var/run/docker.sock

# Kullanıcıyı docker grubuna ekle
sudo usermod -aG docker ubuntu
newgrp docker

# Container'ı yeniden başlat
docker compose restart backend
```

---

### Hata 6: Disk Alanı Dolmuş

**Belirtiler:**
```
No space left on device
ENOSPC: no space left on device
```

**Çözüm:**
```bash
# Disk kullanımını kontrol et
df -h

# Docker'ı temizle
docker system prune -a -f

# Eski image'ları sil
docker image prune -a -f
```

---

## 🔧 Genel Çözüm Adımları

### Adım 1: Logları İncele

```bash
docker compose logs --tail=100 backend | grep -i error
```

### Adım 2: Container'a Gir ve Manuel Test Et

```bash
# Container'a gir
docker exec -it vibehost-backend sh

# İçeride test et
node server.js
```

### Adım 3: Backend'i Sıfırdan Build Et

```bash
cd ~/HostingPoint

# Container'ı durdur
docker compose stop backend

# Image'ı sil
docker rmi hostingpoint-backend

# Yeniden build et
docker compose build --no-cache backend

# Yeniden başlat
docker compose up -d backend

# Logları takip et
docker compose logs -f backend
```

### Adım 4: .env Dosyasını Kontrol Et

```bash
# .env dosyasının var olduğundan emin ol
ls -la .env

# İçeriğini kontrol et
cat .env

# Eğer yoksa oluştur
cp .env.example .env
nano .env
```

---

## 📋 Kontrol Listesi

- [ ] Backend loglarını kontrol ettim
- [ ] .env dosyası var ve doğru ayarlanmış
- [ ] Port 3000 kullanılmıyor
- [ ] Docker socket izinleri doğru
- [ ] Disk alanı yeterli
- [ ] Veritabanı dizini oluşturulmuş
- [ ] Node modules yüklü

---

## 🆘 Hala Çalışmıyorsa

**Tüm logları toplayın:**
```bash
cd ~/HostingPoint
docker compose logs backend > backend-logs.txt 2>&1
cat backend-logs.txt
```

**Container durumunu kontrol edin:**
```bash
docker compose ps
docker inspect vibehost-backend
```

**Environment variables'ı kontrol edin:**
```bash
docker exec vibehost-backend env
```

