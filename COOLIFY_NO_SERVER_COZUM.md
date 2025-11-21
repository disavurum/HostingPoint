# Coolify "no available servers" Hatası Çözümü

## 🚨 Sorun

Coolify "no available servers" hatası veriyor. Bu, domain'in doğru ayarlanmadığı veya DNS'in henüz propagate olmadığı anlamına gelir.

---

## ✅ Hızlı Çözüm

### Adım 1: DNS Kontrolü

Kendi bilgisayarınızdan:

```bash
nslookup hostingpoint.net
nslookup api.hostingpoint.net
```

**Beklenen:** EC2 IP'nizi göstermeli

**Eğer farklı IP veya "can't find" gösteriyorsa:**
- DNS ayarlarını kontrol edin
- 5-10 dakika bekleyin (DNS propagation)

### Adım 2: Coolify'de Domain Ayarlarını Kontrol Et

#### Backend Application:

1. **Coolify Dashboard:**
   - **backend** application → **Settings**
   - **Domains** sekmesine gidin

2. **Domain var mı kontrol et:**
   - `api.hostingpoint.net` eklenmiş mi?
   - Yoksa ekleyin:
     - **Domain:** `api.hostingpoint.net`
     - **Save**

3. **Eğer domain yoksa:**
   - **Add Domain** butonuna tıklayın
   - `api.hostingpoint.net` yazın
   - **Save**

#### Frontend Application:

1. **Coolify Dashboard:**
   - **frontend** application → **Settings**
   - **Domains** sekmesine gidin

2. **Domain var mı kontrol et:**
   - `hostingpoint.net` eklenmiş mi?
   - Yoksa ekleyin:
     - **Domain:** `hostingpoint.net`
     - **Save**

### Adım 3: Application'ı Redeploy Et

Domain ekledikten sonra:

1. **Application → Deployments**
2. **Redeploy** butonuna tıklayın
3. Logları kontrol edin

---

## 🔍 Detaylı Kontrol

### 1. DNS Ayarları (Domain Provider'da)

**Namecheap, GoDaddy, Cloudflare, vb.:**

1. DNS ayarlarına gidin
2. **A Record** ekleyin:
   ```
   Type: A
   Name: @ (veya hostingpoint.net)
   Value: YOUR_EC2_IP
   TTL: 3600
   ```
3. **Wildcard A Record** ekleyin:
   ```
   Type: A
   Name: * (wildcard)
   Value: YOUR_EC2_IP
   TTL: 3600
   ```

### 2. DNS Propagation Kontrolü

```bash
# Windows PowerShell'de
nslookup hostingpoint.net
nslookup api.hostingpoint.net

# Veya online tool kullanın:
# https://dnschecker.org/
```

**Beklenen:** Her ikisi de EC2 IP'nizi göstermeli

### 3. Coolify Settings → Domains

1. **Coolify Dashboard:**
   - **Settings** → **Domains** (veya **Configuration** → **Domains**)

2. **Domain eklenmiş mi kontrol et:**
   - `hostingpoint.net` var mı?
   - Yoksa ekleyin

---

## 🆘 Geçici Çözüm: IP ile Erişim

Domain çalışmıyorsa, geçici olarak IP ile test edebilirsiniz:

1. **Application → Settings → Domains**
2. **Temporary Domain** kullanın (Coolify otomatik oluşturur)
3. Veya **Port** ile erişin:
   - Backend: `http://YOUR_EC2_IP:PORT`
   - Frontend: `http://YOUR_EC2_IP:PORT`

**⚠️ Not:** Bu sadece test için! Production'da domain kullanın.

---

## 📋 Kontrol Listesi

- [ ] DNS A Record eklenmiş (`@` → EC2 IP)
- [ ] DNS Wildcard A Record eklenmiş (`*` → EC2 IP)
- [ ] DNS propagate olmuş (`nslookup` kontrolü)
- [ ] Coolify Settings → Domains → Domain eklenmiş
- [ ] Backend Application → Settings → Domains → `api.hostingpoint.net` eklenmiş
- [ ] Frontend Application → Settings → Domains → `hostingpoint.net` eklenmiş
- [ ] Application redeploy edilmiş

---

## 🔧 Yaygın Sorunlar

### Sorun 1: DNS Henüz Propagate Olmamış

**Belirtiler:**
- `nslookup` farklı IP gösteriyor
- Veya "can't find" hatası

**Çözüm:**
- 5-10 dakika bekleyin
- DNS değişiklikleri bazen 24 saate kadar sürebilir
- Online DNS checker kullanın: https://dnschecker.org/

### Sorun 2: Domain Coolify'de Eklenmemiş

**Belirtiler:**
- Application → Settings → Domains boş
- "no available servers" hatası

**Çözüm:**
- Domain ekleyin (yukarıdaki adımları takip edin)
- Redeploy yapın

### Sorun 3: Yanlış Domain Formatı

**Belirtiler:**
- Domain eklenmiş ama çalışmıyor

**Çözüm:**
- Domain formatını kontrol edin:
  - ✅ `hostingpoint.net` (doğru)
  - ✅ `api.hostingpoint.net` (doğru)
  - ❌ `https://hostingpoint.net` (yanlış - protocol eklemeyin)
  - ❌ `www.hostingpoint.net` (eğer www kullanmıyorsanız)

---

## ✅ Başarı Kontrolü

Her şey çalışıyorsa:

- ✅ `nslookup hostingpoint.net` → EC2 IP gösteriyor
- ✅ `nslookup api.hostingpoint.net` → EC2 IP gösteriyor
- ✅ Coolify'de domain eklenmiş
- ✅ Application'da domain eklenmiş
- ✅ "no available servers" hatası yok
- ✅ Application çalışıyor

---

## 💡 İpucu

1. **DNS ayarlarını yaptıktan sonra:**
   - 5-10 dakika bekleyin
   - `nslookup` ile kontrol edin
   - Sonra Coolify'de domain ekleyin

2. **Coolify'de domain eklerken:**
   - Protocol eklemeyin (`https://` yok)
   - Sadece domain adını yazın: `hostingpoint.net`

3. **Domain ekledikten sonra:**
   - Mutlaka redeploy yapın
   - Logları kontrol edin

