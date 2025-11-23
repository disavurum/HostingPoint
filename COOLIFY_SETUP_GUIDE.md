# Coolify Entegrasyonu Kurulum Rehberi

## 🎯 Genel Bakış

HostingPoint artık Coolify ile entegre çalışıyor. Her müşteri için otomatik olarak Coolify'da proje oluşturulur ve Discourse forum kurulur.

---

## 📋 Yapılması Gerekenler

### 1. Coolify Kurulumu

Coolify'ı sunucunuza kurun (eğer henüz kurulu değilse):

```bash
# Coolify kurulum script'i
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Detaylı kurulum: [Coolify Dokümantasyonu](https://coolify.io/docs)

### 2. Coolify API Key Oluşturma

1. Coolify Dashboard'a giriş yapın
2. **Settings** → **API Tokens** bölümüne gidin
3. **Create New Token** butonuna tıklayın
4. Token'a bir isim verin (örn: "HostingPoint Integration")
5. **Permissions:** Tüm izinleri verin (Projects, Applications, Deployments)
6. Token'ı kopyalayın ve güvenli bir yere kaydedin

### 3. Server ID'yi Bulma

1. Coolify Dashboard'da **Servers** sekmesine gidin
2. Kullanmak istediğiniz server'ı seçin
3. URL'den veya server detaylarından **Server ID**'yi bulun
   - Genellikle URL'de görünür: `/servers/1` → Server ID: `1`

### 4. Environment Variables Ayarlama

Backend service'inize aşağıdaki environment variable'ları ekleyin:

#### Coolify Entegrasyonu İçin:

```env
# Coolify Entegrasyonu
USE_COOLIFY=true
COOLIFY_URL=http://coolify:8000
COOLIFY_API_KEY=your-api-key-here
COOLIFY_SERVER_ID=1
```

**Açıklamalar:**
- `USE_COOLIFY`: Coolify kullanımını etkinleştirir (`true` veya `1`)
- `COOLIFY_URL`: Coolify API URL'i
  - Aynı sunucuda: `http://coolify:8000` veya `http://localhost:8000`
  - Farklı sunucuda: `https://coolify.yourdomain.com`
- `COOLIFY_API_KEY`: Coolify'dan aldığınız API token
- `COOLIFY_SERVER_ID`: Coolify'da kullanmak istediğiniz server'ın ID'si

#### Mevcut Ayarlar (Değişmeden):

```env
NODE_ENV=production
PORT=3000
DOMAIN=hostingpoint.net
JWT_SECRET=your-secret-key
DB_PATH=/app/data/database.sqlite
```

### 5. Coolify'da Network Yapılandırması

Coolify ve Backend'in aynı Docker network'ünde olması gerekir:

**Seçenek 1: Coolify'ı Backend ile Aynı Network'te Çalıştır**

```yaml
# docker-compose.yml
services:
  backend:
    networks:
      - coolify
  
  coolify:
    networks:
      - coolify

networks:
  coolify:
    external: true
```

**Seçenek 2: Farklı Sunucularda**

Eğer Coolify farklı bir sunucudaysa:
- `COOLIFY_URL` değerini public URL olarak ayarlayın
- Firewall'da 8000 portunu açın (veya HTTPS kullanın)

### 6. Database Migration

Backend başlatıldığında otomatik olarak:
- `forums` tablosuna `coolify_project_id` kolonu eklenir
- `forums` tablosuna `coolify_application_id` kolonu eklenir

Manuel migration gerekmez.

### 7. Test Etme

1. Backend'i restart edin
2. Dashboard'dan yeni bir forum kurun
3. Coolify Dashboard'da yeni projenin oluşturulduğunu kontrol edin
4. Forum'un deploy edildiğini kontrol edin

---

## 🔧 Coolify URL Yapılandırması

### Senaryo 1: Coolify ve Backend Aynı Sunucuda

```env
COOLIFY_URL=http://coolify:8000
```

Veya Docker network kullanıyorsanız:

```env
COOLIFY_URL=http://coolify-container-name:8000
```

### Senaryo 2: Coolify Farklı Sunucuda

```env
COOLIFY_URL=https://coolify.yourdomain.com
```

**Önemli:** HTTPS kullanıyorsanız, SSL sertifikasının geçerli olduğundan emin olun.

### Senaryo 3: Localhost (Development)

```env
COOLIFY_URL=http://localhost:8000
```

---

## 📝 Coolify API Endpoint'leri

HostingPoint şu Coolify API endpoint'lerini kullanır:

- `POST /api/v1/projects` - Proje oluşturma
- `POST /api/v1/projects/{id}/applications` - Uygulama oluşturma
- `POST /api/v1/projects/{id}/applications/{appId}/deploy` - Deployment başlatma
- `GET /api/v1/projects/{id}/applications/{appId}` - Uygulama durumu
- `DELETE /api/v1/projects/{id}/applications/{appId}` - Uygulama silme
- `DELETE /api/v1/projects/{id}` - Proje silme

---

## ✅ Kontrol Listesi

Kurulumdan sonra kontrol edin:

- [ ] Coolify çalışıyor mu? (`http://coolify-url`)
- [ ] API key oluşturuldu mu?
- [ ] Server ID doğru mu?
- [ ] Environment variables ayarlandı mı?
- [ ] Backend restart edildi mi?
- [ ] Test forum kurulumu başarılı mı?
- [ ] Coolify Dashboard'da proje görünüyor mu?
- [ ] SSL sertifikası otomatik oluşturuluyor mu?

---

## 🐛 Sorun Giderme

### Sorun: "Coolify API key not configured"

**Çözüm:**
- `COOLIFY_API_KEY` environment variable'ının ayarlandığından emin olun
- Backend'i restart edin

### Sorun: "Failed to create Coolify project"

**Çözüm:**
- Coolify URL'inin doğru olduğundan emin olun
- API key'in geçerli olduğundan emin olun
- Coolify'ın çalıştığından emin olun
- Network bağlantısını kontrol edin

### Sorun: "Server ID not found"

**Çözüm:**
- `COOLIFY_SERVER_ID` değerinin doğru olduğundan emin olun
- Coolify Dashboard'da server ID'yi kontrol edin

### Sorun: DNS/SSL çalışmıyor

**Çözüm:**
- Coolify'ın Let's Encrypt entegrasyonunun aktif olduğundan emin olun
- DNS kayıtlarının doğru olduğundan emin olun
- DNS yayılımını bekleyin (1-48 saat)

---

## 🔄 Eski Sistemden Geçiş

Eğer mevcut forumlarınız varsa:

1. **Yeni forumlar:** Otomatik olarak Coolify'da oluşturulur
2. **Eski forumlar:** Mevcut Docker Compose sistemi ile çalışmaya devam eder
3. **Geçiş:** İsterseniz eski forumları manuel olarak Coolify'a taşıyabilirsiniz

**Not:** `USE_COOLIFY=false` yaparak eski sisteme geri dönebilirsiniz.

---

## 📞 Destek

Sorunlarınız için:
- Coolify Dokümantasyonu: [coolify.io/docs](https://coolify.io/docs)
- HostingPoint Support: support@hostingpoint.net

---

**Başarılar! 🚀**

