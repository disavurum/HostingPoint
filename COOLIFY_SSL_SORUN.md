# Coolify SSL Sertifika Sorunu Çözümü

## 🚨 Hata: ERR_CERT_AUTHORITY_INVALID

Bu hata, SSL sertifikasının doğrulanamadığı anlamına gelir.

---

## ✅ Çözüm Adımları

### Adım 1: DNS Ayarlarını Kontrol Et

SSL sertifikası oluşturmak için domain'in EC2 IP'sine point etmesi gerekir.

1. **Domain DNS ayarlarını kontrol et:**
   ```
   A Record: hostingpoint.net → YOUR_EC2_IP
   A Record: *.hostingpoint.net → YOUR_EC2_IP (wildcard)
   ```

2. **DNS propagation kontrolü:**
   ```bash
   # Kendi bilgisayarınızdan
   nslookup hostingpoint.net
   nslookup api.hostingpoint.net
   ```
   
   Her ikisi de EC2 IP'nizi göstermeli.

### Adım 2: Coolify'de Domain Ayarları

1. **Coolify Dashboard:**
   - Application → **Settings** → **Domains**

2. **Domain ekle:**
   - **Domain:** `hostingpoint.net` (frontend için)
   - **Domain:** `api.hostingpoint.net` (backend için)

3. **SSL ayarları:**
   - **SSL:** Let's Encrypt (otomatik)
   - **Force HTTPS:** Açık
   - **Save**

### Adım 3: SSL Sertifikasını Oluştur

1. **Coolify Dashboard:**
   - Application → **Deployments**
   - **Redeploy** butonuna tıklayın

2. **Veya manuel SSL oluştur:**
   - Application → **Settings** → **SSL**
   - **Generate SSL Certificate** butonuna tıklayın
   - Let's Encrypt seçin
   - **Generate**

### Adım 4: Bekleme Süresi

SSL sertifikası oluşturulması **2-5 dakika** sürebilir.

**Kontrol:**
- Application → **Settings** → **SSL**
- Sertifika durumunu kontrol edin
- "Valid" veya "Active" görünmeli

---

## 🔍 Sorun Giderme

### DNS Henüz Propagate Olmamış

```bash
# DNS propagation kontrolü
dig hostingpoint.net
dig api.hostingpoint.net

# Veya
nslookup hostingpoint.net
nslookup api.hostingpoint.net
```

**Beklenen:** EC2 IP'nizi göstermeli

**Eğer farklı IP gösteriyorsa:**
- DNS ayarlarını tekrar kontrol edin
- 5-10 dakika bekleyin (DNS propagation süresi)

### SSL Sertifikası Oluşturulamıyor

**Hata mesajlarını kontrol edin:**
- Coolify Dashboard → Application → **Logs**
- SSL sertifikası oluşturma loglarını görün

**Yaygın hatalar:**
- `DNS challenge failed` → DNS ayarları yanlış
- `Domain not pointing to server` → DNS henüz propagate olmamış
- `Rate limit exceeded` → Çok fazla deneme yapılmış, 1 saat bekleyin

### Geçici Çözüm: Self-Signed Sertifika (Sadece Test İçin)

**⚠️ Uyarı:** Bu sadece test için! Production'da kullanmayın!

1. **Coolify Dashboard:**
   - Application → **Settings** → **SSL**
   - **Self-Signed Certificate** seçin
   - **Generate**

2. **Tarayıcıda:**
   - "Advanced" → "Proceed to hostingpoint.net (unsafe)"
   - Bu sadece geçici bir çözümdür!

---

## ✅ Doğru SSL Kurulumu

### 1. DNS Ayarları (Domain Provider'da)

```
Type    Name    Value              TTL
A       @       YOUR_EC2_IP        3600
A       *       YOUR_EC2_IP        3600
```

### 2. Coolify'de Domain Ekle

**Frontend Application:**
- Domain: `hostingpoint.net`
- SSL: Let's Encrypt

**Backend Application:**
- Domain: `api.hostingpoint.net`
- SSL: Let's Encrypt

### 3. SSL Sertifikası Oluştur

- Application → Settings → SSL
- **Generate SSL Certificate**
- Let's Encrypt seçin
- **Generate**

### 4. Bekle ve Kontrol Et

- 2-5 dakika bekle
- SSL durumunu kontrol et
- Tarayıcıda test et

---

## 🔐 Güvenlik Notları

1. **Let's Encrypt kullanın:**
   - Ücretsiz
   - Otomatik yenilenir
   - Güvenilir

2. **Self-signed sertifika kullanmayın:**
   - Production'da kullanmayın
   - Sadece test için

3. **Force HTTPS açık olsun:**
   - Application → Settings → Domains
   - **Force HTTPS** açık olmalı

---

## 📋 Kontrol Listesi

- [ ] DNS ayarları doğru (A record → EC2 IP)
- [ ] DNS propagate olmuş (nslookup kontrolü)
- [ ] Coolify'de domain eklenmiş
- [ ] SSL sertifikası oluşturulmuş
- [ ] SSL durumu "Valid" veya "Active"
- [ ] Force HTTPS açık
- [ ] Tarayıcıda test edilmiş

---

## 🆘 Hala Çalışmıyorsa

### Logları Kontrol Et

```bash
# EC2 sunucusunda
sudo docker logs coolify-proxy
```

### Coolify Logları

- Coolify Dashboard → Application → **Logs**
- SSL sertifikası oluşturma loglarını kontrol edin

### Manuel SSL Oluşturma

Eğer Coolify'de otomatik çalışmıyorsa:

1. **Coolify Dashboard:**
   - Application → Settings → SSL
   - **Manual Certificate** seçin
   - Let's Encrypt sertifikasını manuel oluşturun

2. **Veya Certbot kullanın:**
   ```bash
   # EC2 sunucusunda
   sudo certbot certonly --standalone -d hostingpoint.net -d api.hostingpoint.net
   ```

---

## 💡 İpucu

SSL sertifikası oluşturulduktan sonra:
- Tarayıcı cache'ini temizleyin
- Veya gizli modda test edin
- HTTPS ile erişmeyi deneyin: `https://hostingpoint.net`

