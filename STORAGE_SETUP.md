# Supabase Storage Setup - Gambar Komoditas & Varietas

## 📋 Overview

Fitur upload gambar untuk komoditas dan varietas langsung ke Supabase Storage. Semua gambar disimpan di cloud dan terintegrasi dengan dashboard data management.

## 🚀 Step-by-Step Setup

### Step 1: Create Storage Buckets

Buka Supabase Dashboard → Storage, create 2 buckets:

#### Bucket 1: `commodities`
```
Name: commodities
Public: ✅ (enable public access)
File size limit: 5 MB (default)
```

#### Bucket 2: `varieties`
```
Name: varieties
Public: ✅ (enable public access)
File size limit: 5 MB (default)
```

### Step 2: Configure RLS Policies (Optional)

Jika ingin restrict upload, set policies:

```sql
-- Allow admin upload to commodities
CREATE POLICY "Allow admin upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'commodities' AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Similar for varieties
CREATE POLICY "Allow admin upload varieties" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'varieties' AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

### Step 3: Test Upload

1. Login sebagai admin
2. Buka `/dashboard/data`
3. Klik tab **Komoditas** atau **Varietas**
4. Klik **Tambah** untuk add new item
5. Scroll ke field "Gambar Komoditas" / "Gambar Varietas"
6. Klik upload area dan select file gambar
7. Verify preview muncul
8. Klik **Simpan**

---

## 📁 File Structure

```
lib/
├── storage.ts           ← Storage helper functions (NEW)
├── types.ts             ← Updated Variety type dengan image_url
└── supabase.ts

components/
└── CommodityDialog.tsx  ← Updated dengan image upload

app/dashboard/data/
└── page.tsx             ← Updated TabVarietas & TabKomoditas
```

---

## 🔧 Code Implementation

### Storage Helper Functions (`lib/storage.ts`)

```typescript
export async function uploadFileToStorage(
  bucket: BucketName,
  file: File,
  folderPath: string = 'public'
): Promise<string | null>

export async function deleteFileFromStorage(
  bucket: BucketName,
  filePath: string
): Promise<boolean>

export function getStoragePublicUrl(
  bucket: BucketName,
  filePath: string
): string
```

### CommodityDialog Component

**Fitur:**
- 📸 Image preview (thumbnail)
- 📤 Drag-n-drop or click upload
- ✅ File validation (type, size)
- 🔄 Real-time upload progress
- 🗑️ Remove image button
- 🔗 Manual URL fallback

**File Validation:**
- Type: Image files only (image/*)
- Size: Max 5MB
- Format: PNG, JPG, WebP, etc.

### TabVarietas & TabKomoditas

**Upload Handler:**
```typescript
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  
  // Validation
  if (!file.type.startsWith('image/')) { ... }
  if (file.size > 5 * 1024 * 1024) { ... }
  
  // Upload
  setUploading(true);
  const publicUrl = await uploadFileToStorage(bucket, file, 'images');
  setForm(f => ({ ...f, image_url: publicUrl }));
};
```

---

## 🖼️ Image Management

### Upload Flow

```
1. User select gambar di form
   ↓
