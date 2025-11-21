# Coolify Port Hatası - Çözüm

## 🚨 Hata: "port is already allocated"

**Sorun:** Coolify, eski `docker-compose.yml` dosyasını kullanıyor. Bu dosyada Traefik var ve port 80/443'ü kullanmaya çalışıyor. Ama bu portlar zaten Coolify tarafından kullanılıyor.

---

## ✅ Çözüm

### Adım 1: Coolify'de Docker Compose File Ayarlarını Kontrol Et

1. **Coolify Dashboard:**
   - Application → **Settings**
   - **Build & Deploy** bölümüne gidin

2. **Docker Compose File alanını kontrol edin:**
   - Şu anda muhtemelen: `docker-compose.yml` yazıyor
   - **Değiştirin:**
     - Backend için: `docker-compose.backend.yml`
     - Frontend için: `docker-compose.frontend.yml`

3. **Save** butonuna tıklayın

4. **Redeploy** yapın

---

## 🔍 Kontrol

### Backend Application

- **Docker Compose File:** `docker-compose.backend.yml` ✅
- **Domain:** `api.hostingpoint.net`
- Traefik yok ✅

### Frontend Application

- **Docker Compose File:** `docker-compose.frontend.yml` ✅
- **Domain:** `hostingpoint.net`
- Traefik yok ✅

---

## ⚠️ Önemli

**Coolify kendi reverse proxy'sini kullanır!**

- Traefik'e gerek yok
- Port mapping'e gerek yok
- Coolify otomatik olarak domain ve SSL yönetir

**Bu yüzden:**
- `docker-compose.yml` ❌ (Traefik içeriyor)
- `docker-compose.backend.yml` ✅ (Sadece backend)
- `docker-compose.frontend.yml` ✅ (Sadece frontend)

---

## 📝 Adım Adım

### Backend Application Düzeltme

1. Coolify Dashboard → **backend** application
2. **Settings** → **Build & Deploy**
3. **Docker Compose File:** `docker-compose.backend.yml` yazın
4. **Save**
5. **Deployments** → **Redeploy**

### Frontend Application Düzeltme

1. Coolify Dashboard → **frontend** application
2. **Settings** → **Build & Deploy**
3. **Docker Compose File:** `docker-compose.frontend.yml` yazın
4. **Save**
5. **Deployments** → **Redeploy**

---

## ✅ Başarı Kontrolü

Deploy başarılı olduğunda:

- ✅ Port hatası olmamalı
- ✅ Container'lar çalışıyor olmalı
- ✅ Domain'ler çalışıyor olmalı

---

## 🆘 Hala Çalışmıyorsa

### Eski Container'ları Temizle

Coolify otomatik olarak temizler ama manuel temizlemek isterseniz:

```bash
# EC2 sunucusunda (gerekirse)
docker ps -a | grep uwows8soc0go0ow4o48gccow
docker stop <container-id>
docker rm <container-id>
```

Ama genellikle Coolify bunu otomatik yapar.

---

## 💡 İpucu

Her application için doğru docker-compose dosyasını kullandığınızdan emin olun:

- **Backend** → `docker-compose.backend.yml`
- **Frontend** → `docker-compose.frontend.yml`

Bu dosyalar Traefik içermez ve Coolify ile uyumludur! 🚀

