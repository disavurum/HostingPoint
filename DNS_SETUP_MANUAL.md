# DNS Yapılandırma Rehberi - HostingPoint

## 📋 Genel Bakış

HostingPoint'te forum kurarken iki seçeneğiniz var:
1. **Ücretsiz Subdomain** - Otomatik oluşturulur (örn: `app-abc12345.hostingpoint.net`)
2. **Özel Domain** - Kendi domain'inizi kullanabilirsiniz (örn: `forum.example.com`)

Bu rehber, özel domain kullanmak istediğinizde DNS ayarlarınızı nasıl yapılandıracağınızı açıklar.

---

## 🌐 Özel Domain İçin DNS Ayarları

### Adım 1: Domain'inizi Kontrol Edin

Özel domain kullanmak için domain'inizin DNS yönetim paneline erişiminiz olmalıdır. Genellikle:
- Domain satın aldığınız firmanın paneli (GoDaddy, Namecheap, Cloudflare, vb.)
- Veya hosting sağlayıcınızın DNS yönetim paneli

### Adım 2: DNS Kayıtlarını Ekleyin

HostingPoint'te forum kurduktan sonra, size verilen IP adresini veya CNAME kaydını kullanarak DNS ayarlarınızı yapılandırmanız gerekir.

#### Yöntem 1: A Kaydı (Önerilen)

Eğer size bir IP adresi verildiyse:

