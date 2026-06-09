# User Role Management - Pengaturan Role Pengguna

## Overview

Admin dapat mengelola role pengguna langsung dari dashboard di tab **Pengguna** pada halaman **Manajemen Data** (`/dashboard/data`).

## Fitur

### Apa yang Bisa Dilakukan

✅ **Lihat semua pengguna** terdaftar dengan informasi:
- Nama pengguna
- Avatar
- Role saat ini (User/Admin)
- Tanggal terakhir update

✅ **Ubah role pengguna** dari User ↔ Admin dengan dropdown

✅ **Real-time update** - perubahan langsung tersimpan ke database

✅ **Search & filter** - cari pengguna berdasarkan nama

✅ **Responsive design** - berfungsi di desktop & mobile

## User Interface

### Desktop View
```
┌─────────────────────────────────────────────────────────────────┐
│ Pengguna | Role (dropdown) | Terakhir Update | Status Badge    │
├─────────────────────────────────────────────────────────────────┤
│ 👤 Ahmad Rizki | [User ▼] | 9 Jun 2026 | 👤 User            │
│ 👤 Siti Nurhaliza | [Admin ▼] | 8 Jun 2026 | 👑 Admin         │
│ 👤 Budi Santoso | [User ▼] | 7 Jun 2026 | 👤 User            │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile View
```
┌──────────────────────────────┐
│ 👤 Ahmad Rizki              │
│ xxxxx-xxxxx...              │
│ Role: [User ▼]              │
└──────────────────────────────┘
```

## How to Use

### 1. **Akses Manajemen Pengguna**
1. Login sebagai admin
2. Buka `/dashboard/data`
3. Klik tab **Pengguna**

### 2. **Ubah Role Pengguna**
1. Cari pengguna dengan search bar (opsional)
2. Klik dropdown **Role** pada baris pengguna
3. Pilih **User** atau **Admin**
4. Perubahan otomatis tersimpan (spinner loading muncul)

### 3. **Cari Pengguna**
- Ketik nama pengguna di search bar
- Filter real-time otomatis
- Klik X untuk reset search

### 4. **Sort Data**
- Klik header kolom untuk sort
- Support sort by: Pengguna, Role, Terakhir Update

## Role Explanations

### 👤 User (Default)
- **Akses**: Fitur prediksi, riwayat, profil
- **Tidak bisa**: Manajemen data (komoditas, varietas, wilayah)
- **Diberikan otomatis** saat registrasi baru

### 👑 Admin
- **Akses**: Semua fitur user + Manajemen Data lengkap
- **Bisa**: 
  - Kelola komoditas (tambah, edit, hapus)
  - Kelola varietas
  - Kelola wilayah/kecamatan
  - Lihat semua prediksi (tidak hanya milik sendiri)
  - Kelola pengguna & role
- **Diberikan manual** oleh admin lain via tab ini

## Database Structure

### Tabel: profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',  -- 'user' atau 'admin'
  updated_at TIMESTAMP
);
```

### Role Values
- `'user'` - pengguna biasa
- `'admin'` - administrator

## Technical Implementation

### Component: TabPengguna
Location: `app/dashboard/data/page.tsx`

**State Management:**
```typescript
const [data, setData] = useState<Profile[]>([]);
const [updatingRole, setUpdatingRole] = useState<string | null>(null);
```

**Key Functions:**
```typescript
// Fetch pengguna dari database
const fetch = useCallback(async () => {
  const { data: d } = await supabase
    .from("profiles")
    .select("*")
    .order("updated_at", { ascending: false });
  if (d) setData(d);
}, []);

// Update role pengguna
const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);
  
  if (!error) {
    // Update local state
    setData(prev => prev.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));
  }
};
```

**UI Features:**
- Dropdown select dengan perubahan real-time
- Loading spinner saat update
- Status badge (👑 Admin / 👤 User)
- Color coding: hijau untuk admin, abu untuk user
- Search & sort functionality
- Pagination (9 items per halaman)

## Security Considerations

### Row Level Security (RLS)
```sql
-- Hanya admin yang bisa update role
CREATE POLICY "Only admin can update role" ON profiles
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

### Authorization Check
- Hanya pengguna dengan role 'admin' yang bisa akses `/dashboard/data`
- Jika non-admin mencoba akses, redirect ke `/dashboard`

## Testing Checklist

### Desktop
- [ ] Login sebagai admin
- [ ] Buka `/dashboard/data` → tab Pengguna
- [ ] Lihat list semua pengguna
- [ ] Ubah role user ke admin (dropdown works)
- [ ] Verify perubahan tersimpan di database
- [ ] Search pengguna by nama
- [ ] Sort by Role, Tanggal Update
- [ ] Pagination berfungsi
- [ ] Loading spinner muncul saat update

### Mobile
- [ ] Lihat list pengguna (responsive)
- [ ] Ubah role via dropdown
- [ ] Search functionality
- [ ] Pagination works

### Edge Cases
- [ ] Non-admin tidak bisa akses halaman ini (redirect)
- [ ] Ubah role sendiri (admin) - allowed
- [ ] Update gagal handling (show alert)
- [ ] Multiple rapid role changes

## Troubleshooting

### Problem: Dropdown tidak berfungsi
**Solution:**
1. Verify user role field bukan NULL di database
2. Ensure RLS policies enabled
3. Check browser console untuk error

### Problem: Perubahan tidak tersimpan
**Solution:**
1. Check Supabase connection
2. Verify user punya permission update
3. Cek network tab di DevTools

### Problem: Non-admin bisa akses tab Pengguna
**Solution:**
1. Verify role check di `/dashboard/data` page
2. Clear cache dan login ulang
3. Check RLS policies di Supabase

## Future Enhancements

### 1. **Bulk Role Update**
- Checkbox untuk select multiple users
- Bulk update role untuk selected users

### 2. **User Activity Log**
- Lihat kapan user terakhir login
- Jumlah prediksi user
- Status akun (active/inactive)

### 3. **User Deactivation**
- Soft-delete users
- Suspend akun sementara
- Archive user data

### 4. **Role Hierarchy**
- Tambah role baru: moderator, penyuluh
- Permission-based system
- Custom role builder

### 5. **Audit Log**
- Track siapa yang ubah role siapa
- Kapan perubahan terjadi
- Alasan perubahan (optional)

## API References

### Update User Role
```typescript
const { error } = await supabase
  .from("profiles")
  .update({ role: "admin" })
  .eq("id", userId);
```

### Fetch All Users
```typescript
const { data } = await supabase
  .from("profiles")
  .select("*")
  .order("updated_at", { ascending: false });
```

### Verify User Role
```typescript
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

const isAdmin = profile?.role === 'admin';
```

## Related Files

- **Component**: `app/dashboard/data/page.tsx` (TabPengguna)
- **Database**: `profiles` table
- **Authorization**: `components/Sidebar.tsx`, `app/dashboard/data/page.tsx`
- **Types**: `lib/types.ts` (Profile interface)

---

Last Updated: 2026-06-10
