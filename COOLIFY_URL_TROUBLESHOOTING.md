# Coolify URL Sorun Giderme Rehberi

## ❌ Hata: `connect ECONNREFUSED fdd6:2186:804::5:8000`

Bu hata, backend'in Coolify'a bağlanamadığını gösterir. IPv6 adresi kullanılıyor ama erişilemiyor.

---

## 🔧 Çözümler

### Çözüm 1: IPv4 veya Hostname Kullanın

`COOLIFY_URL` environment variable'ını şu değerlerden biriyle değiştirin:

#### Seçenek A: localhost (Aynı sunucuda)
```env
COOLIFY_URL=http://localhost:8000
```

#### Seçenek B: Container İsmi (Docker network içinde)
```env
COOLIFY_URL=http://coolify:8000
```

#### Seçenek C: IPv4 Adresi
Coolify'ın IPv4 adresini bulun:
```bash
# Coolify container'ının IP'sini bulun
docker inspect coolify | grep IPAddress
```

Sonra:
```env
COOLIFY_URL=http://172.17.0.2:8000
```

#### Seçenek D: Public Domain (Farklı sunucuda)
```env
COOLIFY_URL=https://coolify.yourdomain.com
```

---

## 🔍 Coolify URL'ini Bulma

### Yöntem 1: Container İsmini Kontrol Edin

```bash
# Tüm container'ları listele
docker ps

# Coolify container'ını bulun ve ismini not edin
# Genellikle: coolify, coolify-app, veya benzeri
```

### Yöntem 2: Docker Network'ü Kontrol Edin

```bash
# Backend container'ının network'ünü kontrol edin
docker inspect hostingpoint-backend | grep NetworkMode

# Coolify ile aynı network'te mi kontrol edin
docker network ls
docker network inspect <network-name>
```

### Yöntem 3: Coolify Dashboard'dan Kontrol Edin

1. Coolify Dashboard'a gidin
2. Settings → General
3. API URL'ini kontrol edin
4. Bu URL'i `COOLIFY_URL` olarak kullanın

---

## ✅ Doğru COOLIFY_URL Değerleri

### Senaryo 1: Coolify ve Backend Aynı Sunucuda, Aynı Docker Network'te

```env
COOLIFY_URL=http://coolify:8000
```

Veya container ismi farklıysa:
```env
COOLIFY_URL=http://coolify-app:8000
```

### Senaryo 2: Coolify ve Backend Aynı Sunucuda, Farklı Network'lerde

```env
COOLIFY_URL=http://localhost:8000
```

Veya IPv4 adresi:
```env
COOLIFY_URL=http://127.0.0.1:8000
```

### Senaryo 3: Coolify Farklı Sunucuda

```env
COOLIFY_URL=https://coolify.yourdomain.com
```

---

## 🧪 Test Etme

### 1. Backend Container'ından Test

```bash
# Backend container'ına bağlanın
docker exec -it hostingpoint-backend sh

# Coolify URL'ini test edin
curl http://coolify:8000/api/v1/health
# veya
curl http://localhost:8000/api/v1/health
```

### 2. Environment Variable Kontrolü

```bash
# Backend container'ında environment variable'ları kontrol edin
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

## 🔄 Değişiklik Sonrası

1. **Environment variable'ı güncelleyin**
2. **Backend'i restart edin:**
   ```bash
   docker restart hostingpoint-backend
   ```
3. **Logları kontrol edin:**
   ```bash
   docker logs -f hostingpoint-backend
   ```
4. **Test forum kurun**

---

## 📝 Önerilen COOLIFY_URL Değerleri

| Durum | COOLIFY_URL Değeri |
|-------|-------------------|
| Aynı sunucu, aynı network | `http://coolify:8000` |
| Aynı sunucu, farklı network | `http://localhost:8000` |
| Farklı sunucu, HTTPS | `https://coolify.yourdomain.com` |
| Farklı sunucu, HTTP | `http://coolify.yourdomain.com:8000` |

---

## ⚠️ Yaygın Hatalar

### Hata: IPv6 adresi kullanılıyor
**Çözüm:** IPv4 veya hostname kullanın

### Hata: Container ismi bulunamıyor
**Çözüm:** `localhost` veya gerçek IP adresini kullanın

### Hata: Port 8000 erişilemiyor
**Çözüm:** 
- Coolify'ın çalıştığından emin olun
- Port'un açık olduğundan emin olun
- Firewall kurallarını kontrol edin

---

## 🆘 Hala Çalışmıyorsa

1. Coolify'ın çalıştığını kontrol edin:
   ```bash
   docker ps | grep coolify
   ```

2. Coolify loglarını kontrol edin:
   ```bash
   docker logs coolify
   ```

3. Network bağlantısını test edin:
   ```bash
   docker exec hostingpoint-backend ping coolify
   ```

4. Backend loglarını kontrol edin:
   ```bash
   docker logs hostingpoint-backend | grep -i coolify
   ```

---

**Başarılar! 🚀**

