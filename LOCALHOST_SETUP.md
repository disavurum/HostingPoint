# Localhost Kurulum Rehberi

## 🚀 Backend ve Frontend'i Localhost'ta Çalıştırma

### Sorun: ERR_CONNECTION_REFUSED

Bu hata, backend'in çalışmadığını gösterir. Aşağıdaki adımları izleyin:

## 1. Backend'i Başlatma

### Terminal 1: Backend

```bash
cd backend
npm install
npm start
```

Backend `http://localhost:3000` adresinde çalışacak.

**Kontrol:**
- Tarayıcıda `http://localhost:3000/health` adresine gidin
- `{"status":"ok"}` yanıtı almalısınız

## 2. Frontend'i Başlatma

### Terminal 2: Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend genellikle `http://localhost:5173` veya `http://localhost:3000` adresinde çalışacak (Vite varsayılan portu).

## 3. Environment Variables

### Backend (.env dosyası)

`backend/.env` dosyası oluşturun:

```env
NODE_ENV=development
PORT=3000
DOMAIN=localhost
JWT_SECRET=your-secret-key-here-change-this
JWT_EXPIRES_IN=30d
DB_PATH=./data/database.sqlite
BCRYPT_ROUNDS=10
LOG_LEVEL=debug
```

### Frontend (.env dosyası)

`frontend/.env` dosyası oluşturun:

```env
VITE_DOMAIN=localhost
VITE_API_URL=http://localhost:3000
```

## 4. Docker Socket (Windows için)

Windows'ta Docker Desktop kullanıyorsanız, Docker socket path'i farklı olabilir:

**Windows'ta Docker Desktop:**
- Docker socket genellikle `//./pipe/docker_engine` path'inde
- Ancak WSL2 kullanıyorsanız `/var/run/docker.sock` kullanılabilir

**Test:**
```bash
# Docker çalışıyor mu?
docker ps

# Docker socket var mı?
# Windows'ta genellikle Docker Desktop otomatik yönetir
```

## 5. Sorun Giderme

### Backend başlamıyor

1. **Port kullanımda:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :3000
   ```

2. **Database hatası:**
   ```bash
   # Backend/data dizinini kontrol edin
   ls backend/data
   
   # Database dosyası yoksa otomatik oluşturulur
   ```

3. **Dependencies eksik:**
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

### Frontend başlamıyor

1. **Port kullanımda:**
   - Vite farklı bir port seçecektir (örn: 5174)
   - Terminal çıktısına bakın

2. **API bağlantı hatası:**
   - Backend'in çalıştığından emin olun
   - `frontend/.env` dosyasında `VITE_API_URL` doğru mu kontrol edin

### Docker Socket Hatası

**Windows'ta:**
- Docker Desktop'ın çalıştığından emin olun
- WSL2 kullanıyorsanız, WSL2 içinde Docker kurulu olmalı

**Linux/Mac'te:**
```bash
# Docker socket kontrolü
ls -la /var/run/docker.sock

# İzin kontrolü
sudo chmod 666 /var/run/docker.sock
```

## 6. Hızlı Test

### 1. Backend Health Check
```bash
curl http://localhost:3000/health
```

**Beklenen yanıt:**
```json
{"status":"ok","timestamp":"...","service":"hostingpoint-backend","version":"1.0.0"}
```

### 2. Frontend API Bağlantısı
- Tarayıcıda `http://localhost:5173` (veya Vite'ın gösterdiği port) açın
- Developer Console'u açın (F12)
- Network sekmesinde API isteklerini kontrol edin

### 3. Login Test
- Frontend'de login sayfasına gidin
- Test kullanıcısı oluşturun
- Login olmayı deneyin

## 7. Development Scripts

### Backend
```bash
# Development mode (nodemon ile otomatik restart)
npm run dev

# Production mode
npm start
```

### Frontend
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 8. Yaygın Hatalar ve Çözümleri

### "Cannot find module"
```bash
# Tüm dependencies'i yeniden yükle
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

### "Port already in use"
```bash
# Port'u değiştirin veya kullanan process'i durdurun
# Backend için: PORT=3001 npm start
# Frontend için: Vite otomatik olarak farklı port seçer
```

### "Docker socket not found"
- Docker Desktop'ın çalıştığından emin olun
- Windows'ta WSL2 kullanıyorsanız, WSL2 içinde Docker kurulu olmalı
- Linux'ta Docker servisinin çalıştığından emin olun: `sudo systemctl status docker`

### "ERR_CONNECTION_REFUSED"
- Backend'in çalıştığından emin olun (`http://localhost:3000/health`)
- Frontend'deki API URL'in doğru olduğundan emin olun
- CORS hatası olabilir - backend'de CORS ayarlarını kontrol edin

---

**Başarılar! 🚀**

