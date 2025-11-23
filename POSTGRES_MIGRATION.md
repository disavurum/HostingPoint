# PostgreSQL Migration Rehberi

## 📋 PostgreSQL Bilgileriniz

- **Host:** `postgresql-database-poc0cok0kok8c0okow04gows` (container name)
- **Database:** `postgres`
- **Username:** `postgres`
- **Password:** `xpxJozAfxiP5QURDDP8HNK1YrB8kfSRx7u6F6sR2jCXWfomm0VsUV9mfnpwOuvF1`
- **Image:** `supabase/postgres:17.4.1.032`

---

## 🔄 SQLite'den PostgreSQL'e Geçiş

### Adım 1: PostgreSQL Package Yükleyin

```bash
cd backend
npm install pg
```

### Adım 2: Environment Variables Ekleyin

Backend service'inize (Coolify'da) şu environment variable'ları ekleyin:

```env
# PostgreSQL Configuration
USE_POSTGRES=true
POSTGRES_HOST=postgresql-database-poc0cok0kok8c0okow04gows
POSTGRES_PORT=5432
POSTGRES_DATABASE=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=xpxJozAfxiP5QURDDP8HNK1YrB8kfSRx7u6F6sR2jCXWfomm0VsUV9mfnpwOuvF1
POSTGRES_SSL=false
```

**Önemli:** 
- `POSTGRES_HOST` değeri container name olmalı (Docker network içinde)
- Eğer farklı bir network'teyse, IP adresi veya hostname kullanın
- `POSTGRES_PASSWORD`'u Secret olarak işaretleyin

### Adım 3: Backend'i Restart Edin

Backend service'ini restart edin.

### Adım 4: Kontrol

1. Backend loglarını kontrol edin:
   ```bash
   docker logs hostingpoint-backend | grep -i postgres
   ```

2. Şu mesajları görmelisiniz:
   - ✅ "Using PostgreSQL database"
   - ✅ "Connected to PostgreSQL database"

---

## 🔄 Veri Aktarımı (Opsiyonel)

Eğer mevcut SQLite verilerinizi PostgreSQL'e aktarmak isterseniz:

1. SQLite database'i yedekleyin
2. Migration script'i çalıştırın (oluşturulacak)
3. Verileri kontrol edin

---

## ⚠️ Önemli Notlar

1. **Email Unique Constraint:** PostgreSQL'de email unique constraint otomatik çalışır
2. **Case-Insensitive Email:** Email'ler lowercase olarak kaydedilir
3. **Geri Dönüş:** `USE_POSTGRES=false` yaparak SQLite'a dönebilirsiniz

---

## 🐛 Sorun Giderme

### "Connection refused" hatası
- `POSTGRES_HOST` değerinin doğru olduğundan emin olun
- Container'ların aynı network'te olduğundan emin olun
- PostgreSQL container'ının çalıştığından emin olun

### "Authentication failed" hatası
- `POSTGRES_USER` ve `POSTGRES_PASSWORD` değerlerini kontrol edin
- Password'un doğru olduğundan emin olun

### "Database does not exist" hatası
- `POSTGRES_DATABASE` değerini kontrol edin
- Database'in mevcut olduğundan emin olun

---

**Not:** PostgreSQL entegrasyonu hazır. `USE_POSTGRES=true` yaparak aktif edebilirsiniz.

