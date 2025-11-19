# .env Dosyası Ayarlama Rehberi (Başlangıç Seviyesi)

## 🔐 JWT_SECRET Ne İşe Yarar?

**JWT_SECRET** = Güvenlik anahtarı (şifre gibi düşünün)

- Kullanıcılar login olduğunda, sistem bir **token** (jeton) oluşturur
- Bu token, kullanıcının kimliğini gösterir (kimlik kartı gibi)
- JWT_SECRET, bu token'ları **imzalamak** için kullanılır
- Eğer biri bu secret'ı bilirse, sahte token oluşturabilir (çok tehlikeli!)
- Bu yüzden **çok gizli tutulmalı** ve **güçlü olmalı**

**Özet:** JWT_SECRET, kullanıcı giriş sisteminin güvenliğini sağlar. Sizin oluşturduğunuz `iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=` mükemmel bir secret!

---

## 📝 .env Dosyasını Ayarlama (Adım Adım)

### Adım 1: .env Dosyasını Oluştur

EC2 sunucunuzda şu komutu çalıştırın:

```bash
cd ~/HostingPoint
cp .env.example .env
```

### Adım 2: .env Dosyasını Aç

```bash
nano .env
```

**Nano editör açıldı!** Şimdi dosyayı düzenleyebilirsiniz.

### Adım 3: Nano Editör Kullanımı

**Nano'da nasıl hareket edilir:**
- **Ok tuşları** (↑↓←→) ile hareket edin
- **Yazmak için:** Direkt yazmaya başlayın
- **Silme:** Backspace veya Delete tuşu
- **Satır başı:** Enter

**Nano'da kaydetme ve çıkma:**
1. **Kaydetmek için:** `Ctrl + O` tuşlarına basın
2. **Enter** ile onaylayın
3. **Çıkmak için:** `Ctrl + X` tuşlarına basın

### Adım 4: Minimum Gerekli Ayarlar

.env dosyasında **mutlaka değiştirmeniz gerekenler:**

```env
# Domain ayarları (KENDİ DOMAIN'İNİZİ YAZIN)
DOMAIN=yourdomain.com
ACME_EMAIL=admin@yourdomain.com

# Veritabanı şifreleri (GÜÇLÜ ŞİFRELER YAZIN!)
POSTGRES_PASSWORD=benim-güçlü-şifrem-123
REDIS_PASSWORD=başka-güçlü-şifrem-456

# JWT Secret (SİZİN OLUŞTURDUĞUNUZ)
JWT_SECRET=iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=
```

**Örnek (gerçek değerlerle):**
```env
DOMAIN=example.com
ACME_EMAIL=admin@example.com
POSTGRES_PASSWORD=MyStr0ng!P@ssw0rd123
REDIS_PASSWORD=AnotherStr0ng!P@ss456
JWT_SECRET=iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=
```

### Adım 5: Diğer Ayarlar (Opsiyonel)

Bu ayarlar şimdilik varsayılan değerlerle bırakılabilir:

```env
NODE_ENV=production
PORT=3000
JWT_EXPIRES_IN=7d
DB_PATH=./backend/database.sqlite
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=10
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

**Email ayarları (şimdilik atlayabilirsiniz, sonra ekleyebilirsiniz):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

---

## 🎯 Hızlı Örnek: .env Dosyası Nasıl Düzenlenir?

**1. Dosyayı açın:**
```bash
nano .env
```

**2. Şu satırları bulun ve değiştirin:**

**BULUN:**
```
DOMAIN=vibehost.io
```

**DEĞİŞTİRİN:**
```
DOMAIN=yourdomain.com
```

**BULUN:**
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**DEĞİŞTİRİN:**
```
JWT_SECRET=iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=
```

**BULUN:**
```
POSTGRES_PASSWORD=changeme
```

**DEĞİŞTİRİN:**
```
POSTGRES_PASSWORD=benim-güçlü-şifrem-123
```

**3. Kaydedin ve çıkın:**
- `Ctrl + O` → Enter → `Ctrl + X`

---

## ✅ Kontrol Etme

.env dosyasını kontrol etmek için:

```bash
cat .env
```

Veya sadece JWT_SECRET'ı görmek için:

```bash
grep JWT_SECRET .env
```

---

## ⚠️ Önemli Notlar

1. **JWT_SECRET'ı kimseyle paylaşmayın!**
2. **Şifreler güçlü olsun** (en az 12 karakter, büyük/küçük harf, rakam, özel karakter)
3. **Domain'i mutlaka değiştirin** (yourdomain.com yerine kendi domain'iniz)
4. **Email'i mutlaka değiştirin** (SSL sertifikası için gerekli)

---

## 🆘 Sorun mu Yaşıyorsunuz?

**Nano'da sıkıştıysanız:**
- `Ctrl + X` ile çıkın (kaydetmeden)
- Tekrar `nano .env` ile açın

**Yanlış bir şey yazdıysanız:**
- `Ctrl + K` ile satırı silin
- Tekrar yazın

**Dosyayı kaydetmek istemiyorsanız:**
- `Ctrl + X` → `N` (No) → Enter

