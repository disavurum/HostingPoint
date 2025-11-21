# API URL Sorunu - localhost:3000 Hatası

## 🚨 Sorun

Frontend hala `localhost:3000`'e istek atıyor. Bu, frontend'in yeniden build edilmediği veya cache sorunu olduğu anlamına gelir.

## ✅ Çözüm

### Adım 1: EC2'de Frontend'i Yeniden Build Et

```bash
cd ~/HostingPoint

# Projeyi güncelle
git pull

# Frontend container'ını durdur
docker compose stop frontend

# Frontend'i yeniden build et (cache olmadan)
docker compose build --no-cache frontend

# Frontend'i başlat
docker compose up -d frontend

# Logları kontrol et
docker compose logs -f frontend
```

### Adım 2: Tarayıcı Cache'ini Temizle

**Chrome/Edge:**
1. `Ctrl + Shift + Delete`
2. "Cached images and files" seçin
3. "Clear data" tıklayın
4. Sayfayı yenileyin: `Ctrl + F5` (hard refresh)

**Veya Gizli Modda Test:**
- `Ctrl + Shift + N` (Chrome)
- `Ctrl + Shift + P` (Firefox)
- Gizli modda `https://hostingpoint.net` açın

### Adım 3: Backend'in Çalıştığını Kontrol Et

```bash
cd ~/HostingPoint

# Container durumunu kontrol et
docker compose ps

# Backend loglarını kontrol et
docker compose logs backend | tail -50

# Backend çalışmıyorsa başlat
docker compose up -d backend
```

### Adım 4: API URL'i Manuel Kontrol Et

Tarayıcı konsolunda (F12) şunu çalıştırın:

```javascript
// API URL'i kontrol et
console.log(window.location.hostname);
console.log(window.location.protocol);
console.log(`${window.location.protocol}//api.${window.location.hostname}`);
```

**Beklenen çıktı:**
- `hostingpoint.net`
- `https:`
- `https://api.hostingpoint.net`

---

## 🔍 Sorun Giderme

### Frontend Hala localhost:3000 Kullanıyorsa

**1. Frontend build loglarını kontrol et:**
```bash
docker compose logs frontend | grep -i "VITE_API_URL\|VITE_DOMAIN"
```

**2. Frontend container'ına gir ve kontrol et:**
```bash
docker exec -it vibehost-frontend sh
ls -la /usr/share/nginx/html/
cat /usr/share/nginx/html/index.html | grep -i "api"
```

**3. Frontend'i tamamen yeniden build et:**
```bash
cd ~/HostingPoint
docker compose down frontend
docker rmi hostingpoint-frontend  # veya docker images ile image adını bulun
docker compose build --no-cache frontend
docker compose up -d frontend
```

### 401 Unauthorized Hatası

Bu, backend'in çalıştığı ama authentication token'ının olmadığı anlamına gelir.

**Çözüm:**
1. Login sayfasına gidin: `https://hostingpoint.net/login`
2. Giriş yapın veya yeni hesap oluşturun
3. Token localStorage'a kaydedilecek
4. Dashboard'a gidin

**Token kontrolü (tarayıcı konsolunda):**
```javascript
console.log(localStorage.getItem('token'));
console.log(localStorage.getItem('user'));
```

Eğer `null` ise, login yapmanız gerekiyor.

---

## 📋 Kontrol Listesi

- [ ] EC2'de `git pull` yaptım
- [ ] Frontend'i `--no-cache` ile yeniden build ettim
- [ ] Tarayıcı cache'ini temizledim
- [ ] Hard refresh yaptım (`Ctrl + F5`)
- [ ] Backend container'ı çalışıyor
- [ ] Login yaptım ve token aldım
- [ ] API URL `api.hostingpoint.net` olarak görünüyor

---

## ⚡ Hızlı Düzeltme (Tüm Sistemi Yeniden Başlat)

```bash
cd ~/HostingPoint

# Tüm container'ları durdur
docker compose down

# Frontend'i yeniden build et
docker compose build --no-cache frontend

# Tüm container'ları başlat
docker compose up -d

# Logları takip et
docker compose logs -f
```

---

## 🆘 Hala Çalışmıyorsa

**1. Frontend build sırasında environment variable'ları kontrol et:**

`docker-compose.yml` dosyasında frontend build args'ı kontrol edin:

```yaml
frontend:
  build:
    args:
      - VITE_DOMAIN=${DOMAIN:-vibehost.io}
```

**2. .env dosyasını kontrol et:**
```bash
cat .env | grep DOMAIN
```

**3. Network isteklerini kontrol et (tarayıcı F12 → Network):**
- Hangi URL'e istek atılıyor?
- `localhost:3000` mi yoksa `api.hostingpoint.net` mi?

**4. Frontend source code'u kontrol et:**
```bash
docker exec -it vibehost-frontend sh
cat /usr/share/nginx/html/assets/*.js | grep -i "localhost\|api\."
```

---

## ✅ Başarı Kontrolü

Site çalışıyorsa:
- Network tab'ında (F12) API istekleri `api.hostingpoint.net`'e gitmeli
- `localhost:3000` istekleri olmamalı
- Login/Register çalışmalı
- Dashboard'a erişilebilmeli

