# Login 500 Hatası - Çözüm Rehberi

## 🚨 Sorun

Giriş yaparken `api.hostingpoint.net/api/auth/login` endpoint'i **500 Internal Server Error** döndürüyor.

## 🔍 Hızlı Teşhis

### 1. Backend Loglarını Kontrol Et

```bash
# EC2 sunucunuzda
cd ~/HostingPoint  # veya proje dizininiz

# Son 100 satır log
docker compose logs --tail=100 backend

# Canlı logları takip et
docker compose logs -f backend
```

**Aradığınız hatalar:**
- `SQLITE_CANTOPEN` - Veritabanı dosyası açılamıyor
- `Cannot find module` - Node modülleri eksik
- `JWT_SECRET` - Environment variable eksik
- `Database query error` - SQL sorgu hatası

---

## ✅ Çözüm Adımları

### Adım 1: Environment Variables Kontrolü

`.env` dosyasının var olduğundan ve doğru ayarlandığından emin olun:

```bash
# .env dosyasını kontrol et
cat .env
```

**Minimum gerekli değişkenler:**

```env
DOMAIN=hostingpoint.net
JWT_SECRET=iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=
NODE_ENV=production
PORT=3000
DB_PATH=./database/database.sqlite
BCRYPT_ROUNDS=10
```

**Eğer .env yoksa:**

```bash
# .env dosyası oluştur
cat > .env << EOF
DOMAIN=hostingpoint.net
JWT_SECRET=iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=
NODE_ENV=production
PORT=3000
DB_PATH=./database/database.sqlite
BCRYPT_ROUNDS=10
LOG_LEVEL=info
EOF
```

---

### Adım 2: Veritabanı Dizinini Oluştur

```bash
# Backend dizininde database ve logs klasörlerini oluştur
mkdir -p backend/database
mkdir -p backend/logs

# İzinleri düzelt
chmod 755 backend/database
chmod 755 backend/logs
```

---

### Adım 3: Docker Compose'u Güncelle

`docker-compose.yml` dosyası güncellendi. Şimdi container'ları yeniden başlatın:

```bash
# Container'ları durdur
docker compose down

# Yeniden build ve başlat
docker compose up -d --build

# Logları kontrol et
docker compose logs -f backend
```

---

### Adım 4: Veritabanı Bağlantısını Test Et

```bash
# Backend container'ına gir
docker exec -it vibehost-backend sh

# Container içinde veritabanı dosyasını kontrol et
ls -la /app/database/

# Node.js ile test et
node -e "const db = require('./config/db'); db.get('SELECT 1', [], (err, row) => { console.log(err || 'OK'); process.exit(0); });"
```

---

## 🚨 Yaygın Hatalar ve Çözümleri

### Hata 1: SQLITE_CANTOPEN

**Belirtiler:**
```
Error: SQLITE_CANTOPEN: unable to open database file
```

**Çözüm:**

```bash
# Database dizinini oluştur
mkdir -p backend/database

# İzinleri düzelt
chmod 755 backend/database

# Container'ı yeniden başlat
docker compose restart backend
```

---

### Hata 2: JWT_SECRET Eksik

**Belirtiler:**
```
JWT_SECRET is required
```

**Çözüm:**

```bash
# .env dosyasına JWT_SECRET ekle
echo "JWT_SECRET=iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=" >> .env

# Container'ı yeniden başlat
docker compose restart backend
```

---

### Hata 3: Database Tablosu Yok

**Belirtiler:**
```
SQLITE_ERROR: no such table: users
```

**Çözüm:**

Backend başlatıldığında otomatik olarak tablolar oluşturulmalı. Eğer oluşmamışsa:

```bash
# Backend container'ına gir
docker exec -it vibehost-backend sh

# Manuel olarak tabloyu oluştur
node -e "
const User = require('./models/User');
User.init().then(() => {
  console.log('Database initialized');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
"
```

---

### Hata 4: Port Zaten Kullanılıyor

**Belirtiler:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Çözüm:**

```bash
# Port 3000'i kullanan process'i bul
sudo lsof -i :3000

# Process'i durdur
sudo kill -9 <PID>

# Container'ı yeniden başlat
docker compose restart backend
```

---

## 🔧 Detaylı Teşhis

### Backend Container Durumunu Kontrol Et

```bash
# Container durumu
docker compose ps

# Container detayları
docker inspect vibehost-backend

# Environment variables'ı kontrol et
docker exec vibehost-backend env | grep -E "(JWT|DB|NODE)"
```

### Veritabanı Dosyasını Kontrol Et

```bash
# Veritabanı dosyasının var olduğunu kontrol et
ls -lh backend/database/database.sqlite

# Dosya boyutu 0 ise sorun var
# Dosya yoksa backend başlatıldığında oluşturulmalı
```

### API Endpoint'ini Manuel Test Et

```bash
# Health check
curl https://api.hostingpoint.net/health

# Login endpoint'ini test et (500 hatası görmek için)
curl -X POST https://api.hostingpoint.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 📋 Kontrol Listesi

- [ ] `.env` dosyası var ve doğru ayarlanmış
- [ ] `JWT_SECRET` environment variable set edilmiş
- [ ] `DB_PATH` environment variable set edilmiş
- [ ] `backend/database` dizini oluşturulmuş
- [ ] `backend/logs` dizini oluşturulmuş
- [ ] Docker compose güncellenmiş ve container'lar yeniden başlatılmış
- [ ] Backend loglarında hata yok
- [ ] Veritabanı dosyası oluşturulmuş (`backend/database/database.sqlite`)
- [ ] Health check endpoint çalışıyor (`/health`)

---

## 🆘 Hala Çalışmıyorsa

### Tüm Logları Topla

```bash
cd ~/HostingPoint
docker compose logs backend > backend-logs-$(date +%Y%m%d-%H%M%S).txt
cat backend-logs-*.txt
```

### Backend'i Sıfırdan Build Et

```bash
# Container'ı durdur ve sil
docker compose down

# Image'ı sil
docker rmi hostingpoint-backend 2>/dev/null || true

# Yeniden build et
docker compose build --no-cache backend

# Başlat
docker compose up -d backend

# Logları takip et
docker compose logs -f backend
```

### Container İçinde Manuel Test

```bash
# Container'a gir
docker exec -it vibehost-backend sh

# İçeride Node.js ile test et
cd /app
node server.js
```

---

## ✅ Başarı Kontrolü

Login çalışıyorsa:
- `https://api.hostingpoint.net/api/auth/login` → 400/401 döndürmeli (500 değil)
- Backend loglarında hata yok
- Veritabanı dosyası oluşturulmuş
- Health check çalışıyor

---

## 📝 Notlar

- **infragrid.v.network** hatası login sorunundan bağımsızdır. Bu muhtemelen başka bir servis çağrısıdır ve login'i engellemez.
- 500 hatası genellikle backend'de bir exception olduğunu gösterir. Logları kontrol edin.
- Veritabanı dosyası ilk başlatmada otomatik oluşturulur. Eğer oluşmamışsa, `User.init()` çağrısı başarısız olmuş olabilir.

