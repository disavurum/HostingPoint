# Coolify Kurulum ve Deploy Rehberi

## 🎯 Coolify Nedir?

Coolify, self-hosted bir PaaS (Platform as a Service) platformudur. Docker container'larınızı kolayca yönetmenizi sağlar:
- ✅ Otomatik SSL sertifikaları (Let's Encrypt)
- ✅ Domain yönetimi
- ✅ Git-based deployment
- ✅ Database yönetimi
- ✅ Kolay backup/restore
- ✅ Web UI ile kolay yönetim

---

## 🚀 Yeni EC2 Sunucu Kurulumu

### Adım 1: Yeni EC2 Instance Oluştur

1. **AWS Console** → **EC2** → **Launch Instance**
2. **Instance Details:**
   - **AMI:** Ubuntu 22.04 LTS (veya 24.04)
   - **Instance Type:** t3.medium veya daha büyük (minimum 2GB RAM)
   - **Storage:** 20GB+ (SSD)
3. **Security Group:**
   - **Port 22 (SSH)** - 0.0.0.0/0 (veya sadece IP'niz)
   - **Port 80 (HTTP)** - 0.0.0.0/0
   - **Port 443 (HTTPS)** - 0.0.0.0/0
   - **Port 8000 (Coolify UI)** - 0.0.0.0/0 (veya sadece IP'niz)
4. **Key Pair:** Yeni bir key pair oluşturun veya mevcut olanı kullanın
5. **Launch Instance**

### Adım 2: EC2'ye Bağlan

```bash
# SSH ile bağlan
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

---

## 📦 Coolify Kurulumu

### Hızlı Kurulum (Önerilen)

```bash
# Sunucuya bağlandıktan sonra (sudo ile çalıştırın!)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

Bu script otomatik olarak:
- Docker ve Docker Compose'u kurar
- Coolify'i kurar
- Gerekli servisleri başlatır

### Kurulum Sonrası

1. **Coolify UI'ya eriş:**
   ```
   http://YOUR_EC2_IP:8000
   ```

2. **İlk kurulum:**
   - Admin kullanıcı oluştur
   - Email ayarla (opsiyonel)
   - Domain ayarla (opsiyonel - sonra da yapabilirsiniz)

---

## 🌐 Domain Ayarlama (Opsiyonel)

### DNS Ayarları

1. **Domain DNS'inde A record ekle:**
   ```
   @ → YOUR_EC2_IP
   * → YOUR_EC2_IP (wildcard)
   ```

2. **Coolify'de domain ayarla:**
   - Settings → Domains
   - Domain ekle: `hostingpoint.net`
   - Wildcard domain: `*.hostingpoint.net`

---

## 📱 Uygulamayı Coolify'e Deploy Etme

### Yöntem 1: Git Repository'den Deploy (Önerilen)

1. **Coolify Dashboard:**
   - **New Resource** → **Application**
   - **Source:** Git Repository
   - **Repository URL:** GitHub/GitLab repo URL'iniz
   - **Branch:** main/master

2. **Build Settings:**
   - **Build Pack:** Docker Compose (veya Dockerfile)
   - **Docker Compose File:** `docker-compose.yml`

3. **Environment Variables:**
   ```
   DOMAIN=hostingpoint.net
   JWT_SECRET=iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=
   NODE_ENV=production
   PORT=3000
   DB_PATH=./database/database.sqlite
   ```

4. **Deploy!**

### Yöntem 2: Docker Compose ile Deploy

1. **Coolify Dashboard:**
   - **New Resource** → **Docker Compose**
   - **Git Repository:** Repo URL'iniz
   - **Docker Compose File:** `docker-compose.yml`

2. **Environment Variables ekle** (yukarıdaki gibi)

3. **Deploy!**

---

## 🔧 Mevcut docker-compose.yml'i Coolify'e Uyarlama

Coolify için `docker-compose.yml` dosyanızı güncelleyin:

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: vibehost-backend
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./backend/customers:/app/customers
      - ./backend/database:/app/database
      - ./backend/logs:/app/logs
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DOMAIN=${DOMAIN}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-30d}
      - DB_PATH=./database/database.sqlite
      - BCRYPT_ROUNDS=${BCRYPT_ROUNDS:-10}
      - LOG_LEVEL=${LOG_LEVEL:-info}
    # Coolify otomatik olarak port mapping yapar
    # labels eklemenize gerek yok

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_DOMAIN=${DOMAIN}
    container_name: vibehost-frontend
    restart: unless-stopped
    # Coolify otomatik olarak port mapping yapar
```

**Not:** Traefik'e gerek yok - Coolify kendi reverse proxy'sini kullanır!

---

## 🎯 Coolify'de Domain ve SSL Ayarları

1. **Application Settings:**
   - **Domain:** `api.hostingpoint.net` (backend için)
   - **SSL:** Otomatik (Let's Encrypt)
   - **Force HTTPS:** Açık

2. **Frontend için ayrı application:**
   - **Domain:** `hostingpoint.net`
   - **SSL:** Otomatik
   - **Force HTTPS:** Açık

---

## 📊 Coolify Avantajları

✅ **Kolay Yönetim:** Web UI ile her şeyi yönetebilirsiniz
✅ **Otomatik SSL:** Let's Encrypt sertifikaları otomatik yenilenir
✅ **Git Integration:** Push yaptığınızda otomatik deploy
✅ **Log Yönetimi:** Web UI'da logları görebilirsiniz
✅ **Backup:** Kolay backup/restore
✅ **Monitoring:** Resource kullanımını görebilirsiniz
✅ **Database Yönetimi:** PostgreSQL, MySQL, MongoDB kolay kurulum

---

## 🔄 Mevcut Uygulamayı Migrate Etme

### Adım 1: Veritabanını Yedekle (Eğer varsa)

```bash
# Eski sunucuda
cd ~/HostingPoint
cp backend/database/database.sqlite database-backup.sqlite
```

### Adım 2: Coolify'de Deploy

1. Git repository'nizi Coolify'e bağlayın
2. Environment variables'ı ekleyin
3. Deploy edin

### Adım 3: Veritabanını Restore Et (Eğer varsa)

Coolify'de volume mount kullanarak veritabanı dosyasını kopyalayın.

---

## 🆘 Sorun Giderme

### Coolify UI'ya Erişemiyorum

```bash
# Coolify servisini kontrol et
sudo systemctl status coolify

# Logları kontrol et
sudo journalctl -u coolify -f
```

### Port 8000 Açık Değil

```bash
# Security Group'da port 8000'i aç
# AWS Console → EC2 → Security Groups → Inbound Rules
# Port 8000, Source: 0.0.0.0/0 (veya sadece IP'niz)
```

### SSL Sertifikası Oluşmuyor

- DNS ayarlarını kontrol edin
- Domain'in EC2 IP'sine point ettiğinden emin olun
- Coolify'de domain ayarlarını kontrol edin

---

## 📚 Kaynaklar

- **Coolify Docs:** https://coolify.io/docs
- **Coolify GitHub:** https://github.com/coollabsio/coolify
- **Discord:** https://discord.gg/coolify

---

## ✅ Sonraki Adımlar

1. ✅ Yeni EC2 instance oluştur
2. ✅ Coolify kur
3. ✅ Git repository'yi bağla
4. ✅ Environment variables ekle
5. ✅ Deploy et
6. ✅ Domain ve SSL ayarla
7. ✅ Test et!

---

## 💡 İpucu

Coolify kurulumu sırasında sorun yaşarsanız, Coolify'in resmi dokümantasyonuna bakın veya Discord'dan yardım isteyin. Çok aktif bir topluluk var!

