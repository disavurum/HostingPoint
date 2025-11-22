# Coolify Volume Kurulum Rehberi

## 📦 Volume Ekleme Adımları (Adım Adım)

### 1. Backend Service için Volume'lar

#### Adım 1: Service'i Açın
1. Coolify Dashboard'a gidin
2. "Services" veya "Applications" bölümüne gidin
3. Backend service'inizi seçin (ör: `hostingpoint-backend`)

#### Adım 2: Docker Compose Sekmesine Gidin

Coolify'da volume'lar genellikle **Docker Compose** üzerinden yapılandırılır:

**Yöntem 1: Docker Compose Sekmesi (Önerilen)**
1. Service detay sayfasında **"Docker Compose"** veya **"Configuration"** sekmesini bulun
2. Docker Compose dosyasını düzenleyin

**Yöntem 2: Volumes Sekmesi (Eğer varsa)**
1. Service detay sayfasında **"Volumes"** veya **"Storage"** sekmesini bulun
2. "Add Volume" veya "+" butonuna tıklayın

**Yöntem 3: Advanced Settings**
1. Service detay sayfasında **"Advanced"** veya **"Settings"** sekmesine gidin
2. Volume ayarlarını burada bulabilirsiniz

#### Adım 3: Docker Socket Mount (EN ÖNEMLİSİ!)

Bu volume **MUTLAKA** eklenmeli, yoksa yeni forum kurulumları çalışmaz!

**Ayarlar:**
- **Type:** `Bind Mount` veya `Host Path`
- **Host Path:** `/var/run/docker.sock`
- **Container Path:** `/var/run/docker.sock`
- **Read Only:** ✅ **İşaretleyin** (güvenlik için)
- **Description:** "Docker socket for container management"

**Neden gerekli?**
- Backend, yeni forum kurarken Docker API'yi kullanır
- Docker socket olmadan container oluşturamaz

#### Adım 4: Data Volume (Database ve Loglar)

**Ayarlar:**
- **Type:** `Named Volume` (Coolify otomatik oluşturur)
- **Volume Name:** `hostingpoint-backend-data` (veya istediğiniz isim)
- **Container Path:** `/app/data`
- **Description:** "Database and application data"

**Alternatif (Host Path kullanmak isterseniz):**
- **Type:** `Bind Mount`
- **Host Path:** `/data/coolify/volumes/hostingpoint/backend-data`
- **Container Path:** `/app/data`

#### Adım 5: Customers Directory (Forum Verileri)

Forum verilerinin kalıcı olması için:

**Ayarlar:**
- **Type:** `Bind Mount`
- **Host Path:** `/data/coolify/volumes/hostingpoint/customers` (veya istediğiniz path)
- **Container Path:** `/app/customers`
- **Description:** "Customer forum data directory"

**Not:** Bu dizin otomatik oluşturulur, ancak manuel oluşturmak isterseniz:
```bash
sudo mkdir -p /data/coolify/volumes/hostingpoint/customers
sudo chown -R 1000:1000 /data/coolify/volumes/hostingpoint/customers
```

### 2. Frontend Service için Volume'lar

Frontend genellikle volume gerektirmez (static files build zamanında oluşturulur), ancak gerekirse:

- **Type:** `Named Volume`
- **Volume Name:** `hostingpoint-frontend-data`
- **Container Path:** `/usr/share/nginx/html` (opsiyonel)

### 3. Volume Kontrolü

Volume'ları ekledikten sonra:

1. **Service'i Redeploy edin**
2. **Container'a bağlanıp kontrol edin:**
   ```bash
   # Coolify'dan container'a bağlanın veya SSH ile:
   docker exec -it hostingpoint-backend sh
   
   # Volume'ları kontrol edin:
   ls -la /var/run/docker.sock  # Docker socket var mı?
   ls -la /app/data             # Data directory var mı?
   ls -la /app/customers        # Customers directory var mı?
   ```

### 4. Sorun Giderme

#### Sorun: "Permission denied" hatası
```bash
# Host'ta dizin izinlerini düzeltin
sudo chown -R 1000:1000 /data/coolify/volumes/hostingpoint/
sudo chmod -R 755 /data/coolify/volumes/hostingpoint/
```

#### Sorun: Docker socket bulunamıyor
- Host path'in doğru olduğundan emin olun: `/var/run/docker.sock`
- Read-only olarak mount edildiğinden emin olun
- Container'ın Docker socket'e erişim izni olduğundan emin olun

