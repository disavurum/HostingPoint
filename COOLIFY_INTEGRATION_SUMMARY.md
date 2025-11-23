# Coolify Entegrasyonu - Özet

## 🎯 Yapılan Değişiklikler

### 1. Yeni Dosyalar
- ✅ `backend/services/CoolifyService.js` - Coolify API entegrasyonu
- ✅ `COOLIFY_SETUP_GUIDE.md` - Detaylı kurulum rehberi
- ✅ `COOLIFY_SETUP_CHECKLIST.md` - Yapılacaklar listesi
- ✅ `DNS_SETUP_MANUAL.md` - DNS yapılandırma rehberi

### 2. Güncellenen Dosyalar
- ✅ `backend/models/Forum.js` - Coolify ID'leri için kolonlar eklendi
- ✅ `backend/services/DeployService.js` - Coolify desteği eklendi
- ✅ `backend/server.js` - Deploy ve delete endpoint'leri güncellendi
- ✅ `backend/package.json` - axios dependency eklendi

### 3. Özellikler
- ✅ Her müşteri için otomatik Coolify projesi oluşturma
- ✅ Discourse forum otomatik kurulumu
- ✅ Subdomain ve custom domain desteği
- ✅ Otomatik SSL sertifikası (Let's Encrypt)
- ✅ Forum silme işlemi Coolify'dan da yapılıyor

---

## 📋 Yapmanız Gerekenler

### Adım 1: Coolify Kurulumu
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### Adım 2: API Key Oluşturma
1. Coolify Dashboard → Settings → API Tokens
2. Yeni token oluşturun
3. Token'ı kopyalayın

### Adım 3: Environment Variables
Backend service'inize ekleyin:

```env
USE_COOLIFY=true
COOLIFY_URL=http://coolify:8000
COOLIFY_API_KEY=your-api-key-here
COOLIFY_SERVER_ID=1
```

### Adım 4: Backend Restart
```bash
# Backend container'ı restart edin
docker restart hostingpoint-backend
```

### Adım 5: Test
1. Dashboard'dan yeni forum kurun
2. Coolify Dashboard'da projenin oluştuğunu kontrol edin
3. Forum'un deploy edildiğini kontrol edin

---

## 📚 Dokümantasyon

- **Kurulum Rehberi:** `COOLIFY_SETUP_GUIDE.md`
- **Yapılacaklar Listesi:** `COOLIFY_SETUP_CHECKLIST.md`
- **DNS Rehberi:** `DNS_SETUP_MANUAL.md`

---

## 🔄 Eski Sistemden Geçiş

- Yeni forumlar otomatik olarak Coolify'da oluşturulur
- Eski forumlar mevcut sistemle çalışmaya devam eder
- `USE_COOLIFY=false` yaparak eski sisteme dönebilirsiniz

---

## ⚙️ Yapılandırma

### Coolify URL Seçenekleri

**Aynı sunucuda:**
```env
COOLIFY_URL=http://coolify:8000
```

**Farklı sunucuda:**
```env
COOLIFY_URL=https://coolify.yourdomain.com
```

**Localhost (development):**
```env
COOLIFY_URL=http://localhost:8000
```

---

## ✅ Kontrol Listesi

Detaylı kontrol listesi için: `COOLIFY_SETUP_CHECKLIST.md`

---

**Başarılar! 🚀**