2. Client-side validation
   ├─ Type: must be image/*
   └─ Size: max 5MB
   ↓
3. Upload ke Supabase Storage
   ├─ Bucket: commodities atau varieties
   └─ Folder: /images/
   ↓
4. Get public URL
   ↓
5. Save URL ke database
   └─ commodities.image_url or varieties.image_url
```

### URL Structure

```
Commodities:
https://agwxkhvtbkdedaxjmgbv.supabase.co/storage/v1/object/public/commodities/images/[timestamp]-[random]-[filename]

Varieties:
https://agwxkhvtbkdedaxjmgbv.supabase.co/storage/v1/object/public/varieties/images/[timestamp]-[random]-[filename]
```

### File Naming

Filename di-generate otomatis untuk avoid conflicts:
```
Format: {timestamp}-{random}-{original_filename}
Example: 1718001234567-a7b9c-ketimun.png
```

---

## 📊 Database Updates

### Commodities Table
- Sudah punya `image_url` column
- Type: TEXT
- Nullable: YES

### Varieties Table
- **NEW:** Added `image_url` column
- Type: TEXT
- Nullable: YES
- Indexed: YES

---

## 🎨 UI Components

### Image Upload Widget

**Desktop:**
```
┌─────────────────────────────────┐
│ [Image Preview]                 │
│ ┌──────────────────────────┐    │
│ │ 📤 Klik upload gambar    │    │
│ │ Max 5MB                  │    │
│ └──────────────────────────┘    │
│ [Atau paste URL gambar...]      │
└─────────────────────────────────┘
```

**Mobile:**
```
┌──────────────────┐
│ [Image Preview]  │
│ ┌──────────────┐ │
│ │ 📤 Upload    │ │
│ │ 5MB max      │ │
│ └──────────────┘ │
│ [URL input...]   │
└──────────────────┘
```

---

## ✅ Testing Checklist

### Commodity Upload
- [ ] Login sebagai admin
- [ ] Navigate ke `/dashboard/data` → Komoditas
- [ ] Click "Tambah"
- [ ] Scroll ke image upload field
- [ ] Upload gambar (< 5MB)
- [ ] Preview muncul
- [ ] Edit gambar (replace)
- [ ] Remove gambar
- [ ] Click Simpan
- [ ] Verify image URL di database

### Variety Upload
- [ ] Navigate ke Varietas tab
- [ ] Repeat commodity tests
- [ ] Verify image_url field ada di database

### Image Validation
- [ ] Upload file bukan gambar (PDF) → Error
- [ ] Upload gambar > 5MB → Error
- [ ] Upload gambar valid → Success
- [ ] Manual URL paste → Works

### Edge Cases
- [ ] Upload, cancel, retry → Works
- [ ] Edit existing dengan gambar baru → Replace
- [ ] Delete item dengan gambar → Cleanup (optional)

---

## 🔍 Troubleshooting

### Problem: Upload button tidak berfungsi

**Solution:**
1. Verify buckets sudah dibuat di Supabase
2. Check bucket name: `commodities`, `varieties`
3. Verify public access enabled
4. Check browser console untuk errors

### Problem: "Gagal upload gambar"

**Solution:**
1. File size < 5MB?
2. File type = image?
3. Check Supabase connection
4. Check network tab di DevTools

### Problem: Image URL tidak di-save ke database

**Solution:**
1. Verify form submit berhasil
2. Check database field: `image_url`
3. Verify file terupload ke storage
4. Check RLS policies

### Problem: Preview tidak muncul

**Solution:**
1. Verify image upload berhasil (check storage)
2. Verify public URL correct
3. Check image file valid (corrupted?)
4. Try different image format

---

## 📝 File References

| File | Changes | Purpose |
|------|---------|---------|
| `lib/storage.ts` | ✨ NEW | Storage helper functions |
| `components/CommodityDialog.tsx` | 🔄 Updated | Image upload widget |
| `app/dashboard/data/page.tsx` | 🔄 Updated | TabVarietas + image handler |
| `schema.sql` | 🔄 Updated | Added varieties.image_url |

---

## 🔐 Security Considerations

### File Validation
```typescript
// Type validation
if (!file.type.startsWith('image/')) { error }

// Size validation
if (file.size > 5 * 1024 * 1024) { error }
```

### Storage Security
- Public read access (images for all users)
- Authenticated upload (admin only)
- RLS policies protect write access
- File naming with timestamp + random

### Best Practices
- ✅ Validate file type & size on client
- ✅ Use RLS policies for access control
- ✅ Unique filename to avoid conflicts
- ✅ Proper error handling

---

## 🚀 Future Enhancements

### 1. Image Optimization
```typescript
// Resize image before upload
const resized = await resizeImage(file, 400, 500);
const url = await uploadFileToStorage(bucket, resized);
```

### 2. Multiple Images
```typescript
// Support gallery dengan multiple images
commodities.gallery: string[] // JSON array of URLs
```

### 3. Image Compression
```typescript
// Use Supabase Edge Functions untuk compress
// atau use client-side compression library
```

### 4. Bulk Upload
```typescript
// CSV dengan image URLs
// Auto-download & upload dari external URLs
```

### 5. Image CDN
```typescript
// Transform URLs untuk optimization
// https://bucket.supabase.co/images/...?width=400&quality=80
```

---

## 📖 Related Documentation

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Storage RLS Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Image Optimization](https://supabase.com/docs/guides/storage/cdn/image-transformations)

---

Last Updated: 2026-06-10
