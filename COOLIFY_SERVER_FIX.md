# Coolify "No Available Server" Hatası Çözümü

## ❌ Hata: "No available server" veya "Server bulunamadı"

Bu hata, Coolify'da belirtilen server ID'nin mevcut olmadığını veya server'ın erişilebilir olmadığını gösterir.

---

## 🔍 Sorun Tespiti

### 1. Server ID'yi Kontrol Edin

Backend environment variable'larını kontrol edin:

```bash
docker exec hostingpoint-backend env | grep COOLIFY_SERVER_ID
```

Şu anda: `COOLIFY_SERVER_ID=1`

### 2. Coolify Dashboard'dan Server ID'lerini Bulun

1. Coolify Dashboard'a gidin
2. **Servers** sekmesine gidin
3. Her server'ın yanındaki ID'yi not edin

### 3. API ile Server'ları Listele

```bash
# Backend container'ından
docker exec -it hostingpoint-backend sh

# API ile server'ları listele
curl http://coolify:8000/api/v1/servers \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 🔧 Çözümler

### Çözüm 1: Doğru Server ID'yi Kullanın

Coolify Dashboard'dan doğru server ID'yi bulun ve environment variable'ı güncelleyin:

```env
COOLIFY_SERVER_ID=1
```

Eğer server ID farklıysa (örneğin `2` veya `3`):

```env
COOLIFY_SERVER_ID=2
```

### Çözüm 2: Server'ın Aktif Olduğundan Emin Olun

1. Coolify Dashboard → Servers
2. Server'ın **Active** olduğundan emin olun
3. Server'ın **Connected** olduğundan emin olun

### Çözüm 3: Server'ı Yeniden Bağlayın

Eğer server disconnected görünüyorsa:

1. Coolify Dashboard → Servers
2. Server'ı seçin
3. **Reconnect** veya **Refresh** butonuna tıklayın

---

## 📝 Environment Variable Güncelleme

### Adım 1: Coolify Dashboard'dan Server ID'yi Bulun

1. Coolify Dashboard'a gidin
2. **Servers** sekmesine gidin
3. Server'ın ID'sini not edin (genellikle sayı: 1, 2, 3, vb.)

### Adım 2: Backend Environment Variable'ını Güncelleyin

Coolify Dashboard → Backend Service → Environment Variables:

```env
COOLIFY_SERVER_ID=1
```

**Not:** ID'yi Coolify Dashboard'dan aldığınız değerle değiştirin.

### Adım 3: Backend'i Restart Edin

Environment variable'ı güncelledikten sonra backend'i restart edin.

---

## 🧪 Test

### 1. Server ID'yi Doğrulayın

Backend loglarını kontrol edin:

```bash
docker logs hostingpoint-backend | grep -i "server"
```

Şunları görmelisiniz:
```
CoolifyService initialized: { serverId: 1, ... }
Server ID 1 found in available servers
```

### 2. Forum Kurun

Yeni bir forum kurmayı deneyin. Artık "no available server" hatası almamalısınız.

---

## ⚠️ Yaygın Hatalar

### Hata: "Server ID 1 bulunamadı"
**Sebep:** Server ID yanlış veya server mevcut değil
**Çözüm:** Coolify Dashboard'dan doğru server ID'yi bulun

### Hata: "Server disconnected"
**Sebep:** Server Coolify'a bağlı değil
**Çözüm:** Server'ı Coolify Dashboard'dan reconnect edin

### Hata: "No available server"
**Sebep:** Server ID yanlış veya server aktif değil
**Çözüm:** Server ID'yi kontrol edin ve server'ın aktif olduğundan emin olun

---

## 🔄 Adım Adım Düzeltme

1. **Coolify Dashboard'a gidin**
2. **Servers sekmesine gidin**
3. **Server ID'yi not edin** (örneğin: 1, 2, 3)
4. **Backend environment variable'ını güncelleyin:**
   ```env
   COOLIFY_SERVER_ID=<bulduğunuz-id>
   ```
5. **Backend'i restart edin**
6. **Yeni forum kurmayı deneyin**

---

## 🆘 Hala Çalışmıyorsa

1. **Coolify API'sini doğrudan test edin:**
   ```bash
   curl http://coolify:8000/api/v1/servers \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

2. **Backend loglarını kontrol edin:**
   ```bash
   docker logs hostingpoint-backend | grep -i "server"
   ```

3. **Coolify Dashboard'da server durumunu kontrol edin**

4. **Server'ı yeniden bağlayın veya yeniden başlatın**

---

**Başarılar! 🚀**

