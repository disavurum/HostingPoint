# Backend Container Yeniden Başlatma

## 🚨 Sorun

Backend container **19 saat önce durmuş** (Exited status). Container'ı yeniden başlatmamız gerekiyor.

## ✅ Hızlı Çözüm

### Adım 1: Neden Durdığını Kontrol Et

```bash
cd ~/HostingPoint

# Container'ın neden durduğunu gör
docker compose logs backend

# Son 100 satır
docker compose logs --tail=100 backend

# Container'ın exit code'unu kontrol et
docker inspect vibehost-backend | grep -A 5 "State"
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
# .env dosyasının var olduğundan emin ol
ls -la .env

# İçeriğini kontrol et
cat .env
```

**Minimum gerekli değişkenler:**
```env
DOMAIN=hostingpoint.net
JWT_SECRET=iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=
NODE_ENV=production
PORT=3000
DB_PATH=./database/database.sqlite
```

### Adım 4: Container'ı Yeniden Başlat

```bash
# Eski container'ı kaldır
docker compose rm -f backend

# Yeniden build ve başlat
docker compose up -d --build backend

# Logları canlı takip et
docker compose logs -f backend
```

---

## 🔍 Detaylı Kontrol

### Container Durumunu Kontrol Et

```bash
# Container durumu
docker compose ps

# Backend container detayları
docker inspect vibehost-backend | grep -A 10 "State"
```

### Logları İncele

```bash
# Tüm loglar
docker compose logs backend > backend-all-logs.txt
cat backend-all-logs.txt

# Sadece hatalar
docker compose logs backend | grep -i error

# Son başlatma logları
docker compose logs backend | tail -50
```

### Environment Variables Kontrolü

```bash
# Container içindeki environment variables'ı gör (eğer çalışıyorsa)
docker exec vibehost-backend env | grep -E "(JWT|DB|NODE|DOMAIN)"

# Veya .env dosyasını kontrol et
cat .env | grep -E "(DOMAIN|JWT|DB)"
```

---

## 🛠️ Sıfırdan Başlatma

Eğer yukarıdaki adımlar işe yaramazsa:

### 1. Tüm Container'ları Durdur

```bash
cd ~/HostingPoint
docker compose down
```

### 2. Backend Image'ını Yeniden Build Et

```bash
# Eski image'ı sil
docker rmi hostingpoint-backend 2>/dev/null || true

# Yeniden build et
docker compose build --no-cache backend
```

### 3. Dizinleri Oluştur

```bash
mkdir -p backend/database
mkdir -p backend/logs
chmod 755 backend/database
chmod 755 backend/logs
```

### 4. .env Dosyasını Kontrol Et

```bash
# .env dosyası yoksa oluştur
if [ ! -f .env ]; then
  cat > .env << EOF
DOMAIN=hostingpoint.net
JWT_SECRET=iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=
NODE_ENV=production
PORT=3000
DB_PATH=./database/database.sqlite
BCRYPT_ROUNDS=10
LOG_LEVEL=info
EOF
fi
```

### 5. Container'ı Başlat

```bash
# Başlat
docker compose up -d backend

# Durumu kontrol et
docker compose ps

# Logları takip et
docker compose logs -f backend
```

---

## ✅ Başarı Kontrolü

Container başarıyla başladıysa:

```bash
# Container durumu "Up" olmalı
docker compose ps | grep vibehost-backend

# Health check çalışmalı
curl https://api.hostingpoint.net/health

# Loglarda hata olmamalı
docker compose logs backend | grep -i error
```

**Beklenen çıktı:**
- Container durumu: `Up X seconds/minutes`
- Health check: `{"status":"ok",...}`
- Loglarda: `VibeHost Backend API running on port 3000`

---

## 🆘 Hala Çalışmıyorsa

### Logları Topla

```bash
cd ~/HostingPoint

# Tüm logları kaydet
docker compose logs backend > backend-error-logs-$(date +%Y%m%d-%H%M%S).txt

# Container detaylarını kaydet
docker inspect vibehost-backend > backend-container-details-$(date +%Y%m%d-%H%M%S).json

# Dosyaları görüntüle
cat backend-error-logs-*.txt
```

### Manuel Test

```bash
# Container'ı manuel olarak başlat (interactive mode)
docker compose run --rm backend sh

# İçeride test et
cd /app
node server.js
```

---

## 📝 Notlar

- Container "Exited (0)" durumunda ise, normal bir şekilde durmuş demektir (crash değil)
- Muhtemelen bir hata nedeniyle durmuş veya restart policy çalışmamış
- Logları kontrol ederek neden durduğunu anlayabilirsiniz

