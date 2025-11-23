# Coolify Entegrasyonu - Yapılacaklar Listesi

## ✅ Kurulum Adımları

### 1. Coolify Kurulumu
- [ ] Coolify'ı sunucunuza kurun
- [ ] Coolify Dashboard'a erişebildiğinizi kontrol edin
- [ ] Server'ı Coolify'a ekleyin

### 2. API Key Oluşturma
- [ ] Coolify Dashboard → Settings → API Tokens
- [ ] Yeni token oluşturun
- [ ] Token'ı güvenli bir yere kaydedin
- [ ] Token'a tüm izinleri verin

### 3. Server ID Bulma
- [ ] Coolify Dashboard → Servers
- [ ] Kullanmak istediğiniz server'ı seçin
- [ ] Server ID'yi not edin (genellikle URL'de görünür)

### 4. Environment Variables
Backend service'inize şu environment variable'ları ekleyin:

```env
USE_COOLIFY=true
COOLIFY_URL=http://coolify:8000
COOLIFY_API_KEY=your-api-key-here
COOLIFY_SERVER_ID=1
```

- [ ] `USE_COOLIFY=true` ekleyin
- [ ] `COOLIFY_URL` ayarlayın
- [ ] `COOLIFY_API_KEY` ekleyin
- [ ] `COOLIFY_SERVER_ID` ekleyin

### 5. Dependencies
- [ ] Backend'de `npm install axios` çalıştırın (zaten yapıldı)
- [ ] Backend'i restart edin

### 6. Test
- [ ] Backend loglarını kontrol edin
- [ ] Dashboard'dan test forum kurun
- [ ] Coolify Dashboard'da proje oluştuğunu kontrol edin
- [ ] Forum'un deploy edildiğini kontrol edin

---

## 🔍 Kontrol Listesi

### Coolify Yapılandırması
- [ ] Coolify çalışıyor mu?
- [ ] API erişilebilir mi?
- [ ] Server eklendi mi?
- [ ] Let's Encrypt aktif mi?

### Backend Yapılandırması
- [ ] Environment variables ayarlandı mı?
- [ ] Backend restart edildi mi?
- [ ] Loglar hatasız mı?

### Test
- [ ] Yeni forum kurulumu çalışıyor mu?
- [ ] Coolify'da proje oluşuyor mu?
- [ ] SSL sertifikası oluşuyor mu?
- [ ] Forum erişilebilir mi?

---

## 📝 Notlar

- Coolify URL'i sunucu yapılandırmanıza göre değişebilir
- API key'i güvenli tutun
- Server ID genellikle 1'dir (ilk server)
- DNS yayılımı 1-48 saat sürebilir

---

**Detaylı rehber için:** `COOLIFY_SETUP_GUIDE.md`

