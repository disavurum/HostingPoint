# Coolify Port Kontrolü ve Ayarları

## ✅ Dosya Kontrolü - Her Şey Doğru!

### Backend Dockerfile ✅
- **EXPOSE 3000** - Doğru
- **PORT=3000** environment variable - Doğru
- **CMD ["node", "server.js"]** - Doğru

### Frontend Dockerfile ✅
- **EXPOSE 80** - Doğru (nginx için)
- **nginx.conf** - Doğru (port 80 dinliyor)

### docker-compose.backend.yml ✅
- Port mapping yok (Coolify otomatik yapar) - Doğru
- **PORT=3000** environment variable - Doğru

### docker-compose.frontend.yml ✅
- Port mapping yok (Coolify otomatik yapar) - Doğru

---

## 🔧 Coolify'de Port Ayarları

Coolify genellikle EXPOSE directive'ini otomatik algılar, ama bazen manuel belirtmek gerekebilir.

### Backend Application:

1. **Coolify Dashboard:**
   - **backend** application → **Settings**
   - **Port** veya **Ports** sekmesine gidin

2. **Port ayarı:**
   - **Port:** `3000` yazın
   - Veya **EXPOSE** directive'i yeterli olmalı (otomatik algılanır)

### Frontend Application:

1. **Coolify Dashboard:**
   - **frontend** application → **Settings**
   - **Port** veya **Ports** sekmesine gidin

2. **Port ayarı:**
   - **Port:** `80` yazın
   - Veya **EXPOSE** directive'i yeterli olmalı (otomatik algılanır)

---

## 📋 Kontrol Listesi

- [x] Backend Dockerfile: EXPOSE 3000 ✅
- [x] Frontend Dockerfile: EXPOSE 80 ✅
- [x] docker-compose.backend.yml: Port mapping yok (Coolify otomatik) ✅
- [x] docker-compose.frontend.yml: Port mapping yok (Coolify otomatik) ✅
- [ ] Coolify Backend Application: Port 3000 ayarlanmış mı?
- [ ] Coolify Frontend Application: Port 80 ayarlanmış mı?

---

## 🆘 Eğer Port Sorunu Varsa

### Coolify'de Port Ayarlarını Kontrol Et:

1. **Application → Settings → Ports**
2. **Port** alanını kontrol edin:
   - Backend: `3000`
   - Frontend: `80`

### Veya Environment Variables:

Coolify'de environment variables'a ekleyin:

**Backend:**
```
PORT=3000
```

**Frontend:**
```
PORT=80
```

---

## 💡 İpucu

Coolify genellikle Dockerfile'daki EXPOSE directive'ini otomatik algılar. Eğer sorun varsa:

1. **Application → Settings → Ports**
2. Port'u manuel olarak belirtin
3. **Save** → **Redeploy**

---

## ✅ Sonuç

Dosyalarınız **tamamen doğru**! Port ayarları:
- Backend: **3000** ✅
- Frontend: **80** ✅

Eğer Coolify'de sorun varsa, port'u manuel olarak belirtmeyi deneyin.

