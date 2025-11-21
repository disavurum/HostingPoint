# Backend Container Başlatma - Adım Adım

## 🚨 Durum

Backend container logları boş - container hiç başlamamış veya çok hızlı durmuş.

## ✅ Adım Adım Çözüm

### Adım 1: Mevcut Container'ı Temizle

```bash
cd ~/HostingPoint

# Container'ı durdur ve kaldır
docker compose stop backend
docker compose rm -f backend
```

### Adım 2: Gerekli Dizinleri Oluştur

```bash
# Veritabanı ve log dizinlerini oluştur
mkdir -p backend/database
mkdir -p backend/logs
chmod 755 backend/database
chmod 755 backend/logs
```

### Adım 3: .env Dosyasını Kontrol Et

```bash
# .env dosyası var mı?
ls -la .env

# Yoksa oluştur
if [ ! -f .env ]; then
  cat > .env << 'EOF'
DOMAIN=hostingpoint.net
JWT_SECRET=iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=
NODE_ENV=production
PORT=3000
DB_PATH=./database/database.sqlite
BCRYPT_ROUNDS=10
LOG_LEVEL=info
EOF
  echo ".env dosyası oluşturuldu"
else
  echo ".env dosyası mevcut"
  cat .env
fi
```

### Adım 4: Container'ı Başlat ve Logları İzle

```bash
# Container'ı başlat (detached mode)
docker compose up -d backend

# Hemen logları kontrol et
docker compose logs backend

# Canlı logları takip et (bu komutu çalıştırın ve bekleyin)
docker compose logs -f backend
```

**Beklenen çıktı:**
- `Connected to SQLite database`
- `Database initialized successfully`
- `VibeHost Backend API running on port 3000`

### Adım 5: Container Durumunu Kontrol Et

```bash
# Container çalışıyor mu?
docker compose ps

# Backend container'ı kontrol et
docker ps | grep vibehost-backend
```

**Beklenen durum:** `Up X seconds/minutes`

### Adım 6: Eğer Container Hala Çalışmıyorsa

```bash
# Container'ın neden durduğunu gör
docker inspect vibehost-backend | grep -A 10 "State"

# Exit code'u kontrol et
docker inspect vibehost-backend | grep -i "exitcode"

# Son logları gör
docker compose logs --tail=50 backend
```

---

## 🔧 Container Sürekli Duruyorsa

### Manuel Build ve Test

```bash
# Backend'i yeniden build et
docker compose build --no-cache backend

# Build loglarını kontrol et
docker compose build backend 2>&1 | tee build.log

# Container'ı başlat
docker compose up -d backend

# Logları takip et
docker compose logs -f backend
```

### Container İçinde Manuel Test

```bash
# Container'ı interactive mode'da başlat
docker compose run --rm backend sh

# İçeride:
cd /app
ls -la
node server.js
```

---

## 🐛 Yaygın Hatalar

### Hata 1: "Cannot find module"

**Çözüm:**
```bash
# Backend'i yeniden build et
docker compose build --no-cache backend
```

### Hata 2: "SQLITE_CANTOPEN"

**Çözüm:**
```bash
# Dizinleri oluştur
mkdir -p backend/database
chmod 755 backend/database

# Container'ı yeniden başlat
docker compose restart backend
```

### Hata 3: "Port already in use"

**Çözüm:**
```bash
# Port 3000'i kullanan process'i bul
sudo lsof -i :3000

# Process'i durdur
sudo kill -9 <PID>

# Container'ı yeniden başlat
docker compose up -d backend
```

---

## 📋 Hızlı Kontrol Komutları

```bash
# 1. Container durumu
docker compose ps

# 2. Backend logları
docker compose logs --tail=50 backend

# 3. Container çalışıyor mu?
docker ps | grep vibehost-backend

# 4. Health check (container çalışıyorsa)
curl https://api.hostingpoint.net/health

# 5. Container içindeki dosyalar
docker exec vibehost-backend ls -la /app 2>/dev/null || echo "Container çalışmıyor"
```

---

## ✅ Başarı Kontrolü

Container başarıyla başladıysa:

1. ✅ `docker compose ps` → Backend "Up" durumunda
2. ✅ `docker compose logs backend` → Loglar görünüyor
3. ✅ `curl https://api.hostingpoint.net/health` → `{"status":"ok",...}`

---

## 🆘 Hala Çalışmıyorsa

Tüm bilgileri toplayın:

```bash
cd ~/HostingPoint

# Container durumu
docker compose ps > container-status.txt

# Backend logları
docker compose logs backend > backend-logs.txt 2>&1

# Container detayları
docker inspect vibehost-backend > container-details.json 2>&1

# Build logları (eğer build yaptıysanız)
docker compose build backend > build-logs.txt 2>&1

# Dosyaları görüntüle
echo "=== Container Status ==="
cat container-status.txt

echo -e "\n=== Backend Logs ==="
cat backend-logs.txt

echo -e "\n=== Container Details ==="
cat container-details.json | grep -A 20 "State"
```

