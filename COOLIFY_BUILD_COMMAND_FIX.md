# Coolify Build Command Override - Rollup Hatası Çözümü

## 🚨 Sorun

`npm ci` komutu optional dependencies'i (`@rollup/rollup-linux-x64-gnu`) doğru şekilde yüklemiyor.

## ✅ Çözüm: Install Command Override

Coolify'de build komutunu override edin:

### Adım 1: Frontend Uygulaması Ayarları

1. **Coolify Dashboard:**
   - **Frontend** uygulaması → **Settings** → **General**

2. **Build bölümünde:**
   - **Install Command:** alanını bulun
   - Varsayılan: `npm ci` (veya boş)
   - **Değiştirin:** `npm install`
   
   Bu şekilde `npm ci` yerine `npm install` kullanılacak ve optional dependencies yüklenecek.

3. **Save** butonuna tıklayın

4. **Redeploy** yapın

---

## 📋 Alternatif: Build Command Override

Eğer "Install Command" alanı yoksa:

1. **Settings** → **General** → **Build** bölümü
2. **Build Command** alanını bulun
3. Şunu yazın:
   ```
   npm install && npm run build
   ```
4. **Save** → **Redeploy**

---

## 🔍 Neden Bu Çözüm?

- `npm ci` → Sadece `package-lock.json`'daki paketleri yükler, optional dependencies'i atlayabilir
- `npm install` → Tüm dependencies'i (optional dahil) yükler

Linux container'da `@rollup/rollup-linux-x64-gnu` paketi yüklenecek ve build başarılı olacak.

---

## ✅ Kontrol

Deploy başarılı olduğunda:
- ✅ `npm install` çalıştı
- ✅ `@rollup/rollup-linux-x64-gnu` yüklendi
- ✅ `npm run build` başarılı
- ✅ Frontend deploy edildi

