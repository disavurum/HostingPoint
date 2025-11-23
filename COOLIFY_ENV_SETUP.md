# Coolify Environment Variables Kurulumu

## 🔑 Sizin Bilgileriniz

- **API Token:** `VzUwe69V6tiwLebLYIPE7U4jkLRIST0K8bppa1EV1f260694`
- **Server ID:** `1`

## 📝 Environment Variables

Backend service'inize (Coolify'da) aşağıdaki environment variable'ları ekleyin:

```env
USE_COOLIFY=true
COOLIFY_URL=http://coolify:8000
COOLIFY_API_KEY=VzUwe69V6tiwLebLYIPE7U4jkLRIST0K8bppa1EV1f260694
COOLIFY_SERVER_ID=1
```

---

## 🚀 Coolify'da Nasıl Eklenir?

### Adım 1: Backend Service'i Açın
1. Coolify Dashboard'a gidin
2. Backend service'inizi seçin (hostingpoint-backend)

### Adım 2: Environment Variables Sekmesine Gidin
1. Service detay sayfasında **"Environment Variables"** veya **"Env"** sekmesine gidin
2. **"Add Variable"** veya **"+"** butonuna tıklayın

### Adım 3: Her Bir Variable'ı Ekleyin

#### 1. USE_COOLIFY
- **Key:** `USE_COOLIFY`
- **Value:** `true`
- **Type:** Environment Variable

#### 2. COOLIFY_URL
- **Key:** `COOLIFY_URL`
- **Value:** `http://coolify:8000` (veya Coolify'ınızın URL'i)
- **Type:** Environment Variable

**Not:** Eğer Coolify farklı bir sunucudaysa:
- `https://coolify.yourdomain.com` (HTTPS)
- `http://coolify-container-name:8000` (Docker network içinde)

#### 3. COOLIFY_API_KEY
- **Key:** `COOLIFY_API_KEY`
- **Value:** `VzUwe69V6tiwLebLYIPE7U4jkLRIST0K8bppa1EV1f260694`
- **Type:** Environment Variable
- **⚠️ Secret:** İşaretleyin (güvenlik için)

#### 4. COOLIFY_SERVER_ID
- **Key:** `COOLIFY_SERVER_ID`
- **Value:** `1`
- **Type:** Environment Variable

### Adım 4: Kaydet ve Redeploy
1. Tüm variable'ları ekledikten sonra **"Save"** butonuna tıklayın
2. Service'i **Redeploy** edin

---

## ✅ Kontrol

Redeploy sonrası:

1. **Backend loglarını kontrol edin:**
   ```bash
   docker logs hostingpoint-backend
   ```
   
   Şu mesajları görmemelisiniz:
   - ❌ "Coolify API key not configured"
   - ✅ "Coolify project created" (forum kurarken)

2. **Test Forum Kurun:**
   - Dashboard'dan yeni bir forum kurun
   - Coolify Dashboard'da projenin oluşturulduğunu kontrol edin

---

## 🔒 Güvenlik Notları

⚠️ **ÖNEMLİ:**
- API token'ı asla public repository'lere commit etmeyin
- Environment variable olarak saklayın
- Coolify'da "Secret" olarak işaretleyin
- Token'ı düzenli olarak yenileyin

---

## 🐛 Sorun Giderme

### "Coolify API key not configured" hatası
- `COOLIFY_API_KEY` variable'ının doğru eklendiğinden emin olun
- Backend'i restart edin

### "Failed to create Coolify project" hatası
- `COOLIFY_URL` değerinin doğru olduğundan emin olun
- Coolify'ın çalıştığından emin olun
- API token'ın geçerli olduğundan emin olun

### "Server ID not found" hatası
- `COOLIFY_SERVER_ID=1` olduğundan emin olun
- Coolify Dashboard'da server ID'yi kontrol edin

---

**Başarılar! 🚀**

