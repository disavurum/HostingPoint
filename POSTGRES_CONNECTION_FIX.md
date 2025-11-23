# PostgreSQL Bağlantı Sorunu Çözümü

## ❌ Hata: `getaddrinfo EAI_AGAIN postgresql-database-poc0cok0kok8c0okow04gows`

Bu hata, PostgreSQL container'ına bağlanılamadığını gösterir. Container name çözülemiyor.

---

## ✅ Çözüm: Otomatik Fallback Eklendi

Artık PostgreSQL'e bağlanılamazsa otomatik olarak SQLite'a geçiş yapılacak.

---

## 🔍 PostgreSQL Container'ını Kontrol Edin

### 1. Container'ın Çalıştığını Kontrol Edin

```bash
docker ps | grep postgres
```

### 2. Container Name'i Kontrol Edin

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
```

Container name'i not edin. Genellikle:
- `postgresql-database-poc0cok0kok8c0okow04gows`
- `postgres`
- `postgresql`
- veya başka bir isim

### 3. Network'ü Kontrol Edin

```bash
# Backend container'ının network'ünü bulun
docker inspect hostingpoint-backend | grep NetworkMode

# PostgreSQL container'ının network'ünü bulun
docker inspect postgresql-database-poc0cok0kok8c0okow04gows | grep NetworkMode
```

**Önemli:** Her iki container da aynı network'te olmalı!

### 4. Container'ları Aynı Network'e Bağlayın

Eğer farklı network'lerdeyse:

```bash
# Network'ü bulun
docker network ls

# Backend'in network'ünü not edin
docker inspect hostingpoint-backend | grep -A 10 Networks

# PostgreSQL'i aynı network'e bağlayın
docker network connect <network-name> postgresql-database-poc0cok0kok8c0okow04gows
```

---

## 🔧 Environment Variable'ları Güncelleyin

### Seçenek 1: Container Name (Aynı Network'te)

```env
POSTGRES_HOST=postgresql-database-poc0cok0kok8c0okow04gows
```

### Seçenek 2: IP Adresi

PostgreSQL container'ının IP'sini bulun:

```bash
docker inspect postgresql-database-poc0cok0kok8c0okow04gows | grep IPAddress
```

Sonra:

```env
POSTGRES_HOST=172.17.0.2
```

### Seçenek 3: localhost (Aynı Container'da)

Eğer PostgreSQL ve Backend aynı container'daysa:

```env
POSTGRES_HOST=localhost
```

---

## 🧪 Test

### 1. Backend Container'ından Test

```bash
# Backend container'ına bağlanın
docker exec -it hostingpoint-backend sh

# PostgreSQL'e ping atın
ping postgresql-database-poc0cok0kok8c0okow04gows

# veya IP ile
ping 172.17.0.2
```

### 2. PostgreSQL Bağlantısını Test Edin

```bash
# Backend container'ından
docker exec -it hostingpoint-backend sh

# psql ile test (eğer yüklüyse)
psql -h postgresql-database-poc0cok0kok8c0okow04gows -U postgres -d postgres
```

---

## 📝 Önerilen POSTGRES_HOST Değerleri

| Durum | POSTGRES_HOST Değeri |
|-------|---------------------|
| Aynı network, container name | `postgresql-database-poc0cok0kok8c0okow04gows` |
| Aynı network, farklı name | Container'ın gerçek adı |
| Farklı network | IP adresi |
| Aynı container | `localhost` |

---

## ⚠️ Önemli Notlar

1. **Fallback Aktif:** PostgreSQL'e bağlanılamazsa otomatik olarak SQLite kullanılacak
2. **Log Kontrolü:** Backend loglarında hangi database'in kullanıldığını görebilirsiniz:
   - ✅ "Using PostgreSQL database" - PostgreSQL kullanılıyor
   - ✅ "Connected to SQLite database" - SQLite kullanılıyor (fallback)
3. **USE_POSTGRES=false:** Eğer PostgreSQL kullanmak istemiyorsanız, `USE_POSTGRES=false` yapın

---

## 🐛 Sorun Giderme

### "getaddrinfo EAI_AGAIN" hatası devam ediyor

1. Container name'in doğru olduğundan emin olun
2. Container'ların aynı network'te olduğundan emin olun
3. PostgreSQL container'ının çalıştığından emin olun
4. IP adresini kullanmayı deneyin

### Fallback çalışmıyor

1. Backend loglarını kontrol edin
2. SQLite database dosyasının yazılabilir olduğundan emin olun
3. `USE_POSTGRES=false` yaparak zorla SQLite kullanın

---

**Not:** Artık PostgreSQL bağlantısı başarısız olsa bile uygulama SQLite ile çalışmaya devam edecek!