#### Sorun: Volume'lar görünmüyor
- Service'i redeploy edin
- Container loglarını kontrol edin: `docker logs hostingpoint-backend`
- Coolify'da volume ayarlarını tekrar kontrol edin

### 5. Örnek Volume Yapılandırması

**Backend Service için tam liste:**

| Type | Host Path | Container Path | Read Only | Açıklama |
|------|-----------|----------------|-----------|----------|
| Bind Mount | `/var/run/docker.sock` | `/var/run/docker.sock` | ✅ Yes | Docker API |
| Named Volume | `hostingpoint-backend-data` | `/app/data` | ❌ No | Database |
| Bind Mount | `/data/coolify/volumes/hostingpoint/customers` | `/app/customers` | ❌ No | Forum data |

### 6. Coolify UI'da Volume Ekleme (Docker Compose ile)

Eğer "Volumes" sekmesi yoksa, Docker Compose dosyasını kullanın:

#### Adım 1: Service'i Açın
1. Coolify Dashboard → Service'inizi seçin (Backend)

#### Adım 2: Docker Compose Sekmesine Gidin
1. **"Docker Compose"** veya **"Configuration"** sekmesini bulun
2. Docker Compose içeriğini düzenleyin

#### Adım 3: Volume'ları Ekleyin

Backend service için Docker Compose'a şunu ekleyin:

```yaml
services:
  backend:
    # ... diğer ayarlar ...
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro  # Docker socket (READ-ONLY!)
      - backend-data:/app/data                        # Database
      - ./customers:/app/customers                    # Forum data (host path)

volumes:
  backend-data:  # Named volume
```

**ÖNEMLİ:** `/var/run/docker.sock` mutlaka `:ro` (read-only) ile mount edilmeli!

#### Adım 4: Kaydet ve Redeploy
1. "Save" veya "Update" butonuna tıklayın
2. Service'i redeploy edin

### 7. Alternatif: Coolify'ın Otomatik Volume Yönetimi

Coolify bazı durumlarda volume'ları otomatik yönetir. Eğer Docker Compose sekmesi de yoksa:

1. **Service Settings → Advanced** bölümüne gidin
2. **"Docker Socket"** veya **"Privileged Mode"** seçeneğini arayın
3. Docker socket erişimi için gerekli izinleri verin

### 8. Manuel Docker Compose Dosyası Kullanımı

Eğer Coolify UI'da volume ekleyemiyorsanız, `docker-compose.coolify.yml` dosyasını kullanın:

1. Repository'nize `docker-compose.coolify.yml` dosyasını ekleyin (zaten var)
2. Coolify'da service oluştururken bu dosyayı seçin
3. Volume'lar otomatik olarak yüklenecek

### 7. Önemli Notlar

⚠️ **DİKKAT:**
- Docker socket mount **MUTLAKA** read-only olmalı (güvenlik)
- Volume'ları ekledikten sonra service'i redeploy etmeyi unutmayın
- Host path'ler Coolify sunucusunda mevcut olmalı
- Named volume'lar Coolify tarafından otomatik yönetilir
- Bind mount'lar için host dizinlerini manuel oluşturmanız gerekebilir

### 8. Test

Volume'ları ekledikten sonra test edin:

```bash
# Backend container'a bağlan
docker exec -it hostingpoint-backend sh

# Docker socket kontrolü
ls -la /var/run/docker.sock
# Çıktı: srw-rw---- 1 root docker 0 ... /var/run/docker.sock

# Data directory kontrolü
ls -la /app/data
# Çıktı: database.sqlite dosyası görünmeli

# Customers directory kontrolü
ls -la /app/customers
# Çıktı: Boş olabilir (henüz forum yoksa)
```

### 9. Hızlı Kontrol Scripti

Backend container içinde çalıştırın:

```bash
echo "=== Volume Kontrolü ==="
echo "Docker Socket:"
[ -S /var/run/docker.sock ] && echo "✅ Var" || echo "❌ Yok"

echo "Data Directory:"
[ -d /app/data ] && echo "✅ Var" || echo "❌ Yok"

echo "Customers Directory:"
[ -d /app/customers ] && echo "✅ Var" || echo "❌ Yok"

echo "Write Permission Test:"
touch /app/data/test.txt 2>/dev/null && echo "✅ Yazılabilir" || echo "❌ Yazılamaz"
rm -f /app/data/test.txt
```

---

**Başarılar! 🚀**

