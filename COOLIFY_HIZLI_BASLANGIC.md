# Coolify Hızlı Başlangıç Rehberi

## 🚀 5 Dakikada Coolify Kurulumu

### Adım 1: Yeni EC2 Instance

1. **AWS Console** → **EC2** → **Launch Instance**
2. **Ubuntu 22.04 LTS** seçin
3. **t3.medium** (2 vCPU, 4GB RAM) veya daha büyük
4. **Security Group:**
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
   - Port 8000 (Coolify UI)
5. **Launch!**

### Security Group'da Port 8000 Açma (Eğer Launch sırasında açmadıysanız)

1. **AWS Console** → **EC2** → **Instances**
2. Instance'ınızı seçin
3. **Security** tab'ına tıklayın
4. **Security groups** linkine tıklayın (örn: `sg-xxxxx`)
5. **Inbound rules** tab'ına gidin
6. **Edit inbound rules** butonuna tıklayın
7. **Add rule** butonuna tıklayın:
   - **Type:** Custom TCP
   - **Port range:** 8000
   - **Source:** 
     - **My IP** (sadece sizin IP'nizden erişim - önerilen)
     - Veya **0.0.0.0/0** (herkese açık - güvenlik riski!)
   - **Description:** Coolify UI
8. **Save rules** butonuna tıklayın

**Not:** Güvenlik için sadece kendi IP'nizden erişim önerilir. Production'da domain üzerinden erişim daha güvenlidir.

### Adım 2: Coolify Kur

```bash
# SSH ile bağlan
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Coolify'i kur (tek komut! - sudo ile)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

**Kurulum 2-3 dakika sürer.**

### Adım 3: Coolify UI'ya Eriş

```
http://YOUR_EC2_IP:8000
```

İlk kullanıcıyı oluşturun!

---

## 📱 Uygulamayı Deploy Etme

### Yöntem 1: Git Repository'den (Önerilen)

1. **Coolify Dashboard:**
   - **New Resource** → **Application**
   - **Source:** Git Repository
   - **Repository URL:** GitHub/GitLab repo URL'iniz
   - **Branch:** `main` veya `master` (repository'nizdeki branch adını kontrol edin!)
   
   **⚠️ Önemli:** GitHub'da repository'nize gidip hangi branch'in olduğunu kontrol edin:
   - `main` mi? → `main` yazın
   - `master` mi? → `master` yazın
   - Başka bir branch mi? → O branch adını yazın

2. **Build Settings:**
   - **Build Pack:** Docker Compose
   - **Docker Compose File:** `docker-compose.coolify.yml`

3. **Environment Variables:**
   ```
   DOMAIN=hostingpoint.net
   JWT_SECRET=iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=
   NODE_ENV=production
   PORT=3000
   DB_PATH=./database/database.sqlite
   ```

4. **Domain Ayarları:**
   - Backend için: `api.hostingpoint.net`
   - Frontend için: `hostingpoint.net` (ayrı application)

5. **Deploy!** 🚀

---

## 🎯 Coolify'de İki Application Oluşturma

### Backend Application

1. **New Resource** → **Application**
2. **Name:** `backend`
3. **Git Repository:** Repo URL'iniz
4. **Branch:** `master` (veya repository'nizdeki branch adı)
5. **Build Pack:** Docker Compose
6. **Docker Compose File:** `docker-compose.backend.yml` ⚠️ (Backend için özel dosya)
7. **Domain:** `api.hostingpoint.net`
8. **Environment Variables:**
   ```
   DOMAIN=hostingpoint.net
   JWT_SECRET=iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=
   NODE_ENV=production
   PORT=3000
   DB_PATH=./database/database.sqlite
   BCRYPT_ROUNDS=10
   LOG_LEVEL=info
   ```
9. **Deploy!**

### Frontend Application

1. **New Resource** → **Application**
2. **Name:** `frontend`
3. **Git Repository:** Aynı repo URL'iniz
4. **Branch:** `master` (veya repository'nizdeki branch adı)
5. **Build Pack:** Docker Compose
6. **Docker Compose File:** `docker-compose.frontend.yml` ⚠️ (Frontend için özel dosya)
7. **Domain:** `hostingpoint.net`
8. **Environment Variables:**
   ```
   DOMAIN=hostingpoint.net
   ```
9. **Deploy!**

**Not:** Her application için ayrı docker-compose dosyası kullanıyoruz:
- Backend → `docker-compose.backend.yml`
- Frontend → `docker-compose.frontend.yml`

---

## ✅ Avantajlar

- ✅ **Web UI:** Her şeyi browser'dan yönet
- ✅ **Otomatik SSL:** Let's Encrypt otomatik
- ✅ **Git Integration:** Push = Deploy
- ✅ **Log Yönetimi:** Web UI'da loglar
- ✅ **Kolay Backup:** Tek tıkla backup
- ✅ **Monitoring:** CPU, RAM kullanımı

---

## 🔧 Troubleshooting

### Coolify UI'ya Erişemiyorum

```bash
# Security Group'da port 8000 açık mı?
# AWS Console → EC2 → Security Groups
```

### Deploy Başarısız Oluyor

- Git repository'ye erişim var mı?
- Environment variables doğru mu?
- Docker Compose file doğru mu?

### SSL Sertifikası Oluşmuyor

- DNS ayarları doğru mu?
- Domain EC2 IP'sine point ediyor mu?

---

## 📚 Daha Fazla Bilgi

Detaylı rehber için: `COOLIFY_KURULUM.md`

