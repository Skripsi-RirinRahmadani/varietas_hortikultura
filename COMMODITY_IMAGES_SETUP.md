# Setup Commodity Images - Memasukkan Gambar Komoditas ke Database

## Overview

Fitur ini memungkinkan gambar komoditas disimpan di field `image_url` pada tabel `commodities` di Supabase, sehingga dapat dikelola melalui dashboard admin.

## Step-by-Step Setup

### 1. **Pastikan Gambar Sudah Ada di Public Folder**

Semua gambar komoditas sudah tersedia di folder `public/`:
```
public/
├── bayam.png
├── cabe_besar.png
├── cabe_keriting.png
├── cabe_rawit.png
├── kacang_panjang.png
├── kangkung.png
├── ketimun.png
├── semangka.png
├── terung.png
└── tomat.png
```

### 2. **Run Migration di Supabase**

#### Option A: Menggunakan SQL Editor (Recommended)
1. Buka Supabase Dashboard → SQL Editor
2. Copy seluruh isi dari file `migrations/add_commodity_images.sql`
3. Paste ke SQL Editor
4. Klik "Run" untuk execute

#### Option B: Manual Update
Jika hanya ingin update komoditas tertentu, gunakan query:

```sql
UPDATE commodities 
SET image_url = '/nama_file.png' 
WHERE name = 'Nama Komoditas';
```

Contoh untuk semua komoditas:
```sql
UPDATE commodities SET image_url = '/ketimun.png' WHERE name = 'Ketimun';
UPDATE commodities SET image_url = '/kacang_panjang.png' WHERE name = 'Kacang Panjang';
UPDATE commodities SET image_url = '/kangkung.png' WHERE name = 'Kangkung';
UPDATE commodities SET image_url = '/terung.png' WHERE name = 'Terung';
UPDATE commodities SET image_url = '/cabe_rawit.png' WHERE name = 'Cabe Rawit';
UPDATE commodities SET image_url = '/cabe_keriting.png' WHERE name = 'Cabe Keriting';
UPDATE commodities SET image_url = '/cabe_besar.png' WHERE name = 'Cabe Besar';
UPDATE commodities SET image_url = '/tomat.png' WHERE name = 'Tomat';
UPDATE commodities SET image_url = '/semangka.png' WHERE name = 'Semangka';
UPDATE commodities SET image_url = '/bayam.png' WHERE name = 'Bayam';
```

### 3. **Verify Updates**

```sql
SELECT id, name, image_url 
FROM commodities 
WHERE image_url IS NOT NULL 
ORDER BY name;
```

Output yang diharapkan:
```
id                                 | name              | image_url
---|---|---
xxxxx-xxxxx | Bayam             | /bayam.png
xxxxx-xxxxx | Cabe Besar        | /cabe_besar.png
xxxxx-xxxxx | Cabe Keriting     | /cabe_keriting.png
xxxxx-xxxxx | Cabe Rawit        | /cabe_rawit.png
xxxxx-xxxxx | Kacang Panjang    | /kacang_panjang.png
xxxxx-xxxxx | Kangkung          | /kangkung.png
xxxxx-xxxxx | Ketimun           | /ketimun.png
xxxxx-xxxxx | Semangka          | /semangka.png
xxxxx-xxxxx | Terung            | /terung.png
xxxxx-xxxxx | Tomat             | /tomat.png
```

### 4. **Clear Cache & Test**

1. Clear browser cache atau gunakan incognito mode
2. Buka dashboard: `http://localhost:3000/dashboard`
3. Verify gambar komoditas sudah tampil

## How It Works

### Dashboard Page Flow

```
1. Page Load (/dashboard/page.tsx)
   ↓
2. Fetch commodities dari Supabase
   ↓
3. Format data dengan image URL dari database
   ↓
4. Fallback ke default image jika tidak ada di database
   ↓
5. Display gallery dengan gambar dari database
```

### Code Changes

#### `app/dashboard/page.tsx`
- Tambah `Commodity` type import
- Fetch commodities dari Supabase saat page load
- Format data dengan `getDefaultImageUrl()` helper (fallback)
- Render gallery menggunakan `commodities` state

#### Helper Functions
```typescript
// Default image URL fallback
const getDefaultImageUrl = (name: string): string => {
  const imageMap: Record<string, string> = {
    'Ketimun': '/ketimun.png',
    'Kacang Panjang': '/kacang_panjang.png',
    // ... etc
  };
  return imageMap[name] || '/horticulture_hero.png';
};

// Default varieties untuk setiap komoditas
const getDefaultVarieties = (name: string): string[] => {
  const varietiesMap: Record<string, string[]> = {
    'Ketimun': ['Hercules F1', 'Mercy F1', 'Roman F1'],
    // ... etc
  };
  return varietiesMap[name] || [];
};
```

## Image URL Format

### Relative Path (Recommended untuk Development)
```
/ketimun.png  → Akan resolve ke https://domain.com/ketimun.png
```

### Absolute URL (untuk External Images)
```
https://example.com/images/ketimun.png
```

## Future Enhancements

### 1. Supabase Storage (Production)
Untuk production, sebaiknya upload gambar ke Supabase Storage:

```typescript
// Upload gambar ke Supabase Storage
const { data, error } = await supabase.storage
  .from('commodities')
  .upload(`public/${file.name}`, file);

// Dapatkan public URL
const { data: publicUrl } = supabase.storage
  .from('commodities')
  .getPublicUrl(`public/${file.name}`);

// Update database dengan public URL
await supabase
  .from('commodities')
  .update({ image_url: publicUrl.publicUrl })
  .eq('id', commodityId);
```

### 2. Admin Image Manager
Tambah fitur di `/dashboard/data` untuk upload gambar langsung:
- Form upload untuk setiap komoditas
- Preview gambar sebelum save
- Automatic resize dan optimization

### 3. Image CDN
Gunakan image CDN untuk caching dan optimization:
- Cloudinary
- Imgix
- AWS CloudFront

## Troubleshooting

### Problem: Gambar tidak tampil
**Solution:**
1. Verify `image_url` tidak null di database
2. Check path di URL (relative vs absolute)
3. Clear browser cache
4. Check network tab di DevTools untuk 404 errors

### Problem: "Gambar tidak tersedia" message
**Solution:**
1. Database belum di-update dengan image URL
2. Pastikan field `image_url` bukan NULL
3. Path file harus sesuai dengan nama file di public folder

### Problem: Gambar blur atau low quality
**Solution:**
1. Check source image resolution
2. Ensure image aspect ratio 3:4 (optimal untuk gallery)
3. Recommended size: 400x500px atau lebih

## File References

- **Migration**: `migrations/add_commodity_images.sql`
- **Component**: `app/dashboard/page.tsx`
- **Images**: `public/*.png`
- **Database**: Supabase `commodities` table

## Testing Checklist

- [ ] SQL migration berhasil dirun
- [ ] Image URLs tersimpan di database
- [ ] Dashboard memuat gambar dari database
- [ ] Fallback image bekerja jika URL tidak ada
- [ ] Modal detail komoditas menampilkan gambar
- [ ] Responsive design tetap baik di semua ukuran

---

Last Updated: 2026-06-09
