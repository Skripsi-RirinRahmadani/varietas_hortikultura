# Debug Guide - Admin Menu Not Showing

## 🔧 Fix Applied

Sidebar component sudah di-update dengan:
- ✅ Better error handling saat fetch role
- ✅ Console logging untuk debug
- ✅ Default fallback ke 'user' jika ada error
- ✅ Error messages yang jelas

## 🧪 Testing Steps

### 1. **Clear Cache & Login Ulang**

```bash
# Clear browser cache:
- Open DevTools (F12)
- Go to Application tab
- Clear Cache Storage, Local Storage, Cookies
- Or use Ctrl+Shift+Delete dan clear all

# Or restart browser completely
```

### 2. **Login sebagai Admin**
1. Logout jika sudah login
2. Login dengan admin account:
   - Email: ririn@example.com (atau email admin Anda)
   - Check console untuk role log

### 3. **Check Browser Console**

Buka DevTools (F12) → Console tab, cari messages:

```
✅ SUCCESS (should see):
  "User role: admin"
  Menu Manajemen Data akan tampil

❌ ERROR (if you see):
  "Error fetching profile role: ..."
  Berarti ada masalah dengan fetch
```

### 4. **Expected Console Output**

Untuk admin user, harusnya lihat:
```
User role: admin
```

Untuk regular user, harusnya lihat:
```
User role: user
```

---

## 🐛 Troubleshooting

### Problem: Menu masih tidak muncul

**Step 1: Check database**
```sql
-- Verify role di database
SELECT id, full_name, role FROM profiles;
```

Harusnya lihat:
```
id: xxxxx | full_name: "Anda" | role: "admin"
```

**Step 2: Check browser console**
- Open DevTools → Console
- Look untuk "User role:" message
- Apakah ada error message?

**Step 3: Check network request**
- Open DevTools → Network tab
- Login sebagai admin
- Lihat request ke `profiles` table
- Check response apakah `role: "admin"` ada

### Problem: "Error fetching profile role: ..."

Bisa disebabkan oleh:

1. **RLS Policy blocking**
   ```
   Error: "not found"
   ```
   Solution: Verify RLS policy di Supabase:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

2. **Role field tidak ada**
   ```
   Error: "column ... does not exist"
   ```
   Solution: Verify migration sudah dijalankan

3. **Profile belum dibuat**
   ```
   Error: "not found"
   ```
   Solution: Ensure profile ada di database

---

## 🔍 Manual Verification

### 1. Check Supabase Dashboard

1. Buka Supabase Console
2. Pilih project → Database
3. Buka table `profiles`
4. Check apakah admin user punya `role: 'admin'`

### 2. Check RLS Policies

1. Supabase Console → SQL Editor
2. Run:
```sql
-- Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'profiles';
```

Should see policies untuk `profiles` table.

### 3. Verify Role Field Exists

```sql
-- Check column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';
```

Should return:
```
column_name: "role" | data_type: "text"
```

---

## 📝 Updated Code

### Sidebar Component Changes

**Added:**
- Try-catch block untuk error handling
- Console logging dengan `console.log()` dan `console.error()`
- Error check di profileData
- Fallback default role = 'user'
- Error message di console

**Example:**
```typescript
if (profileError) {
  console.error("Error fetching profile role:", profileError);
  setUserRole('user');
} else if (profileData?.role) {
  console.log("User role:", profileData.role);
  setUserRole(profileData.role as 'admin' | 'user');
}
```

---

## ✅ Testing Checklist

- [ ] Clear browser cache
- [ ] Logout completely
- [ ] Login sebagai admin
- [ ] Check console untuk "User role: admin"
- [ ] Menu Manajemen Data muncul
- [ ] Click Manajemen Data → redirect ke /dashboard/data
- [ ] Verify Tab Pengguna bisa akses
- [ ] Test logout & login sebagai user
- [ ] Verify menu Manajemen Data tidak muncul untuk user
- [ ] Check console untuk "User role: user"

---

## 🚀 If Still Not Working

1. **Hard reload page:**
   - Windows: `Ctrl+Shift+R`
   - Mac: `Cmd+Shift+R`

2. **Check Network requests:**
   - DevTools → Network tab
   - Filter: `profiles`
   - Check response punya `role` field

3. **Verify Supabase connection:**
   - Check `.env.local` file untuk credentials
   - Verify URLs benar

4. **Nuclear option - Force refresh:**
   - Delete all browser storage
   - Close browser completely
   - Open fresh & login again

---

## 📊 Debug Workflow

```
1. Login sebagai admin
   ↓
2. Check Console untuk "User role: admin"
   ├─ YES → Menu should show ✅
   └─ NO  → Check error message
           ↓
3. Error: "not found"
   → Check database profile ada
   → Check RLS policies
   
4. Error: "column does not exist"
   → Run migration: add_role_to_profiles
   
5. No error but role still 'user'
   → Check database role field value
   → Run UPDATE profile SET role='admin'
```

---

## 📞 Getting More Help

Jika sudah coba semua langkah di atas dan tetap tidak bekerja:

1. **Check console messages** → Screenshot dan berikan
2. **Check Supabase dashboard** → Verify profile data
3. **Run manual query** → Verify role di database
4. **Try different admin account** → Ensure user adalah admin
5. **Hard refresh + logout/login** → Full reset cache

---

Last Updated: 2026-06-10
