# Database Bilgileri - HostingPoint

## Ana Platform Database (SQLite)

Platform ana veritabanı olarak **SQLite** kullanıyor. PostgreSQL değil!

### Bağlantı Bilgileri:

- **Database Type:** SQLite
- **Database Path:** `backend/database.sqlite` (veya `backend/data/database.sqlite`)
- **Environment Variable:** `DB_PATH` (varsayılan: `./database.sqlite`)
- **Host:** Yok (file-based)
- **Port:** Yok
- **Username:** Yok
- **Password:** Yok
- **Database Name:** `database.sqlite` (dosya adı)

### Tablolar:

1. **users** - Kullanıcı bilgileri
   - id (INTEGER PRIMARY KEY AUTOINCREMENT)
   - email (TEXT UNIQUE)
   - password (TEXT - bcrypt hash)
   - name (TEXT)
   - plan_type (TEXT DEFAULT 'starter')
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)
   - is_admin (INTEGER DEFAULT 0)
   - is_active (INTEGER DEFAULT 1)

2. **forums** - Forum kayıtları
   - id (INTEGER PRIMARY KEY AUTOINCREMENT)
   - name (TEXT UNIQUE)
   - user_id (INTEGER - foreign key to users.id)
   - email (TEXT)
   - domain (TEXT)
   - custom_domain (TEXT - nullable)
   - status (TEXT DEFAULT 'deploying')
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

### Database Dosyası Konumu:

**Development:**
```
backend/database.sqlite
```

**Production (Coolify):**
```
/app/data/database.sqlite
```

**Environment Variable ile:**
```env
DB_PATH=/app/data/database.sqlite
```

---

## Discourse Forum Database (PostgreSQL)

Her forum için **ayrı bir PostgreSQL container'ı** oluşturuluyor. Her forumun kendi PostgreSQL instance'ı var.

### Bağlantı Bilgileri (Her Forum İçin):

- **Database Type:** PostgreSQL 15 (Alpine)
- **Host:** `postgres-{forumName}` (Docker container name)
- **Port:** `5432` (internal Docker network)
- **Username:** `discourse`
- **Password:** Her forum için **rastgele UUID** oluşturuluyor
- **Database Name:** `discourse`

### Örnek Forum PostgreSQL Bilgileri:

**Forum Name:** `app-abc12345`

- **Container Name:** `discourse-postgres-app-abc12345`
- **Host:** `postgres-app-abc12345` (Docker network içinde)
- **Port:** `5432`
- **Username:** `discourse`
- **Password:** `{rastgele-uuid}` (her kurulumda farklı)
- **Database:** `discourse`

### Şifreler Nerede?

PostgreSQL şifreleri:
- Her forum kurulumunda **rastgele UUID** olarak oluşturuluyor
- `backend/services/DeployService.js` içinde `uuidv4()` ile generate ediliyor
- `docker-compose.yml` dosyasında environment variable olarak set ediliyor
- **Veritabanında saklanmıyor** - sadece docker-compose.yml'de

### Şifreye Erişim:

Eğer bir forumun PostgreSQL şifresine ihtiyacınız varsa:

1. Forum'un `customers/{forumName}/docker-compose.yml` dosyasını açın
2. `POSTGRES_PASSWORD` veya `POSTGRESQL_PASSWORD` environment variable'ını bulun

**Örnek:**
```yaml
services:
  postgres-app-abc12345:
    environment:
      - POSTGRES_PASSWORD=abc123def456ghi789...
      - POSTGRES_USER=discourse
      - POSTGRES_DB=discourse
```

---

## Redis (Her Forum İçin)

Her forum için ayrı bir Redis container'ı da var:

- **Container Name:** `discourse-redis-{forumName}`
- **Host:** `redis-{forumName}` (Docker network içinde)
- **Port:** `6379`
- **Password:** Her forum için **rastgele UUID** (PostgreSQL ile aynı mantık)

---

## Özet

| Database | Type | Host | Port | Username | Password | Database |
|----------|------|------|------|----------|----------|----------|
| **Platform Ana DB** | SQLite | - | - | - | - | `database.sqlite` |
| **Forum PostgreSQL** | PostgreSQL 15 | `postgres-{forumName}` | 5432 | `discourse` | Rastgele UUID | `discourse` |
| **Forum Redis** | Redis 7 | `redis-{forumName}` | 6379 | - | Rastgele UUID | - |

---

## Database Erişim Komutları

### SQLite (Platform Ana DB):

```bash
# SQLite database'e bağlan
sqlite3 backend/database.sqlite

# Tüm forumları listele
SELECT * FROM forums;

# Tüm kullanıcıları listele
SELECT * FROM users;

# Bir kullanıcının forumlarını listele
SELECT * FROM forums WHERE user_id = 1;
```

### PostgreSQL (Forum Database):

```bash
# Forum'un PostgreSQL container'ına bağlan
docker exec -it discourse-postgres-{forumName} psql -U discourse -d discourse

# Veya host'tan (eğer port expose edilmişse)
psql -h localhost -p {PORT} -U discourse -d discourse
```

---

**Not:** Production'da PostgreSQL container'ları sadece Docker network içinde erişilebilir. Dışarıdan erişim için port mapping gerekir.

