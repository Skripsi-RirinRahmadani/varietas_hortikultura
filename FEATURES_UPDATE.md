# Update Fitur SiVartas - Role-Based Access Control & Public Predict

## Ringkasan Perubahan

### 1. **Role-Based Access Control (RBAC)**

#### Database Schema
- Tambah kolom `role` pada tabel `profiles` dengan nilai default `'user'`
- Support dua role: `'admin'` dan `'user'`
- Trigger otomatis membuat profile saat user baru sign up

#### Manajemen Data (Admin Only)
- **Path**: `/dashboard/data`
- **Proteksi**: 
  - Hanya user dengan role `'admin'` yang bisa akses
  - Non-admin users akan di-redirect ke `/dashboard`
  - Sidebar menu "Manajemen Data" hanya tampil untuk admin

#### Sidebar Navigation
- Menu "Manajemen Data" disembunyikan untuk non-admin users
- Conditional rendering berdasarkan role yang di-fetch dari profiles table

### 2. **Fitur Predict Publik (Tanpa Login)**

#### Route Baru
- **Path**: `/predict` - Public predict page (tanpa AppLayout/Sidebar)
- **Path**: `/dashboard/predict` - Tetap ada untuk logged-in users (dengan AppLayout)

#### Fungsionalitas
- User dapat menggunakan fitur predict **tanpa login**
- Hasil analisis ditampilkan real-time
- **History TIDAK tersimpan** jika user belum login
- **History TERSIMPAN** jika user login

#### Implementasi
- History section hanya tampil jika user login
- `savePredictionToSupabase()` check apakah user ada sebelum menyimpan
- Anonymous users bisa lihat hasil tapi tidak bisa akses riwayat

### 3. **Dashboard Conditional UI**

#### Homepage (`/`)
- Link "Mulai Sekarang" → `/predict` (public predict)
- Link "Daftar Akun" → `/register`
- Login button → `/login`

#### Public Predict Page (`/predict`)
- Header dengan logo dan navigation
- Login/Register buttons
- Info banner: "Hasil prediksi tidak akan disimpan, login untuk menyimpan riwayat"
- Full predict functionality tanpa sidebar
- Responsive design

#### Protected Pages
- `/dashboard` - Requires login, show dashboard untuk all users
- `/dashboard/data` - Requires admin role, else redirect ke `/dashboard`
- `/dashboard/predict` - Requires login (if not login, redirect ke `/predict`)

### 4. **Registration Flow Update**

#### Auto Profile Creation
- Saat user sign up, profile otomatis dibuat dengan role `'user'`
- Profile berisi:
  - `id` (dari auth.users)
  - `full_name` (dari input form)
  - `role` = `'user'` (default)

#### Implementation
- Register page membuat profile setelah auth sign up berhasil
- Fallback trigger di database untuk handle edge cases

---

## File-File yang Diubah

### Database
- `schema.sql` - Tambah table profiles, RLS policies, trigger

### Authentication & Registration
- `app/register/page.tsx` - Auto create profile saat sign up

### Predict Feature
- `app/predict/page.tsx` - **NEW** Public predict page
- `app/dashboard/predict/page.tsx` - Update savePrediction untuk conditional save

### Navigation
- `components/Sidebar.tsx` - Conditional menu rendering berdasarkan role
- `app/page.tsx` - Update link ke `/predict` untuk public access

### Data Management
- `app/dashboard/data/page.tsx` - Add admin role check & redirect

### Types
- `lib/types.ts` - Add `role` field ke Profile interface

---

## Testing Checklist

### Public Access
- [ ] User dapat akses `/predict` tanpa login ✓
- [ ] Hasil analisis ditampilkan ✓
- [ ] History tidak tersimpan ✓
- [ ] Info banner tampil untuk non-login users ✓

### Login Users
- [ ] User dapat login dan redirect ke dashboard ✓
- [ ] Profile otomatis dibuat dengan role 'user' ✓
- [ ] Manajemen Data tidak accessible ✓
- [ ] History tersimpan saat predict ✓

### Admin Users
- [ ] Admin dapat akses `/dashboard/data` ✓
- [ ] Non-admin redirect dari `/dashboard/data` ke `/dashboard` ✓
- [ ] "Manajemen Data" menu visible untuk admin saja ✓

---

## Catatan Teknis

### RLS (Row Level Security)
- Profile dapat dibaca oleh owner atau admin
- Update hanya oleh owner sendiri
- Prediction dapat dibaca semua orang, tapi insert/update hanya oleh owner

### Future Enhancements
1. Tambah role "penyuluh" (extension dari user dengan akses terbatas ke data)
2. User management page untuk super-admin
3. Export history untuk admin
4. Permission-based features untuk role yang berbeda

---

## Deployment Notes

### Before Deploying
1. Run schema.sql migration di Supabase
2. Ensure trigger `on_auth_user_created` berfungsi
3. Test register flow membuat profile
4. Verify RLS policies

### Environment Variables
- Tidak ada perubahan env vars yang diperlukan
- Existing SUPABASE_URL dan SUPABASE_ANON_KEY sudah cukup

---

Generated: 2026-06-09
