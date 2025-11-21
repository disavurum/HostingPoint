# Coolify Domain ve SSL Sorunu Çözümü

## 🚨 Sorun: "no available server" ve SSL Yok

Bu hata genellikle DNS ayarları veya Coolify domain konfigürasyonu ile ilgilidir.

---

## ✅ Adım Adım Çözüm

### Adım 1: DNS Ayarlarını Kontrol Et

Domain'in EC2 IP'sine point ettiğinden emin olun:

1. **Domain Provider'ınızda (Namecheap, GoDaddy, vb.):**
   - DNS ayarlarına gidin
   - **A Record** ekleyin:
     ```
     Type: A
     Name: @ (veya hostingpoint.net)
     Value: YOUR_EC2_IP
     TTL: 3600
     ```
   - **Wildcard A Record** ekleyin:
     ```
     Type: A
     Name: * (wildcard)
     Value: YOUR_EC2_IP
     TTL: 3600
     ```

2. **DNS Propagation Kontrolü:**
   ```bash
   # Kendi bilgisayarınızdan
   nslookup hostingpoint.net
   nslookup api.hostingpoint.net
   ```
   
   Her ikisi de EC2 IP'nizi göstermeli.

### Adım 2: Coolify'de Domain Ayarları

1. **Coolify Dashboard:**
   - Settings → **Domains** (veya **Configuration** → **Domains**)

2. **Domain ekle:**
   - **Domain:** `hostingpoint.net`
   - **Wildcard:** `*.hostingpoint.net` (opsiyonel)
   - **Save**

### Adım 3: Application'da Domain Ayarla

#### Backend Application:

1. **Coolify Dashboard:**
   - **backend** application → **Settings**
   - **Domains** sekmesine gidin

2. **Domain ekle:**
   - **Domain:** `api.hostingpoint.net`
   - **Save**

3. **SSL ayarları:**
   - **SSL** sekmesine gidin
   - **Generate SSL Certificate** butonuna tıklayın
   - **Let's Encrypt** seçin
   - **Generate**

#### Frontend Application:

1. **Coolify Dashboard:**
   - **frontend** application → **Settings**
   - **Domains** sekmesine gidin

2. **Domain ekle:**
   - **Domain:** `hostingpoint.net`
   - **Save**

3. **SSL ayarları:**
   - **SSL** sekmesine gidin
   - **Generate SSL Certificate** butonuna tıklayın
   - **Let's Encrypt** seçin
   - **Generate**

### Adım 4: Bekle ve Kontrol Et

SSL sertifikası oluşturulması **2-5 dakika** sürebilir.

**Kontrol:**
- Application → Settings → **SSL**
- Durum "Valid" veya "Active" olmalı

---

## 🔍 Sorun Giderme

### "no available server" Hatası

**Nedenler:**
1. DNS henüz propagate olmamış
2. Domain Coolify'de ayarlanmamış
3. Application'da domain eklenmemiş

**Çözüm:**

1. **DNS kontrolü:**
   ```bash
   nslookup hostingpoint.net
   nslookup api.hostingpoint.net
   ```
   
   EC2 IP'nizi göstermeli.

2. **Coolify'de domain kontrolü:**
   - Settings → Domains → Domain eklenmiş mi?
   - Application → Settings → Domains → Domain eklenmiş mi?

3. **Bekleyin:**
   - DNS değişiklikleri 5-10 dakika sürebilir
   - Bazen 24 saate kadar sürebilir

### SSL Sertifikası Oluşturulamıyor

**Hata mesajlarını kontrol edin:**
- Application → **Logs**
- SSL sertifikası oluşturma loglarını görün

**Yaygın hatalar:**

1. **"DNS challenge failed"**
   - DNS ayarları yanlış
   - Domain EC2 IP'sine point etmiyor

2. **"Domain not pointing to server"**
   - DNS henüz propagate olmamış
   - 5-10 dakika bekleyin

3. **"Rate limit exceeded"**
   - Çok fazla deneme yapılmış
   - 1 saat bekleyin

**Çözüm:**
- DNS ayarlarını tekrar kontrol edin
- `nslookup` ile doğrulayın
- Bekleyin ve tekrar deneyin

---

## 📋 Kontrol Listesi

- [ ] DNS A Record eklenmiş (`@` → EC2 IP)
- [ ] DNS Wildcard A Record eklenmiş (`*` → EC2 IP)
- [ ] DNS propagate olmuş (`nslookup` kontrolü)
- [ ] Coolify Settings → Domains → Domain eklenmiş
- [ ] Backend Application → Settings → Domains → `api.hostingpoint.net` eklenmiş
- [ ] Frontend Application → Settings → Domains → `hostingpoint.net` eklenmiş
- [ ] SSL sertifikası oluşturulmuş (her application için)
- [ ] SSL durumu "Valid" veya "Active"

---

## 🆘 Hala Çalışmıyorsa

### Manuel DNS Kontrolü

```bash
# Kendi bilgisayarınızdan
dig hostingpoint.net
dig api.hostingpoint.net

# Veya
nslookup hostingpoint.net
nslookup api.hostingpoint.net
```

**Beklenen:** EC2 IP'nizi göstermeli

### Coolify Logları

```bash
# EC2 sunucusunda
sudo docker logs coolify-proxy
```

### Geçici Çözüm: IP ile Erişim

SSL olmadan test etmek için:

1. **Application → Settings → Domains**
2. **Temporary Domain** kullanın (Coolify otomatik oluşturur)
3. Veya IP ile erişin: `http://YOUR_EC2_IP:PORT`

**⚠️ Not:** Bu sadece test için! Production'da domain ve SSL kullanın.

---

## 💡 İpucu

1. **DNS ayarları doğru olmalı:**
   - `@` → EC2 IP
   - `*` → EC2 IP (wildcard)

2. **Coolify'de domain eklemeyi unutmayın:**
   - Hem Settings → Domains'de
   - Hem de Application → Settings → Domains'de

3. **SSL sertifikası oluşturulduktan sonra:**
   - Tarayıcı cache'ini temizleyin
   - Veya gizli modda test edin

---

## ✅ Başarı Kontrolü

Her şey çalışıyorsa:

- ✅ `https://hostingpoint.net` → Frontend çalışıyor
- ✅ `https://api.hostingpoint.net` → Backend çalışıyor
- ✅ SSL sertifikası geçerli (tarayıcıda yeşil kilit)
- ✅ "no available server" hatası yok

