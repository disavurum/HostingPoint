# Coolify Bağlantı Testi ve Sorun Giderme

## ❌ Hata: "Coolify'a bağlanılamıyor"

Bu hata, backend'in Coolify API'sine bağlanamadığını gösterir.

---

## 🔍 Hızlı Kontrol

### 1. Coolify Container'ını Bulun

```bash
docker ps | grep coolify
```

Container name'i not edin. Örnekler:
- `coolify`
- `coolify-app`
- `coolify-3`
- veya başka bir isim

### 2. Backend Container'ının Network'ünü Kontrol Edin

```bash
docker inspect hostingpoint-backend | grep -A 10 Networks
```

Network name'i not edin.

### 3. Coolify Container'ının Network'ünü Kontrol Edin

```bash
docker inspect coolify | grep -A 10 Networks
```

**Önemli:** Her iki container da aynı network'te olmalı!

---

## 🔧 Çözümler

### Çözüm 1: Container Name Kullanın (ÖNERİLEN)

Coolify container name'ini bulun ve `COOLIFY_URL` olarak kullanın:

```env
COOLIFY_URL=http://coolify:8000
```

Eğer container name farklıysa (örneğin `coolify-app`):

```env
COOLIFY_URL=http://coolify-app:8000
```

### Çözüm 2: Network'ü Kontrol Edin

Eğer container'lar farklı network'lerdeyse:

```bash
# Network'leri listele
docker network ls

# Backend'in network'ünü bul
docker inspect hostingpoint-backend | grep NetworkMode

# Coolify'ı aynı network'e bağla
docker network connect <network-name> coolify
```

### Çözüm 3: localhost Kullanın (Aynı Sunucuda)

Eğer Coolify ve Backend aynı sunucudaysa ama farklı network'lerdeyse:

```env
COOLIFY_URL=http://localhost:8000
```

**Not:** Bu sadece aynı host'ta çalışıyorsa işe yarar.

### Çözüm 4: IP Adresi Kullanın

Coolify container'ının IP'sini bulun:

```bash
docker inspect coolify | grep IPAddress
```

Sonra:

```env
COOLIFY_URL=http://172.17.0.2:8000
```

---

## 🧪 Test

### 1. Backend Container'ından Test

```bash
# Backend container'ına bağlanın
docker exec -it hostingpoint-backend sh

# Coolify container'ına ping atın
ping coolify

# veya container name ile
ping coolify-app
```

### 2. curl ile Test

```bash
# Backend container'ından
docker exec -it hostingpoint-backend sh

# Coolify API'sine istek atın
curl http://coolify:8000/api/v1/servers \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 3. Environment Variable Kontrolü

```bash
# Backend container'ında
docker exec hostingpoint-backend env | grep COOLIFY
```

Şunları görmelisiniz:
```
USE_COOLIFY=true
COOLIFY_URL=http://coolify:8000
COOLIFY_API_KEY=...
COOLIFY_SERVER_ID=1
```

---

## 📝 Önerilen COOLIFY_URL Değerleri

| Durum | COOLIFY_URL Değeri |
|-------|-------------------|
| Aynı network, container name: `coolify` | `http://coolify:8000` |
| Aynı network, container name: `coolify-app` | `http://coolify-app:8000` |
| Aynı sunucu, farklı network | `http://localhost:8000` |
| Farklı sunucu, HTTPS | `https://coolify.yourdomain.com` |
| Farklı sunucu, HTTP | `http://coolify.yourdomain.com:8000` |

---

## ⚠️ Yaygın Hatalar

### Hata: "ECONNREFUSED"
**Sebep:** Container name yanlış veya farklı network'te
**Çözüm:** Container name'i kontrol edin ve aynı network'te olduğundan emin olun

### Hata: "getaddrinfo EAI_AGAIN"
**Sebep:** DNS çözümleme hatası
**Çözüm:** Container name yerine IP adresi kullanmayı deneyin

### Hata: "Connection timeout"
**Sebep:** Port 8000 kapalı veya firewall engelliyor
**Çözüm:** Port'un açık olduğundan ve Coolify'ın çalıştığından emin olun

---

## 🔄 Adım Adım Düzeltme

1. **Coolify container name'ini bulun:**
   ```bash
   docker ps | grep coolify
   ```

2. **Backend environment variable'ını güncelleyin:**
   ```env
   COOLIFY_URL=http://<container-name>:8000
   ```

3. **Backend'i restart edin**

4. **Logları kontrol edin:**
   ```bash
   docker logs hostingpoint-backend | grep -i coolify
   ```

5. **Test forum kurun**

---

## 🆘 Hala Çalışmıyorsa

1. Coolify'ın çalıştığını kontrol edin:
   ```bash
   docker ps | grep coolify
   docker logs coolify
   ```

2. Network bağlantısını test edin:
   ```bash
   docker exec hostingpoint-backend ping coolify
   ```

3. Backend loglarını kontrol edin:
   ```bash
   docker logs hostingpoint-backend | grep -i coolify
   ```

4. Coolify API'sini doğrudan test edin:
   ```bash
   curl http://coolify:8000/api/v1/servers \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

---

**Başarılar! 🚀**

