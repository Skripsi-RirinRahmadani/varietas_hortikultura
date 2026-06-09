# Setup Instructions - Role-Based Access Control Implementation

## Langkah-Langkah Setup

### 1. Update Supabase Database Schema

#### Login ke Supabase Console
- Buka https://supabase.com/dashboard
- Pilih project "varietas_hortikultura"
- Masuk ke SQL Editor

#### Run SQL Migration
Copy dan jalankan seluruh isi file `schema.sql` di Supabase SQL Editor:

```sql
-- Copy paste isi schema.sql ke sini
-- Terutama bagian profiles table dan triggers
```

**Atau**, jalankan commands berikut secara individual:

```sql
-- 1. Create profiles table (jika belum ada)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' NOT NULL CHECK (role IN ('admin', 'user')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
CREATE POLICY "Profiles are readable by owner or admin" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. Create trigger function
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user();
```

### 2. Setup Admin User

Untuk membuat admin user di Supabase:

#### Via Supabase Console
1. Buka **Authentication** → **Users**
2. Buat user baru atau gunakan user existing
3. Copy user `id`
4. Buka **SQL Editor** dan jalankan:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = 'YOUR_USER_ID_HERE';
```

#### Verify
```sql
SELECT id, full_name, role FROM profiles WHERE role = 'admin';
```

### 3. Update Environment Variables (Jika Diperlukan)

File `.env.local` sudah benar. Pastikan:

```
NEXT_PUBLIC_SUPABASE_URL=https://agwxkhvtbkdedaxjmgbv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Test Local Development

```bash
npm install
npm run dev
```

#### Test Scenarios

**A. Public Access (No Login)**
1. Buka http://localhost:3000
2. Klik "Coba Gratis" → `/predict`
3. Verify:
   - Info banner: "Hasil prediksi tidak akan disimpan"
   - Bisa input parameter dan analisis
   - History section tidak tampil

**B. User Registration**
1. Klik "Daftar Akun"
2. Isi form dan submit
3. Verify:
   - Profile otomatis dibuat dengan role 'user'
   - Redirect ke login page
   - Login dengan user baru

**C. Login User**
1. Login dengan user baru
2. Redirect ke `/dashboard`
3. Verify:
   - Sidebar tampil
   - Menu "Manajemen Data" **TIDAK** tampil
   - `/dashboard/data` di-redirect ke `/dashboard`

**D. Admin Access**
1. Update user role ke 'admin' via Supabase SQL:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = 'user_id';
   ```
2. Login dengan admin user
3. Verify:
   - Menu "Manajemen Data" **TAMPIL**
   - Bisa akses `/dashboard/data`
   - Bisa lihat semua tabs: Komoditas, Varietas, Wilayah, Prediksi, Pengguna

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  Public Landing Page                     │
│                      /                                   │
└─────────────────────────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
        ┌───────▼────────┐   ┌───────▼────────┐
        │  Public Predict │   │  Login/Register│
        │    /predict     │   │  /login        │
        └────────────────┘   │  /register     │
                             └────────────────┘
                                     │
                             ┌───────▼──────────┐
                             │ Auto Create      │
                             │ Profile (role='user')│
                             └────────────────┘
                                     │
                    ┌────────────────┴─────────────┐
                    │                              │
        ┌───────────▼──────────┐     ┌────────────▼─────────┐
        │   User Dashboard     │     │   Admin Dashboard    │
        │    /dashboard        │     │    /dashboard/data   │
        │  - Dasbor            │     │  - Manajemen Data    │
        │  - Analisis Baru     │     │  - Komoditas         │
        │  - Riwayat Prediksi  │     │  - Varietas          │
        └──────────────────────┘     │  - Wilayah           │
                                     │  - Prediksi (All)    │
                                     │  - Pengguna          │
                                     └──────────────────────┘
```

---

## File Structure

```
app/
├── page.tsx                    ← Landing page (updated)
├── predict/                    ← NEW: Public predict page
│   └── page.tsx               ← PUBLIC predict (no auth required)
├── dashboard/
│   ├── page.tsx               ← Dashboard (auth required)
│   ├── data/
│   │   └── page.tsx           ← Data management (admin only)
│   ├── predict/
│   │   └── page.tsx           ← User predict (auth required)
│   └── ...
├── login/page.tsx
├── register/page.tsx           ← Updated with auto profile creation
└── ...

components/
├── Sidebar.tsx                 ← Updated: conditional menu based on role
├── TopBar.tsx
├── AppLayout.tsx
└── ...

lib/
├── types.ts                    ← Updated: added role field to Profile
├── supabase.ts
└── ...

schema.sql                       ← Updated: added profiles table, RLS, trigger
FEATURES_UPDATE.md              ← Feature documentation
SETUP_INSTRUCTIONS.md           ← This file
```

---

## Troubleshooting

### Problem: "Relation 'profiles' does not exist"
**Solution**: Run the SQL migration di Supabase console

### Problem: Profile tidak otomatis dibuat saat sign up
**Solution**: 
1. Verify trigger `on_auth_user_created` ada di Supabase
2. Trigger hanya bekerja untuk new users, tidak untuk existing users
3. Manual buat profile untuk existing users:
   ```sql
   INSERT INTO profiles (id, role) 
   SELECT id, 'user' FROM auth.users 
   WHERE id NOT IN (SELECT id FROM profiles)
   ON CONFLICT DO NOTHING;
   ```

### Problem: Admin tidak bisa akses `/dashboard/data`
**Solution**: 
1. Verify user role = 'admin' di profiles table
2. Clear browser cache dan login ulang
3. Check RLS policies di Supabase

### Problem: Non-admin bisa akses `/dashboard/data`
**Solution**: 
1. Verify role check di `/app/dashboard/data/page.tsx`
2. Ensure RLS policies enabled
3. Try incognito mode atau clear cookies

---

## Performance Notes

- Profile fetch dilakukan 1x saat user login di Sidebar.tsx
- Role check di `/dashboard/data/page.tsx` dilakukan saat page load
- RLS policies di Supabase handle data access di level database

---

## Security Considerations

1. **RLS Enabled**: Semua table punya RLS policies
2. **Role Check Client-Side**: Sidebar dan Page components
3. **Database Trigger**: Auto-create profile untuk new users
4. **Admin Role**: Hanya admin yang bisa access management pages

### Future Recommendations
1. Implement session-based caching untuk role
2. Add audit logging untuk admin actions
3. Add two-factor authentication
4. Implement rate limiting untuk predict API

---

## Next Steps

1. ✅ Deploy schema changes ke Supabase
2. ✅ Test all flows locally
3. ✅ Set up admin users
4. ✅ Deploy aplikasi
5.📝 Monitor logs dan feedback pengguna

---

Last Updated: 2026-06-09
