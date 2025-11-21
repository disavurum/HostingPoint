# Coolify Domain Ayarları Düzeltme

## 🚨 Sorun

Server sekmesinde wildcard domain'e site domain'ini yazmak yanlış! Domain ayarları **Application seviyesinde** yapılmalı.

---

## ✅ Doğru Ayarlar

### 1. Server Sekmesi (Global Ayarlar)

**Server → Settings → Domains:**

Buraya **genel domain** ekleyin (opsiyonel):
- Domain: `hostingpoint.net` (sadece domain, wildcard değil)
- Veya boş bırakın (her application için ayrı domain ekleyeceksiniz)

**⚠️ Önemli:** Wildcard domain (`*.hostingpoint.net`) buraya eklemeyin!

### 2. Application Seviyesinde Domain (Doğru Yöntem)

Her application için **ayrı ayrı** domain ekleyin:

#### Backend Application:

1. **Coolify Dashboard:**
   - **backend** application → **Settings**
   - **Domains** sekmesine gidin

2. **Domain ekle:**
   - **Domain:** `api.hostingpoint.net` (sadece bu, wildcard değil)
   - **Save**

#### Frontend Application:

1. **Coolify Dashboard:**
   - **frontend** application → **Settings**
   - **Domains** sekmesine gidin

2. **Domain ekle:**
   - **Domain:** `hostingpoint.net` (sadece bu, wildcard değil)
   - **Save**

---

## 🔧 Düzeltme Adımları

### Adım 1: Server Sekmesindeki Yanlış Ayarı Kaldır

1. **Coolify Dashboard:**
   - **Server** → **Settings** (veya **Configuration**)
   - **Domains** sekmesine gidin

2. **Wildcard domain'i kaldırın:**
   - Eğer `*.hostingpoint.net` veya `hostingpoint.net` yazıyorsa
   - **Delete** veya **Remove** butonuna tıklayın
   - Veya boş bırakın

### Adım 2: Application Seviyesinde Domain Ekleyin

#### Backend:

1. **backend** application → **Settings** → **Domains**
2. **Add Domain** butonuna tıklayın
3. **Domain:** `api.hostingpoint.net` yazın
4. **Save**

#### Frontend:

1. **frontend** application → **Settings** → **Domains**
2. **Add Domain** butonuna tıklayın
3. **Domain:** `hostingpoint.net` yazın
4. **Save**

### Adım 3: Redeploy

1. Her application için:
   - **Deployments** → **Redeploy**

---

## 📋 Doğru Domain Yapısı

### Server Seviyesi (Global):
- ❌ `*.hostingpoint.net` (wildcard - yanlış)
- ✅ Boş bırakın (veya sadece `hostingpoint.net` - opsiyonel)

### Application Seviyesi:
- **Backend:** `api.hostingpoint.net` ✅
- **Frontend:** `hostingpoint.net` ✅

---

## 🆘 "no available servers" Hatası

Eğer hala bu hatayı alıyorsanız:

1. **Server sekmesindeki wildcard domain'i kaldırdınız mı?**
2. **Application seviyesinde domain eklediniz mi?**
3. **DNS ayarları doğru mu?**
   ```bash
   nslookup hostingpoint.net
   nslookup api.hostingpoint.net
   ```
4. **Redeploy yaptınız mı?**

---

## ✅ Kontrol Listesi

- [ ] Server sekmesindeki wildcard domain kaldırıldı
- [ ] Backend Application → Settings → Domains → `api.hostingpoint.net` eklendi
- [ ] Frontend Application → Settings → Domains → `hostingpoint.net` eklendi
- [ ] DNS ayarları doğru (A record → EC2 IP)
- [ ] DNS propagate olmuş (`nslookup` kontrolü)
- [ ] Her application redeploy edildi

---

## 💡 İpucu

**Kural:** 
- Server seviyesinde wildcard domain kullanmayın
- Her application için ayrı domain ekleyin
- Domain formatı: `subdomain.domain.com` veya `domain.com` (wildcard değil!)

---

## 🎯 Özet

1. ❌ Server sekmesinde wildcard domain → **Kaldır**
2. ✅ Backend Application → Domains → `api.hostingpoint.net` → **Ekle**
3. ✅ Frontend Application → Domains → `hostingpoint.net` → **Ekle**
4. ✅ **Redeploy** yap

Bu şekilde "no available servers" hatası düzelecek! 🚀

