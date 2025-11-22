# Coolify Volume Ekleme - Hızlı Rehber

## 🚨 Sorun: "Volumes" Sekmesi Yok

Coolify'da "Volumes" sekmesi görünmüyorsa, volume'ları **Docker Compose** üzerinden eklemeniz gerekir.

## ✅ Çözüm: Docker Compose ile Volume Ekleme

### Yöntem 1: Coolify UI'dan (Önerilen)

1. **Service'inizi açın** (Backend)
2. **"Docker Compose"** veya **"Configuration"** sekmesine gidin
3. Docker Compose içeriğini düzenleyin:

```yaml
services:
  backend:
    # ... mevcut ayarlarınız ...
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - backend-data:/app/data
      - ./customers:/app/customers

volumes:
  backend-data:
```

4. **Kaydet** ve **Redeploy** edin

### Yöntem 2: Repository'deki Docker Compose Dosyasını Kullan

1. Repository'nizde `docker-compose.coolify.yml` dosyası var
2. Coolify'da service oluştururken/düzenlerken bu dosyayı seçin
3. Volume'lar otomatik yüklenecek

### Yöntem 3: Advanced Settings

1. Service → **"Advanced"** veya **"Settings"** sekmesi
2. **"Docker Socket"** veya **"Privileged Mode"** seçeneğini arayın
3. Docker socket erişimi için izin verin

## 📋 Eklenmesi Gereken Volume'lar

### Backend Service için:

| Volume | Host Path | Container Path | Read Only | Açıklama |
|--------|-----------|----------------|-----------|----------|
| Docker Socket | `/var/run/docker.sock` | `/var/run/docker.sock` | ✅ **EVET** | Forum kurulumu için gerekli |
| Data Volume | `backend-data` (named) | `/app/data` | ❌ Hayır | Database |
| Customers | `./customers` (bind) | `/app/customers` | ❌ Hayır | Forum verileri |

## 🔧 Docker Compose Örneği

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: hostingpoint-backend
    restart: unless-stopped
    volumes:
      # KRİTİK: Docker socket (read-only!)
      - /var/run/docker.sock:/var/run/docker.sock:ro
      # Database ve uygulama verileri
      - backend-data:/app/data
      # Forum verileri (host path)
      - ./customers:/app/customers
    environment:
      - NODE_ENV=production
      - PORT=3000
      # ... diğer env variables ...

volumes:
  backend-data:
    driver: local
```

## ⚠️ Önemli Notlar

1. **Docker Socket MUTLAKA read-only olmalı** (`:ro` ekleyin)
2. Volume'ları ekledikten sonra **service'i redeploy** edin
3. Host path'ler Coolify sunucusunda mevcut olmalı
4. Named volume'lar Coolify tarafından otomatik oluşturulur

## 🧪 Test

Volume'ları ekledikten sonra test edin:

```bash
# Container'a bağlan
docker exec -it hostingpoint-backend sh

# Docker socket kontrolü
ls -la /var/run/docker.sock
# ✅ Çıktı: srw-rw---- 1 root docker ...

# Data directory kontrolü
ls -la /app/data
# ✅ Çıktı: database.sqlite görünmeli

# Customers directory kontrolü
ls -la /app/customers
# ✅ Çıktı: Dizin mevcut olmalı
```

## 🆘 Sorun Giderme

**"Permission denied" hatası:**
```bash
# Host'ta dizin izinlerini düzelt
sudo chown -R 1000:1000 /data/coolify/volumes/hostingpoint/
```

**Docker socket bulunamıyor:**
- Host path'in doğru olduğundan emin olun: `/var/run/docker.sock`
- `:ro` (read-only) eklediğinizden emin olun

**Volume'lar görünmüyor:**
- Service'i redeploy edin
- Docker Compose dosyasını tekrar kontrol edin
- Container loglarını kontrol edin: `docker logs hostingpoint-backend`

---

**Başarılar! 🚀**

