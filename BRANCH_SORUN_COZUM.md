# Branch Sorunu - Hızlı Çözüm

## 🚨 Sorun

Coolify, `main` branch'ini bulamıyor. Repository'nizde farklı bir branch adı kullanılıyor olabilir.

---

## ✅ Hızlı Çözüm

### Adım 1: GitHub'da Branch Adını Bul

1. **Tarayıcıda şu URL'i açın:**
   ```
   https://github.com/disavurum/HostingPoint
   ```

2. **Branch adını kontrol edin:**
   - Repository sayfasının sol üst köşesinde branch adı görünür
   - Örnek: `master`, `main`, `develop`, `production` vb.
   - Veya **"branches"** linkine tıklayıp tüm branch'leri görebilirsiniz

### Adım 2: Coolify'de Branch Adını Düzelt

1. **Coolify Dashboard:**
   - Application → **Settings**
   - **Source** bölümüne gidin

2. **Branch alanını bulun:**
   - **Branch:** `main` yazıyor mu?
   - Eğer `main` yazıyorsa, doğru branch adını yazın:
     - `master` ise → `master` yazın
     - `develop` ise → `develop` yazın
     - Başka bir branch ise → O branch adını yazın

3. **Save** butonuna tıklayın

4. **Redeploy** yapın:
   - Application → **Deployments**
   - **Redeploy** butonuna tıklayın

---

## 🔍 Alternatif: Komut Satırından Kontrol

Kendi bilgisayarınızdan:

```bash
# Tüm branch'leri göster
git ls-remote --heads https://github.com/disavurum/HostingPoint

# Veya
git ls-remote --heads git@github.com:disavurum/HostingPoint.git
```

Bu komut tüm branch'leri listeler. Hangi branch'i kullanacağınızı görürsünüz.

---

## 📝 Örnek Senaryolar

### Senaryo 1: `master` Branch'i Var

**Coolify'de:**
- Branch: `master` yazın
- Save → Redeploy

### Senaryo 2: `develop` Branch'i Var

**Coolify'de:**
- Branch: `develop` yazın
- Save → Redeploy

### Senaryo 3: Başka Bir Branch Adı

**Coolify'de:**
- Branch: O branch adını yazın (örn: `production`, `staging`)
- Save → Redeploy

---

## ✅ Kontrol

Deploy başladıktan sonra:

1. **Application → Deployments**
2. **Logs** sekmesine bakın
3. Artık "Cloning..." mesajını görmelisiniz
4. Branch hatası olmamalı

---

## 🆘 Hala Çalışmıyorsa

### Repository Public mi?

Eğer repository **private** ise:

1. **Coolify Dashboard:**
   - Settings → **Git Providers**
   - GitHub'ı bağlayın
   - Personal Access Token ekleyin

2. **GitHub Personal Access Token:**
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - **Generate new token (classic)**
   - **repo** scope'unu seçin
   - Token'ı kopyalayın

3. **Coolify'de token'ı ekle:**
   - Settings → Git Providers → GitHub
   - Token'ı yapıştırın
   - Save

### Repository URL Doğru mu?

Coolify'de repository URL'i:
```
https://github.com/disavurum/HostingPoint
```

veya

```
disavurum/HostingPoint
```

**Yanlış format:**
```
git@github.com:disavurum/HostingPoint.git
```

---

## 💡 İpucu

En kolay yöntem:
1. GitHub'da repository'nize gidin
2. Sol üstteki branch adına bakın
3. Coolify'de o branch adını yazın
4. Save → Redeploy

Bu kadar! 🚀

