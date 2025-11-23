# Coolify Build Uyarıları Çözümü

## ⚠️ Uyarılar

Deployment loglarında şu uyarılar görülebilir:

1. **Node.js 18 EOL (End of Life)**
2. **NODE_ENV=3000 yanlış değer**
3. **Build-time environment variable uyarıları**

---

## 🔧 Çözümler

### 1. Node.js Versiyonunu Güncelleyin

**Environment Variable Ekle:**
```env
NIXPACKS_NODE_VERSION=22
```

**Coolify'da:**
- **Key:** `NIXPACKS_NODE_VERSION`
- **Value:** `22`
- **Type:** Environment Variable
- **⚠️ Build-time:** İşaretleyin (build sırasında kullanılır)

### 2. NODE_ENV Değerini Düzeltin

**Yanlış:**
```env
NODE_ENV=3000  # ❌ Bu bir port numarası!
```

**Doğru:**
```env
NODE_ENV=production  # ✅ Production için
# veya
NODE_ENV=development  # ✅ Development için
```

**Coolify'da:**
- **Key:** `NODE_ENV`
- **Value:** `production`
- **Type:** Environment Variable
- **⚠️ Runtime Only:** İşaretleyin (build-time'da kullanılmasın)

### 3. Build-time vs Runtime Environment Variables

**Build-time (Build sırasında kullanılır):**
- `NIXPACKS_NODE_VERSION=22`
- Build için gerekli olan değişkenler

**Runtime Only (Sadece çalışma zamanında):**
- `NODE_ENV=production`
- `PORT=3000`
- `COOLIFY_URL=...`
- `COOLIFY_API_KEY=...`
- Diğer runtime değişkenleri

**Coolify'da Ayarlama:**
1. Environment Variable eklerken
2. **"Available at Buildtime"** checkbox'ını kontrol edin:
   - ✅ Build-time için işaretleyin
   - ❌ Runtime-only için işaretlemeyin

---

## 📝 Önerilen Environment Variables

### Backend Service için:

```env
# Coolify Integration
USE_COOLIFY=true
COOLIFY_URL=http://coolify:8000
COOLIFY_API_KEY=VzUwe69V6tiwLebLYIPE7U4jkLRIST0K8bppa1EV1f260694
COOLIFY_SERVER_ID=1

# Node.js Configuration (Build-time)
NIXPACKS_NODE_VERSION=22

# Application Configuration (Runtime-only)
NODE_ENV=production
PORT=3000
DOMAIN=hostingpoint.net
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=30d
DB_PATH=/app/data/database.sqlite
BCRYPT_ROUNDS=10
LOG_LEVEL=info
```

---

## 🔄 Adım Adım Düzeltme

### 1. Coolify Dashboard'a Gidin
- Backend service'inizi seçin

### 2. Environment Variables Sekmesine Gidin
- **"Environment Variables"** veya **"Env"** sekmesine gidin

### 3. NIXPACKS_NODE_VERSION Ekleyin
- **Key:** `NIXPACKS_NODE_VERSION`
- **Value:** `22`
- **Available at Buildtime:** ✅ İşaretleyin

### 4. NODE_ENV'i Düzeltin
- Mevcut `NODE_ENV` variable'ını bulun
- **Value:** `production` olarak değiştirin
- **Available at Buildtime:** ❌ İşaretlemeyin (Runtime-only)

### 5. PORT Kontrol Edin
- `PORT=3000` olduğundan emin olun
- **Available at Buildtime:** ❌ İşaretlemeyin (Runtime-only)

### 6. Kaydet ve Redeploy
- Tüm değişiklikleri kaydedin
- Service'i **Redeploy** edin

---

## ✅ Kontrol

Redeploy sonrası loglarda şunları görmemelisiniz:

- ❌ "NIXPACKS_NODE_VERSION not set. Nixpacks will use Node.js 18 by default"
- ❌ "Build-time environment variable warning: NODE_ENV=3000"

Bunun yerine görmelisiniz:

- ✅ "Using Node.js 22"
- ✅ Build başarılı
- ✅ Deployment başarılı

---

## 🐛 Sorun Giderme

### Hala Node.js 18 kullanılıyor
- `NIXPACKS_NODE_VERSION=22` eklendiğinden emin olun
- **Available at Buildtime** işaretlendiğinden emin olun
- Service'i redeploy edin

### NODE_ENV hala yanlış
- `NODE_ENV=production` olduğundan emin olun
- `NODE_ENV=3000` gibi yanlış değerler olmadığından emin olun
- **Available at Buildtime** işaretlenmemiş olduğundan emin olun

### Build hala uyarı veriyor
- Tüm environment variable'ları kontrol edin
- **Available at Buildtime** ayarlarını kontrol edin
- Service'i tamamen yeniden deploy edin

---

**Başarılar! 🚀**

