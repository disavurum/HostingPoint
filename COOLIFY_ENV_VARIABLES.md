# Coolify Environment Variables Ayarları

## 🚨 Sorun

Environment variables boş! JWT_SECRET ve diğer önemli değişkenlerin eklenmesi gerekiyor.

---

## ✅ Backend Application - Environment Variables

### Coolify'de Ekleme:

1. **Coolify Dashboard:**
   - **backend** application → **Settings**
   - **Environment Variables** sekmesine gidin

2. **Aşağıdaki değişkenleri ekleyin:**

```
DOMAIN=hostingpoint.net
JWT_SECRET=iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=
JWT_EXPIRES_IN=30d
NODE_ENV=production
PORT=3000
DB_PATH=./database/database.sqlite
BCRYPT_ROUNDS=10
LOG_LEVEL=info
```

3. **Her değişken için:**
   - **Key:** Değişken adı (örn: `JWT_SECRET`)
   - **Value:** Değer (örn: `iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=`)
   - **Add** veya **Save** butonuna tıklayın

4. **Save** (genel kaydet)

5. **Redeploy** yapın:
   - **Deployments** → **Redeploy**

---

## ✅ Frontend Application - Environment Variables

### Coolify'de Ekleme:

1. **Coolify Dashboard:**
   - **frontend** application → **Settings**
   - **Environment Variables** sekmesine gidin

2. **Aşağıdaki değişkeni ekleyin:**

```
DOMAIN=hostingpoint.net
```

3. **Save**

4. **Redeploy** yapın

---

## 📋 Tüm Environment Variables Listesi

### Backend Application:

| Key | Value | Açıklama |
|-----|-------|----------|
| `DOMAIN` | `hostingpoint.net` | Site domain'i |
| `JWT_SECRET` | `iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=` | JWT şifreleme anahtarı |
| `JWT_EXPIRES_IN` | `30d` | Token geçerlilik süresi |
| `NODE_ENV` | `production` | Node.js ortamı |
| `PORT` | `3000` | Backend port |
| `DB_PATH` | `./database/database.sqlite` | Veritabanı yolu |
| `BCRYPT_ROUNDS` | `10` | Şifre hash turları |
| `LOG_LEVEL` | `info` | Log seviyesi |

### Frontend Application:

| Key | Value | Açıklama |
|-----|-------|----------|
| `DOMAIN` | `hostingpoint.net` | Site domain'i |

---

## 🔐 JWT_SECRET Güvenliği

**⚠️ Önemli:** JWT_SECRET'ı kimseyle paylaşmayın!

Eğer farklı bir JWT_SECRET kullanmak isterseniz:

```bash
# Kendi bilgisayarınızda
openssl rand -base64 32
```

Bu komut yeni bir güvenli secret oluşturur.

---

## 📝 Adım Adım Ekleme

### Backend için:

1. **backend** application → **Settings** → **Environment Variables**
2. **Add Variable** veya **+** butonuna tıklayın
3. Her değişken için:
   - **Key:** `JWT_SECRET`
   - **Value:** `iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=`
   - **Add**
4. Tüm değişkenleri ekleyin
5. **Save**
6. **Redeploy**

### Frontend için:

1. **frontend** application → **Settings** → **Environment Variables**
2. **Add Variable** veya **+** butonuna tıklayın
3. **Key:** `DOMAIN`
4. **Value:** `hostingpoint.net`
5. **Add**
6. **Save**
7. **Redeploy**

---

## ✅ Kontrol

Environment variables eklendikten sonra:

1. **Application → Settings → Environment Variables**
2. Tüm değişkenlerin listede olduğunu kontrol edin
3. **Redeploy** yapın
4. Logları kontrol edin:
   - **Application → Logs**
   - Hata olmamalı

---

## 🆘 Sorun Giderme

### Environment Variable Görünmüyor

- **Save** butonuna tıkladınız mı?
- **Redeploy** yaptınız mı?
- Değişken adı doğru mu? (büyük/küçük harf duyarlı)

### Hala Hata Alıyorum

1. **Logları kontrol edin:**
   - Application → **Logs**
   - Hata mesajlarını görün

2. **Environment variables'ı tekrar kontrol edin:**
   - Tüm değişkenler eklenmiş mi?
   - Değerler doğru mu?

3. **Redeploy yapın:**
   - Deployments → **Redeploy**

---

## 💡 İpucu

- Environment variables'ları ekledikten sonra **mutlaka redeploy** yapın
- JWT_SECRET gibi hassas bilgileri asla commit etmeyin
- Production'da güçlü JWT_SECRET kullanın

---

## 🎯 Özet

1. ✅ Backend Application → Settings → Environment Variables
2. ✅ Tüm değişkenleri ekle (JWT_SECRET, DOMAIN, vb.)
3. ✅ Frontend Application → Settings → Environment Variables
4. ✅ DOMAIN ekle
5. ✅ Her ikisini de **Redeploy** yap

Bu şekilde environment variables sorunu çözülecek! 🚀