1. DNS yönetim paneline giriş yapın
2. DNS kayıtlarını düzenleyin
3. Yeni bir **A Record** ekleyin:
   - **Type:** A
   - **Name/Host:** `forum` (veya istediğiniz subdomain)
   - **Value/Points to:** `YOUR_SERVER_IP` (HostingPoint'ten alacağınız IP)
   - **TTL:** 3600 (veya varsayılan)

**Örnek:**
```
Type: A
Name: forum
Value: 123.45.67.89
TTL: 3600
```

Bu ayar ile `forum.example.com` domain'iniz HostingPoint sunucusuna yönlendirilecektir.

#### Yöntem 2: CNAME Kaydı

Eğer size bir CNAME kaydı verildiyse:

1. DNS yönetim paneline giriş yapın
2. DNS kayıtlarını düzenleyin
3. Yeni bir **CNAME Record** ekleyin:
   - **Type:** CNAME
   - **Name/Host:** `forum` (veya istediğiniz subdomain)
   - **Value/Points to:** `your-forum.hostingpoint.net` (HostingPoint'ten alacağınız CNAME)
   - **TTL:** 3600 (veya varsayılan)

**Örnek:**
```
Type: CNAME
Name: forum
Value: app-abc12345.hostingpoint.net
TTL: 3600
```

### Adım 3: DNS Yayılımını Bekleyin

DNS değişikliklerinin yayılması genellikle:
- **Minimum:** 5-10 dakika
- **Ortalama:** 1-2 saat
- **Maksimum:** 48 saat

DNS yayılımını kontrol etmek için:
- [whatsmydns.net](https://www.whatsmydns.net/)
- [dnschecker.org](https://dnschecker.org/)

### Adım 4: SSL Sertifikası

HostingPoint (Coolify) otomatik olarak Let's Encrypt SSL sertifikası oluşturur. DNS yayıldıktan sonra:
- SSL sertifikası otomatik olarak oluşturulur (5-10 dakika)
- Forum'unuz `https://` ile erişilebilir olur

---

## 🔍 DNS Kayıt Türleri Açıklaması

### A Record (Address Record)
- IP adresini domain'e bağlar
- En hızlı yöntem
- Örnek: `forum.example.com` → `123.45.67.89`

### CNAME Record (Canonical Name)
- Bir domain'i başka bir domain'e yönlendirir
- IP değişirse otomatik güncellenir
- Örnek: `forum.example.com` → `app-abc12345.hostingpoint.net`

### TTL (Time To Live)
- DNS kaydının cache'de ne kadar süre kalacağını belirler
- Düşük TTL (300-600): Hızlı güncelleme, daha fazla DNS sorgusu
- Yüksek TTL (3600+): Yavaş güncelleme, daha az DNS sorgusu

---

## 📝 Popüler DNS Sağlayıcıları İçin Adımlar

### Cloudflare

1. Cloudflare Dashboard'a giriş yapın
2. Domain'inizi seçin
3. **DNS** sekmesine gidin
4. **Add record** butonuna tıklayın
5. **Type:** A veya CNAME seçin
6. **Name:** `forum` (veya istediğiniz subdomain)
7. **IPv4 address** veya **Target:** HostingPoint'ten aldığınız değeri girin
8. **Proxy status:** DNS only (gri bulut) - SSL için önemli
9. **Save** butonuna tıklayın

### GoDaddy

1. GoDaddy Domain Manager'a giriş yapın
2. Domain'inizi seçin
3. **DNS** sekmesine gidin
4. **Records** bölümünde **Add** butonuna tıklayın
5. **Type:** A veya CNAME seçin
6. **Name:** `forum`
7. **Value:** HostingPoint'ten aldığınız IP veya CNAME
8. **TTL:** 1 Hour
9. **Save** butonuna tıklayın

### Namecheap

1. Namecheap Domain List'e giriş yapın
2. Domain'inizin yanındaki **Manage** butonuna tıklayın
3. **Advanced DNS** sekmesine gidin
4. **Add New Record** butonuna tıklayın
5. **Type:** A Record veya CNAME Record seçin
6. **Host:** `forum`
7. **Value:** HostingPoint'ten aldığınız değeri girin
8. **TTL:** Automatic
9. **Save All Changes** butonuna tıklayın

### Google Domains

1. Google Domains'e giriş yapın
2. Domain'inizi seçin
3. **DNS** sekmesine gidin
4. **Custom resource records** bölümünde **Manage custom records** butonuna tıklayın
5. Yeni kayıt ekleyin:
   - **Name:** `forum`
   - **Type:** A veya CNAME
   - **Data:** HostingPoint'ten aldığınız değer
6. **Save** butonuna tıklayın

---

## ✅ DNS Yapılandırmasını Kontrol Etme

### 1. DNS Yayılımını Kontrol Edin

```bash
# Windows (PowerShell veya CMD)
nslookup forum.example.com

# Linux/Mac
dig forum.example.com
# veya
nslookup forum.example.com
```

### 2. Online DNS Checker Kullanın

- [whatsmydns.net](https://www.whatsmydns.net/)
- [dnschecker.org](https://dnschecker.org/)
- [mxtoolbox.com](https://mxtoolbox.com/DNSLookup.aspx)

Domain'inizi girin ve dünya genelinde DNS yayılımını kontrol edin.

### 3. SSL Sertifikasını Kontrol Edin

DNS yayıldıktan sonra:
1. Tarayıcınızda `https://forum.example.com` adresine gidin
2. SSL sertifikasının otomatik oluşturulduğunu kontrol edin
3. Yeşil kilit simgesi görünmelidir

---

## ⚠️ Yaygın Sorunlar ve Çözümleri

### Sorun: DNS yayılmıyor

**Çözüm:**
- TTL değerini düşürün (300-600)
- DNS cache'i temizleyin
- Farklı DNS sunucularından kontrol edin

### Sorun: SSL sertifikası oluşturulmuyor

**Çözüm:**
- DNS'in tamamen yayıldığından emin olun
- 80 ve 443 portlarının açık olduğundan emin olun
- Let's Encrypt rate limit'ini kontrol edin

### Sorun: "Domain not found" hatası

**Çözüm:**
- DNS kayıtlarının doğru olduğundan emin olun
- TTL süresini bekleyin
- DNS yayılımını kontrol edin

### Sorun: Subdomain çalışmıyor

**Çözüm:**
- Root domain (@) için de A kaydı ekleyin
- Wildcard (*) kaydı ekleyin (isteğe bağlı)
- DNS sağlayıcınızın subdomain desteğini kontrol edin

---

## 🔐 Güvenlik Notları

1. **DNS Hijacking:** DNS ayarlarınızı sadece güvenilir kaynaklardan yapın
2. **TTL Değerleri:** Güvenlik için düşük TTL kullanmayı düşünün
3. **DNSSEC:** Mümkünse DNSSEC'i etkinleştirin
4. **DNS Lock:** Domain'inizi transfer koruması ile kilitleyin

---

## 📞 Destek

DNS yapılandırması ile ilgili sorunlarınız için:
- HostingPoint Dashboard'dan destek talebi oluşturun
- Email: support@hostingpoint.net
- Dokümantasyon: [docs.hostingpoint.net](https://docs.hostingpoint.net)

---

**Not:** Bu rehber genel bir kılavuzdur. DNS sağlayıcınıza özel talimatlar için sağlayıcınızın dokümantasyonuna bakın.

