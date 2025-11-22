# Coolify Redeploy Rehberi - HostingPoint

## 🚀 Redeploy Öncesi Kontrol Listesi

### 1. Environment Variables (ÖNEMLİ!)

Coolify'da aşağıdaki environment variable'ları kontrol edin/güncelleyin:

#### Backend Service için:
```
NODE_ENV=production
PORT=3000
DOMAIN=hostingpoint.net (veya kendi domain'iniz)
JWT_SECRET=your-strong-secret-key-here
JWT_EXPIRES_IN=30d
DB_PATH=/app/data/database.sqlite
BCRYPT_ROUNDS=10
LOG_LEVEL=info

# Email ayarları (opsiyonel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@hostingpoint.net

# Stripe (opsiyonel)
STRIPE_SECRET_KEY=sk_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Frontend Service için:
```
VITE_DOMAIN=hostingpoint.net (veya kendi domain'iniz)
VITE_API_URL=https://api.hostingpoint.net (veya kendi API URL'iniz)
```

### 2. Volume Mounts (KRİTİK!)

Backend service'inde şu volume'lar mount edilmiş olmalı:

```
/var/run/docker.sock:/var/run/docker.sock:ro
backend-data:/app/data
```

**ÖNEMLİ:** `/var/run/docker.sock` mount edilmezse, yeni forum kurulumları çalışmaz!

#### Coolify'da Volume Ekleme Adımları:

1. **Coolify Dashboard'a gidin**
   - Service'inizi seçin (Backend)

2. **"Volumes" veya "Storage" sekmesine gidin**
   - Service detay sayfasında "Volumes" veya "Storage" sekmesini bulun

3. **Docker Socket Mount (KRİTİK!):**
   - **Host Path:** `/var/run/docker.sock`
   - **Container Path:** `/var/run/docker.sock`
   - **Read Only:** ✅ (işaretleyin)
   - **Type:** Bind Mount (Host Path)

4. **Data Volume:**
   - **Volume Name:** `backend-data` (veya istediğiniz isim)
   - **Container Path:** `/app/data`
   - **Type:** Named Volume (Coolify otomatik oluşturur)

5. **Customers Directory (Opsiyonel ama önerilir):**
   - **Host Path:** `/data/hostingpoint/customers` (veya istediğiniz path)
   - **Container Path:** `/app/customers`
   - **Type:** Bind Mount
   - **Not:** Bu, forum verilerinin kalıcı olması için önemli

6. **Kaydet ve Redeploy:**
   - Volume'ları ekledikten sonra "Save" butonuna tıklayın
   - Service'i redeploy edin

#### Alternatif: docker-compose.yml ile

Eğer Coolify docker-compose.yml kullanıyorsa, `docker-compose.coolify.yml` dosyasındaki volume tanımlarını kullanabilirsiniz:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
  - backend-data:/app/data
  - ./backend/customers:/app/customers  # Host path'i Coolify'da ayarlayın
```

**Not:** Coolify'da host path'ler genellikle `/data/` altında olur. Örneğin: `/data/coolify/volumes/your-service-name/`

### 3. Database Migration

Yeni değişikliklerle birlikte database şeması güncellendi:
- `users` tablosuna `plan_type` kolonu eklendi (varsayılan: 'starter')
- `forums` tablosuna `custom_domain` kolonu eklendi

**Bu migration'lar otomatik olarak çalışacak** - backend başlarken tabloları kontrol edip eksik kolonları ekleyecek.

### 4. Yeni Servisler

Yeni eklenen servisler:
- `LimitService.js` - Plan limit kontrolü için
- `CustomDomainGuide.jsx` - Frontend'de özel domain rehberi

Bu dosyalar otomatik olarak build'e dahil edilecek.

### 5. Build Commands

Coolify'da build command'ları kontrol edin:

#### Backend:
```
npm install
```
(Backend'de build gerekmez, direkt çalışır)

#### Frontend:
```
npm install
npm run build
```

### 6. Port Ayarları

- **Backend:** Port 3000 (internal)
- **Frontend:** Port 80 (internal)

Coolify otomatik olarak reverse proxy yapılandırması yapacak.

### 7. Redeploy Adımları

1. **Git'ten son değişiklikleri çekin:**
   ```bash
   git pull origin master
   ```

2. **Coolify'da Redeploy:**
   - Coolify dashboard'a gidin
   - Backend service'ini seçin
   - "Redeploy" butonuna tıklayın
   - Aynı işlemi Frontend için de yapın

3. **Deployment sırası:**
   - Önce Backend'i redeploy edin
   - Backend başarıyla çalıştıktan sonra Frontend'i redeploy edin

4. **Kontrol:**
   - Backend health check: `https://api.yourdomain.com/health`
   - Frontend: `https://yourdomain.com`

### 8. Post-Deployment Kontrolleri

#### Database Migration Kontrolü:
```bash
# Backend container'a bağlanın
docker exec -it hostingpoint-backend sh

# SQLite database'i kontrol edin
sqlite3 /app/data/database.sqlite
.schema users
.schema forums
```

Kontrol edilecekler:
- `users` tablosunda `plan_type` kolonu var mı?
- `forums` tablosunda `custom_domain` kolonu var mı?

#### Yeni Özellikler Testi:
1. **Auto-subdomain:** Yeni forum kurarken otomatik subdomain oluşturuluyor mu?
2. **Custom domain:** Özel domain ekleme seçeneği görünüyor mu?
3. **Limit kontrolü:** Dashboard'da kullanım özeti görünüyor mu?
4. **Pricing:** Fiyatlar 600 TL olarak görünüyor mu?

### 9. Olası Sorunlar ve Çözümleri

#### Sorun: "Plan limitinize ulaştınız" hatası
**Çözüm:** 
- Kullanıcıların `plan_type` değeri kontrol edilmeli
- Varsayılan olarak 'starter' atanmalı
- Database'de manuel kontrol:
  ```sql
  UPDATE users SET plan_type = 'starter' WHERE plan_type IS NULL;
  ```

#### Sorun: Disk kullanımı gösterilmiyor
**Çözüm:**
- Backend container'da Docker socket mount kontrolü
- LimitService'in çalıştığından emin olun
- Logları kontrol edin: `docker logs hostingpoint-backend`

#### Sorun: Custom domain eklenemiyor
**Çözüm:**
- `forums` tablosunda `custom_domain` kolonu var mı kontrol edin
- Backend loglarını kontrol edin

#### Sorun: Localhost'ta çalışmıyor
**Çözüm:**
- Localhost için özel yapılandırma gerekli
- Production'da localhost kullanmayın, gerçek domain kullanın

### 10. Rollback (Gerekirse)

Eğer bir sorun olursa:

```bash
# Önceki commit'e dön
git checkout <previous-commit-hash>
git push origin master --force

# Coolify'da tekrar redeploy
```

### 11. Önemli Notlar

⚠️ **DİKKAT:**
- Database migration'lar otomatik çalışır, ancak mevcut veriler korunur
- Yeni kullanıcılar otomatik olarak 'starter' planına atanır
- Mevcut kullanıcılar için `plan_type` NULL ise 'starter' olarak güncellenir
- Disk kullanımı ölçümü için Docker socket erişimi gerekli
- Limit kontrolü aktif - kullanıcılar limit aştığında yeni forum kuramaz

### 12. Test Checklist

Redeploy sonrası test edin:
- [ ] Frontend açılıyor mu?
- [ ] Backend API çalışıyor mu? (`/health` endpoint)
- [ ] Login/Register çalışıyor mu?
- [ ] Dashboard açılıyor mu?
- [ ] Yeni forum kurulumu çalışıyor mu?
- [ ] Auto-subdomain oluşturuluyor mu?
- [ ] Custom domain seçeneği görünüyor mu?
- [ ] Kullanım özeti dashboard'da görünüyor mu?
- [ ] Pricing tablosunda fiyatlar doğru mu? (600 TL)
- [ ] Currency switcher çalışıyor mu?

### 13. Monitoring

Deploy sonrası logları izleyin:
```bash
# Backend logs
docker logs -f hostingpoint-backend

# Frontend logs  
docker logs -f hostingpoint-frontend
```

Hata görürseniz, logları kontrol edip gerekirse rollback yapın.

---

## 🎯 Hızlı Redeploy Komutu

Coolify CLI kullanıyorsanız:
```bash
coolify redeploy --service backend
coolify redeploy --service frontend
```

Veya Coolify web UI'dan:
1. Service seçin
2. "Redeploy" butonuna tıklayın
3. "Force rebuild" seçeneğini işaretleyin (gerekirse)

---

**Başarılar! 🚀**

