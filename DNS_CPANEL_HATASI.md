# cPanel Hatası - DNS Sorunu Çözümü

## 🚨 Sorun

Domain'iniz eski bir hosting sağlayıcısının (cPanel) sunucusuna yönlendirilmiş. DNS kayıtları yanlış IP'ye işaret ediyor.

## ✅ Çözüm: DNS Kayıtlarını Düzelt

### Adım 1: EC2 Public IP'yi Öğren

EC2 sunucunuzda:

```bash
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

**Not:** Bu IP'yi not edin (örnek: `13.61.225.144`)

### Adım 2: Cloudflare DNS Ayarlarını Düzelt

1. **Cloudflare Dashboard'a girin:**
   - https://dash.cloudflare.com
   - `hostingpoint.net` domain'inizi seçin

2. **DNS sekmesine gidin:**
   - Sol menüden **DNS** → **Records**

3. **Mevcut A kayıtlarını kontrol edin:**
   - `@` (root domain) kaydını bulun
   - `api` kaydını bulun
   - `*` (wildcard) kaydını bulun

4. **IP adreslerini düzeltin:**
   - Her kaydın **Content** (IP) kısmını EC2 Public IP'nizle değiştirin
   - **Proxy status:** **Proxied** (turuncu bulut) olmalı

**Doğru DNS kayıtları şöyle olmalı:**

```
Type    Name    Content          Proxy Status    TTL
A       @       13.61.225.144    Proxied         Auto
A       *       13.61.225.144    Proxied         Auto
A       api     13.61.225.144    Proxied         Auto
```

**Önemli:**
- **Content** kısmı EC2 Public IP'niz olmalı
- **Proxy status** "Proxied" (turuncu bulut) olmalı
- Eski hosting sağlayıcısının IP'si varsa silin

### Adım 3: Eski Kayıtları Silin

Eğer eski hosting sağlayıcısının IP'sine işaret eden kayıtlar varsa:
- Kaydı bulun
- Sağdaki **"..."** menüsüne tıklayın
- **Delete** seçin

### Adım 4: DNS Cache'i Temizle

1. **Cloudflare'de:**
   - Caching → Purge Everything

2. **Bilgisayarınızda:**
   - Windows: `ipconfig /flushdns` (Command Prompt'ta)
   - Mac/Linux: `sudo dscacheutil -flushcache`

### Adım 5: Bekleyin

DNS değişikliklerinin yayılması:
- **Cloudflare üzerinden:** 1-5 dakika
- **Normal DNS:** 5-30 dakika (bazen 24 saate kadar)

---

## 🔍 DNS Kontrolü

### EC2'de Kontrol Et

```bash
# EC2 Public IP'yi öğren
curl http://169.254.169.254/latest/meta-data/public-ipv4

# DNS'in doğru yönlendirildiğini kontrol et
dig hostingpoint.net
nslookup hostingpoint.net
```

**Beklenen:** DNS sorgusu EC2 Public IP'nizi göstermeli.

### Cloudflare'de Kontrol Et

1. Cloudflare → DNS → Records
2. Her kaydın IP'sini kontrol edin
3. EC2 IP'nizle eşleşmeli

---

## 🚨 Yaygın Hatalar

### Hata 1: Eski IP Hala Kayıtlı

**Belirti:** Domain hala eski sunucuya yönlendiriliyor

**Çözüm:**
- Cloudflare'de tüm A kayıtlarını kontrol edin
- Eski IP'ye işaret eden kayıtları silin veya güncelleyin

### Hata 2: Nameserver'lar Yanlış

**Belirti:** DNS değişiklikleri etkisiz

**Çözüm:**
1. Domain registrar'ınıza gidin (domain'i aldığınız yer)
2. Nameserver'ları kontrol edin
3. Cloudflare nameserver'ları olmalı:
   ```
   [name].ns.cloudflare.com
   [name].ns.cloudflare.com
   ```

### Hata 3: Proxy Kapalı

**Belirti:** DNS doğru ama Cloudflare çalışmıyor

**Çözüm:**
- Cloudflare → DNS → Records
- Her kaydın yanındaki bulut ikonunu kontrol edin
- **Turuncu bulut** (Proxied) olmalı
- Gri bulut ise tıklayıp "Proxied" yapın

---

## 📋 Kontrol Listesi

- [ ] EC2 Public IP'yi öğrendim
- [ ] Cloudflare DNS kayıtlarını kontrol ettim
- [ ] Tüm A kayıtlarının IP'si EC2 IP'm ile eşleşiyor
- [ ] Eski IP'ye işaret eden kayıtları sildim
- [ ] Proxy status "Proxied" (turuncu bulut)
- [ ] DNS cache'i temizledim
- [ ] 5-10 dakika bekledim

---

## ⚡ Hızlı Düzeltme

1. **EC2 IP'yi öğren:**
   ```bash
   curl http://169.254.169.254/latest/meta-data/public-ipv4
   ```

2. **Cloudflare'de DNS kayıtlarını güncelle:**
   - DNS → Records
   - Her A kaydının IP'sini EC2 IP'nizle değiştir
   - Proxy: Proxied (turuncu bulut)

3. **Bekle:** 5-10 dakika

4. **Test et:**
   ```bash
   dig hostingpoint.net
   ```

---

## 🆘 Hala Çalışmıyorsa

### Nameserver'ları Kontrol Et

Domain registrar'ınızda (GoDaddy, Namecheap, vs.) nameserver'lar Cloudflare olmalı:

```
[name].ns.cloudflare.com
[name].ns.cloudflare.com
```

### DNS Propagation Kontrolü

https://www.whatsmydns.net/#A/hostingpoint.net

Bu sitede DNS'in dünya genelinde yayıldığını kontrol edebilirsiniz.

### Container'ları Kontrol Et

```bash
cd ~/HostingPoint
docker compose ps
docker compose logs traefik
```

Tüm container'lar çalışıyor olmalı.

