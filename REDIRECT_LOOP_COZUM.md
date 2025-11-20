# ERR_TOO_MANY_REDIRECTS Çözümü

## 🚨 Sorun

Cloudflare ve Traefik arasında redirect döngüsü var. Her ikisi de HTTP'den HTTPS'e yönlendirmeye çalışıyor.

## ✅ Hızlı Çözüm

### Çözüm 1: Cloudflare SSL Modunu "Flexible" Yapın

1. **Cloudflare Dashboard:**
   - https://dash.cloudflare.com
   - `hostingpoint.net` → **SSL/TLS** → **Overview**

2. **SSL encryption mode:**
   - **"Flexible"** seçin
   - Kaydedin

**Neden?**
- Cloudflare ↔ Ziyaretçi: HTTPS
- Cloudflare ↔ Origin: HTTP
- Traefik'in redirect'i devre dışı kalır

---

### Çözüm 2: Cloudflare "Always Use HTTPS" Kapatın

1. **Cloudflare Dashboard:**
   - **SSL/TLS** → **Edge Certificates**

2. **"Always Use HTTPS"** ayarını bulun
3. **Kapatın** (OFF yapın)

**Neden?**
- Traefik zaten HTTP'den HTTPS'e redirect yapıyor
- Cloudflare de yaparsa döngü oluşur

---

### Çözüm 3: Traefik Redirect Ayarlarını Kontrol Et

EC2 sunucunuzda:

```bash
cd ~/HostingPoint

# docker-compose.yml'i kontrol et
cat docker-compose.yml | grep -A 5 "redirections"
```

Traefik'te HTTP'den HTTPS'e redirect var. Cloudflare "Full" modda ise bu döngü yaratır.

---

## 🔧 Adım Adım Çözüm

### 1. Cloudflare Ayarları

**SSL/TLS → Overview:**
- SSL encryption mode: **Flexible**

**SSL/TLS → Edge Certificates:**
- Always Use HTTPS: **OFF** (kapalı)

**SSL/TLS → SSL/TLS Recommender:**
- Otomatik HTTPS redirect: **KAPALI**

### 2. Bekleyin

Değişikliklerin yayılması: **1-2 dakika**

### 3. Test Edin

- Tarayıcı cache'ini temizleyin (Ctrl + Shift + Delete)
- Veya gizli modda açın
- `https://hostingpoint.net` adresini deneyin

---

## 🎯 Önerilen Yapılandırma

### Şimdi (Hızlı Çözüm):
```
Cloudflare SSL: Flexible
Always Use HTTPS: OFF
```

### Sonra (SSL Sertifikası Oluştuktan Sonra):
```
Cloudflare SSL: Full
Always Use HTTPS: OFF (Traefik zaten yapıyor)
```

---

## 🔍 Sorun Giderme

### Hala Redirect Loop Varsa

**1. Cloudflare Cache Temizle:**
- Cloudflare → Caching → Purge Everything

**2. Browser Cache Temizle:**
- Ctrl + Shift + Delete
- Veya gizli modda test edin

**3. Traefik Loglarını Kontrol Et:**
```bash
cd ~/HostingPoint
docker compose logs traefik | grep -i redirect
```

**4. Container'ları Kontrol Et:**
```bash
docker compose ps
```

Tüm container'lar `Up` durumunda olmalı.

---

## 📋 Kontrol Listesi

- [ ] Cloudflare SSL: Flexible
- [ ] Always Use HTTPS: OFF
- [ ] Browser cache temizlendi
- [ ] 1-2 dakika beklendi
- [ ] Site test edildi

---

## ⚡ Hızlı Düzeltme Komutları

### Cloudflare'de Yapılacaklar:

1. **SSL/TLS → Overview:**
   - SSL encryption mode: **Flexible**

2. **SSL/TLS → Edge Certificates:**
   - Always Use HTTPS: **OFF**

3. **Caching → Purge Everything**

### EC2'de Kontrol:

```bash
cd ~/HostingPoint
docker compose ps
docker compose logs traefik | tail -20
```

---

## 🆘 Hala Çalışmıyorsa

### Traefik Redirect'i Geçici Olarak Kapat

`docker-compose.yml` dosyasında Traefik'in redirect ayarını kontrol edin:

```yaml
- --entrypoints.web.http.redirections.entrypoint.to=websecure
- --entrypoints.web.http.redirections.entrypoint.scheme=https
```

Bu satırlar HTTP'den HTTPS'e redirect yapıyor. Cloudflare "Flexible" modda ise bu satırlar sorun yaratmaz ama yine de kontrol edin.

### Container'ları Yeniden Başlat

```bash
cd ~/HostingPoint
docker compose restart traefik
docker compose logs -f traefik
```

---

## ✅ Başarı Kontrolü

Site çalışıyorsa:
- `https://hostingpoint.net` → Frontend görünmeli
- `https://api.hostingpoint.net` → API çalışmalı
- Redirect loop olmamalı

