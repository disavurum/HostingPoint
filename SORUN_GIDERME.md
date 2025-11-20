# Siteye Erişilemiyor - Sorun Giderme Rehberi

## 🔍 Hızlı Kontrol Listesi

### 1. Container'lar Çalışıyor mu?

EC2 sunucunuzda şu komutu çalıştırın:

```bash
cd ~/HostingPoint
docker compose ps
```

**Beklenen çıktı:** Tüm container'lar `Up` durumunda olmalı:
- `traefik` - Up
- `vibehost-backend` - Up  
- `vibehost-frontend` - Up

**Sorun varsa:** Container'lar `Exit` veya `Restarting` durumundaysa logları kontrol edin.

---

### 2. Container Loglarını Kontrol Et

```bash
# Tüm logları görüntüle
docker compose logs

# Traefik logları (en önemli)
docker compose logs traefik

# Backend logları
docker compose logs backend

# Frontend logları
docker compose logs frontend
```

**Ne aramalısınız:**
- ❌ `Error`, `Failed`, `Cannot connect`
- ✅ `Server started`, `Listening on port`, `Ready`

---

### 3. Portlar Açık mı?

```bash
# Portların dinlendiğini kontrol et
sudo netstat -tulpn | grep -E ':(80|443|3000|8080)'

# Veya
sudo ss -tulpn | grep -E ':(80|443|3000|8080)'
```

**Beklenen:** Port 80, 443 ve 3000 dinleniyor olmalı.

---

### 4. Firewall Kontrolü

```bash
# Firewall durumunu kontrol et
sudo ufw status

# Eğer kapalıysa veya portlar yoksa:
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw enable
```

**AWS Security Group Kontrolü:**
- AWS Console → EC2 → Security Groups
- Inbound rules'da port 80, 443, 22 açık olmalı

---

### 5. DNS Kontrolü

```bash
# Domain'in doğru IP'ye yönlendirildiğini kontrol et
dig hostingpoint.net
nslookup hostingpoint.net

# EC2 Public IP'yi öğren
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

**Kontrol:** DNS kaydı EC2 Public IP ile eşleşmeli.

---

### 6. Container'ları Yeniden Başlat

```bash
cd ~/HostingPoint

# Tüm container'ları durdur
docker compose down

# Yeniden başlat
docker compose up -d

# Logları takip et
docker compose logs -f
```

---

### 7. Traefik Dashboard Kontrolü

```bash
# Traefik dashboard'a erişmeyi dene
curl http://localhost:8080

# Veya tarayıcıda:
# http://EC2-IP:8080
```

Eğer Traefik dashboard çalışıyorsa, Traefik çalışıyor demektir.

---

## 🚨 Yaygın Sorunlar ve Çözümleri

### Sorun 1: Container'lar Başlamıyor

**Belirtiler:**
```bash
docker compose ps
# Container'lar Exit veya Restarting durumunda
```

**Çözüm:**
```bash
# Logları kontrol et
docker compose logs traefik
docker compose logs backend

# .env dosyasını kontrol et
cat .env

# Container'ları temizle ve yeniden başlat
docker compose down
docker compose up -d --build
```

---

### Sorun 2: Port 80 Zaten Kullanılıyor

**Belirtiler:**
```
Error: bind: address already in use
```

**Çözüm:**
```bash
# Port 80'i kullanan process'i bul
sudo lsof -i :80
# veya
sudo netstat -tulpn | grep :80

# Process'i durdur (dikkatli olun!)
sudo kill -9 <PID>

# Veya nginx/apache gibi bir servis çalışıyorsa:
sudo systemctl stop nginx
sudo systemctl stop apache2
```

---

### Sorun 3: Traefik SSL Sertifikası Oluşturmuyor

**Belirtiler:**
- Site HTTP'de çalışıyor ama HTTPS'de çalışmıyor
- Traefik loglarında ACME hatası

**Çözüm:**
```bash
# DNS'in doğru olduğunu kontrol et
dig hostingpoint.net

# Traefik loglarını kontrol et
docker compose logs traefik | grep -i acme

# letsencrypt dizinini kontrol et
ls -la letsencrypt/

# Eğer sorun devam ederse, letsencrypt'i temizle (dikkatli!)
docker compose down
sudo rm -rf letsencrypt/*
docker compose up -d
```

---

### Sorun 4: Backend Çalışmıyor

**Belirtiler:**
- Frontend yükleniyor ama API çağrıları başarısız

**Çözüm:**
```bash
# Backend loglarını kontrol et
docker compose logs backend

# Backend container'ına gir
docker exec -it vibehost-backend sh

# Veritabanını kontrol et
ls -la backend/database.sqlite

# Backend'i yeniden başlat
docker compose restart backend
```

---

### Sorun 5: DNS Henüz Yayılmamış

**Belirtiler:**
- `dig hostingpoint.net` farklı bir IP gösteriyor
- Veya hiç sonuç vermiyor

**Çözüm:**
- DNS değişikliklerinin yayılması 5-30 dakika sürebilir
- DNS provider'ınızda kayıtların doğru olduğunu kontrol edin
- TTL değerini kontrol edin

---

## 🔧 Hızlı Düzeltme Komutları

### Tüm Sistemi Yeniden Başlat

```bash
cd ~/HostingPoint

# Tüm container'ları durdur
docker compose down

# Temizle (dikkatli - verileri silmez)
docker system prune -f

# Yeniden başlat
docker compose up -d --build

# Logları takip et
docker compose logs -f
```

### Sadece Frontend'i Yeniden Build Et

```bash
cd ~/HostingPoint
docker compose up -d --build frontend
```

### Sadece Backend'i Yeniden Başlat

```bash
cd ~/HostingPoint
docker compose restart backend
docker compose logs -f backend
```

---

## 📊 Sistem Durumu Kontrolü

### Disk Alanı

```bash
df -h
```

### Docker Kaynak Kullanımı

```bash
docker stats
```

### Sistem Kaynakları

```bash
free -h
top
```

---

## 🆘 Hala Çalışmıyorsa

1. **Tüm logları toplayın:**
```bash
cd ~/HostingPoint
docker compose logs > logs.txt 2>&1
cat logs.txt
```

2. **Container durumunu kontrol edin:**
```bash
docker compose ps
docker ps -a
```

3. **Network durumunu kontrol edin:**
```bash
docker network ls
docker network inspect hostingpoint_default
```

4. **.env dosyasını kontrol edin:**
```bash
cat .env
```

---

## ✅ Başarı Kontrolü

Site çalışıyorsa şunlar olmalı:

1. **HTTP (Port 80):** `http://hostingpoint.net` → HTTPS'e yönlendirmeli
2. **HTTPS (Port 443):** `https://hostingpoint.net` → Frontend görünmeli
3. **API:** `https://api.hostingpoint.net` → Backend API çalışmalı
4. **Traefik Dashboard:** `http://EC2-IP:8080` → Dashboard görünmeli

---

## 📝 Notlar

- **SMTP ayarlanmamış olması sorun değil** - Sadece email göndermek için gerekli
- **Domain doğruysa** - DNS ve container'ları kontrol edin
- **Portlar açıksa** - Container loglarını kontrol edin
- **Container'lar çalışıyorsa** - Traefik yapılandırmasını kontrol edin

