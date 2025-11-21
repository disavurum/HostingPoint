# Coolify Deploy Sorunları ve Çözümleri

## 🚨 Hata: "Remote branch main not found"

### Sorun

Coolify, GitHub repository'nizde `main` branch'ini bulamıyor.

### Çözüm 1: Branch Adını Kontrol Et

1. **GitHub'da repository'nize gidin:**
   ```
   https://github.com/disavurum/HostingPoint
   ```

2. **Branch'leri kontrol edin:**
   - Repository sayfasında **"main"** veya **"master"** yazısına bakın
   - Veya **"branches"** linkine tıklayın
   - Hangi branch'lerin olduğunu görün

3. **Coolify'de branch adını düzeltin:**
   - Application settings → **Branch** → Doğru branch adını girin
   - Eğer `master` ise → `master` yazın
   - Eğer başka bir branch ise → O branch adını yazın

### Çözüm 2: Repository Public mi?

Eğer repository **private** ise:

1. **Coolify'de Git Provider ayarları:**
   - Settings → **Git Providers**
   - GitHub'ı bağlayın
   - Personal Access Token ekleyin

2. **GitHub Personal Access Token oluştur:**
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - **Generate new token**
   - **repo** scope'unu seçin
   - Token'ı kopyalayın

3. **Coolify'de token'ı ekle:**
   - Settings → Git Providers → GitHub
   - Token'ı yapıştırın

### Çözüm 3: Repository URL'ini Kontrol Et

Coolify'de repository URL'i doğru mu?

**Doğru format:**
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

## 🔍 Hızlı Kontrol

### 1. GitHub'da Branch Kontrolü

```bash
# Kendi bilgisayarınızdan
git ls-remote --heads https://github.com/disavurum/HostingPoint
```

Bu komut tüm branch'leri gösterir.

### 2. Repository Public mi?

Tarayıcıda şu URL'i açın:
```
https://github.com/disavurum/HostingPoint
```

Eğer "Private" yazıyorsa → Token gerekli
Eğer "Public" yazıyorsa → Token gerekmez

---

## ✅ Doğru Ayarlar

### Coolify Application Settings:

1. **Repository URL:**
   ```
   https://github.com/disavurum/HostingPoint
   ```

2. **Branch:**
   - `main` (eğer main branch varsa)
   - `master` (eğer master branch varsa)
   - Veya başka branch adı

3. **Build Pack:**
   - Docker Compose

4. **Docker Compose File:**
   ```
   docker-compose.coolify.yml
   ```

5. **Service:**
   - Backend için: `backend`
   - Frontend için: `frontend`

---

## 🆘 Hala Çalışmıyorsa

### Manuel Kontrol

1. **GitHub'da repository'yi açın**
2. **Branch'leri kontrol edin**
3. **Repository public mi private mı kontrol edin**
4. **Coolify'de ayarları tekrar kontrol edin**

### Alternatif: Repository'yi Public Yap

Eğer repository private ise ve token eklemek istemiyorsanız:

1. GitHub → Repository → Settings
2. **Danger Zone** → **Change visibility**
3. **Make public** seçin

**Not:** Public yapmak güvenlik riski olabilir. Token kullanmak daha güvenlidir.

---

## 📝 Notlar

- Coolify, GitHub repository'nize erişebilmeli
- Branch adı tam olarak eşleşmeli (büyük/küçük harf duyarlı)
- Private repository'ler için token gerekli
- Public repository'ler için token gerekmez

