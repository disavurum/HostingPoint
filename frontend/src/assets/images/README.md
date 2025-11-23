# Images Directory

Bu klasör pricing tablosu ve diğer görseller için kullanılır.

## Görsel Dosyaları

### Starter Plan Görseli
- **Dosya Adı:** `starter-plan.png` (veya `.jpg`, `.webp`)
- **Kullanım:** Pricing tablosunda Starter paketin üstünde gösterilir
- **Boyut Önerisi:** 800x400px veya benzer aspect ratio
- **Format:** PNG, JPG veya WebP

## Kullanım

Görselleri bu klasöre ekledikten sonra, HomePage.jsx'te şu şekilde kullanılır:

```jsx
<img
  src="/src/assets/images/starter-plan.png"
  alt="Starter Plan"
  className="w-full h-auto"
/>
```

**Not:** Vite build sırasında görselleri optimize eder. Production'da görseller `dist/assets/` klasörüne kopyalanır.

