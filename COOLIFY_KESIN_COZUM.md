# Coolify Kesin Çözüm: Dockerfile Yöntemi

Bu yöntem `docker-compose` dosyalarını **kullanmaz**. Doğrudan Dockerfile üzerinden build alır. En stabil yöntemdir.

---

## 🗑️ Adım 1: Temizlik

1. Coolify Dashboard'a gidin.
2. Mevcut, hata veren **backend** ve **frontend** uygulamalarının içine girin.
3. En alttaki **Delete Resource** butonuna basıp silin. (Tertemiz başlayalım)

---

## ⚙️ Adım 2: Backend Kurulumu

1. **New Resource** → **Application** seçin.
2. **Git Repository**'nizi seçin (`disavurum/HostingPoint`).
3. **Branch:** `master` (veya `main`) girin.
4. **Build Pack** olarak **Dockerfile** seçin (⚠️ Burası çok önemli, Docker Compose seçmeyin!).
5. **Continue** deyin.

### Backend Ayarları (Configuration)

Uygulama oluşturulduktan sonra **Settings** veya **General** sekmesinde şu ayarları yapın:

1. **Base Directory:** `/backend`
   - *(Burası önemli, Dockerfile'ın nerede olduğunu söyler)*
2. **Dockerfile Location:** `Dockerfile`
   - *(Base directory içindeki dosya adı)*
3. **Ports Exposes:** `3000`
4. **Domains:** `api.hostingpoint.net`
5. **Environment Variables** (Secrets):
   - Environment Variables sekmesine gidin ve ekleyin:
   ```env
   PORT=3000
   NODE_ENV=production
   JWT_SECRET=iKjJeT5Z7/GFEIhd+DTnr16Y5g0cac9omyxhs8PhPDI=
   DOMAIN=hostingpoint.net
   DB_PATH=/app/database/database.sqlite
   ```
6. **Storage (Veritabanı Kaybolmasın Diye):**
   - **Storage** sekmesine gidin.
   - **Add Persistent Volume** deyin.
   - **Mount Path:** `/app/database`
   - (Bu sayede restart atınca veritabanınız silinmez)
7. **Save** ve sağ üstten **Deploy**.

---

## 🎨 Adım 3: Frontend Kurulumu

1. Tekrar ana sayfaya dönün.
2. **New Resource** → **Application**.
3. **Git Repository** (`disavurum/HostingPoint`).
4. **Branch:** `master`.
5. **Build Pack:** **Dockerfile**.
6. **Continue**.

### Frontend Ayarları (Configuration)

1. **Base Directory:** `/frontend`
2. **Dockerfile Location:** `Dockerfile`
3. **Ports Exposes:** `80`
4. **Domains:** `hostingpoint.net`
5. **Environment Variables:**
   - `DOMAIN=hostingpoint.net`
6. **Save** ve **Deploy**.

---

## ✅ Neden Bu Yöntem?

- `docker-compose` dosyalarındaki "container_name", "network", "volume" çakışmalarını yaşamazsınız.
- Coolify her konteyneri kendi izole ortamında, kendi kurallarıyla yönetir.
- Port çakışması olmaz, Coolify otomatik proxy ayarı yapar.
- "No available server" hatası genellikle Coolify'in compose dosyasındaki port ayarını anlayamamasından kaynaklanır; bu yöntemde portu elle `3000` ve `80` olarak girdiğimiz için hata vermez.

---

## 🔍 Son Kontrol

Deploy bittikten sonra:
1. `https://api.hostingpoint.net/health` adresine gidin → `{status: ok}` dönmeli.
2. `https://hostingpoint.net` adresine gidin → Site açılmalı.

