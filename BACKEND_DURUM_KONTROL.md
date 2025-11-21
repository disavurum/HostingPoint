# Backend Container Durum Kontrolü

## 🔍 Container Durumunu Kontrol Et

Backend logları boş görünüyor. Container'ın çalışıp çalışmadığını kontrol edin:

```bash
# Tüm container'ların durumunu kontrol et
docker compose ps

# Sadece backend container'ını kontrol et
docker ps -a | grep vibehost-backend

# Container detaylarını görüntüle
docker inspect vibehost-backend
```

---

## 🚨 Container Çalışmıyorsa

### 1. Container'ı Başlat

```bash
cd ~/HostingPoint
docker compose up -d backend
```

### 2. Container Durumunu Tekrar Kontrol Et

```bash
docker compose ps
```

**Beklenen çıktı:**
```
NAME                STATUS
vibehost-backend    Up X seconds/minutes
```

**Eğer "Exited" veya "Restarting" görüyorsanız:**

```bash
# Container'ın neden durduğunu gör
docker compose logs backend

# Son 100 satır log
docker compose logs --tail=100 backend
```

---

## 🔧 Container Sürekli Yeniden Başlıyorsa (Restart Loop)

### 1. Logları İncele

```bash
docker compose logs --tail=200 backend | grep -i error
```

### 2. Container'a Manuel Giriş Yap (Eğer çalışıyorsa)

```bash
# Container çalışıyorsa
docker exec -it vibehost-backend sh

# İçeride test et
cd /app
node server.js
```

### 3. Environment Variables Kontrolü

```bash
# Container içindeki environment variables'ı gör
docker exec vibehost-backend env | grep -E "(JWT|DB|NODE|DOMAIN)"
```

---

## ✅ Container Çalışıyorsa Ama Log Yok

### 1. Canlı Logları Takip Et

```bash
# Yeni logları görmek için
docker compose logs -f backend

# Başka bir terminal'de bir istek yap
curl https://api.hostingpoint.net/health
```

### 2. Container İçinde Log Dosyasını Kontrol Et

```bash
# Container'a gir
docker exec -it vibehost-backend sh

# Log dosyasını kontrol et
ls -la /app/logs/
cat /app/logs/app.log 2>/dev/null || echo "Log dosyası yok"
```

---

## 🛠️ Backend'i Sıfırdan Başlat

### Adım 1: Container'ı Durdur ve Sil

```bash
cd ~/HostingPoint
docker compose stop backend
docker compose rm -f backend
```

### Adım 2: Image'ı Kontrol Et

```bash
# Backend image'ının var olduğunu kontrol et
docker images | grep hostingpoint-backend

# Yoksa build et
docker compose build backend
```

### Adım 3: Dizinleri Oluştur

```bash
# Gerekli dizinleri oluştur
mkdir -p backend/database
mkdir -p backend/logs
chmod 755 backend/database
chmod 755 backend/logs
```

### Adım 4: .env Dosyasını Kontrol Et

```bash
# .env dosyasının var olduğundan emin ol
ls -la .env

# İçeriğini kontrol et
cat .env | grep -E "(DOMAIN|JWT|DB)"
```

**Minimum gerekli:**
```env
DOMAIN=hostingpoint.net
JWT_SECRET=iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=
DB_PATH=./database/database.sqlite
```

### Adım 5: Yeniden Başlat

```bash
# Build ve başlat
docker compose up -d --build backend

# Logları takip et
docker compose logs -f backend
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

# 4. Health check
curl https://api.hostingpoint.net/health

# 5. Container içindeki process'ler
docker exec vibehost-backend ps aux

# 6. Container içindeki dosyalar
docker exec vibehost-backend ls -la /app
```

---

## 🆘 Hala Sorun Varsa

### Tüm Bilgileri Topla

```bash
cd ~/HostingPoint

# Container durumu
docker compose ps > container-status.txt

# Backend logları
docker compose logs backend > backend-logs.txt

# Container detayları
docker inspect vibehost-backend > container-details.json

# Environment variables
docker exec vibehost-backend env > container-env.txt

# Dosyaları görüntüle
cat container-status.txt
cat backend-logs.txt
```

---

## 💡 İpucu: Version Uyarısını Kaldır

`docker-compose.yml` dosyasında `version:` satırı varsa kaldırın (Docker Compose v2'de gerekli değil).

```bash
# Eğer version satırı varsa
sed -i '/^version:/d' docker-compose.yml
```

