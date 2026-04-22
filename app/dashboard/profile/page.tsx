"use client";

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({ totalPredictions: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setUser(user);
          
          // Initial values from metadata
          setFullName(user.user_metadata?.full_name || '');
          setAvatarUrl(user.user_metadata?.avatar_url || '');

          // Fetch from profiles table
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (profile) {
            setFullName(profile.full_name || '');
            setAvatarUrl(profile.avatar_url || '');
          } else {
             // Lazily create profile if not exists
             await supabase.from('profiles').insert({
               id: user.id,
               full_name: user.user_metadata?.full_name || '',
               avatar_url: user.user_metadata?.avatar_url || ''
             });
          }

          // Fetch stats from predictions table
          const { count } = await supabase
            .from('predictions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          
          setStats({ totalPredictions: count || 0 });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, []);

  const updateProfile = async () => {
    try {
      setUpdating(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const updates = {
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      // Also update auth metadata for TopBar sync
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName, avatar_url: avatarUrl }
      });
      
      if (authError) throw authError;

      alert('Profil berhasil diperbarui!');
      router.refresh();
    } catch (error: any) {
      alert(`Gagal memperbarui profil: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Anda harus memilih gambar untuk diunggah.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(data.publicUrl);
    } catch (error: any) {
      alert(`Gagal mengunggah avatar: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Profil Saya">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent shadow-xl"></div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant animate-pulse">Menyiapkan Profil...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Profil Saya">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">
        
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200/50 dark:border-stone-800/50 overflow-hidden shadow-2xl shadow-stone-200/50 dark:shadow-none">
          <div className="h-56 bg-stone-100 dark:bg-stone-800 relative overflow-hidden">
             {/* Dynamic Botanical Background */}
             <div className="absolute inset-0 bg-gradient-to-tr from-green-950 to-emerald-800 opacity-90"></div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')] opacity-30 mix-blend-overlay"></div>
             <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          
          <div className="px-10 pb-10 -mt-20 relative z-10 flex flex-col md:flex-row items-end gap-8">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] bg-white dark:bg-stone-900 p-1.5 shadow-2xl overflow-hidden active:scale-[0.98] transition-transform duration-500">
                <div className="w-full h-full rounded-[2.2rem] bg-stone-100 dark:bg-stone-800 flex items-center justify-center overflow-hidden border-2 border-white dark:border-stone-800">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <span className="text-5xl font-black text-stone-300 dark:text-stone-700">{user?.email?.[0].toUpperCase()}</span>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col gap-2">
                       <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">Unggah...</span>
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-green-600 transition-all hover:scale-110 active:scale-90 border-4 border-white dark:border-stone-900 group-hover:animate-bounce-short"
                title="Ganti Foto Profil"
                disabled={uploading}
              >
                <span className="material-symbols-outlined text-2xl">photo_camera</span>
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={uploadAvatar} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            
            <div className="flex-1 mb-2">
              <div className="flex items-center gap-3 mb-1">
                 <h1 className="text-4xl font-black text-green-950 dark:text-green-50 tracking-tight">
                    {fullName || user?.email?.split('@')[0]}
                 </h1>
                 <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200/50 dark:border-green-800/50">
                    {user?.user_metadata?.role || 'Personal'}
                 </span>
              </div>
              <p className="text-stone-500 dark:text-stone-400 font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-base opacity-40">alternate_email</span>
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Form and Stats Sections */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
           
           {/* General Settings */}
           <div className="md:col-span-8 space-y-8">
             <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-10 border border-stone-200/50 dark:border-stone-800/50 shadow-xl shadow-stone-200/30 dark:shadow-none">
               <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-primary shadow-inner">
                   <span className="material-symbols-outlined text-2xl">manage_accounts</span>
                 </div>
                 <div>
                   <h2 className="text-2xl font-black text-green-950 dark:text-green-50 tracking-tight">Detil Informasi</h2>
                   <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">Personalisasi tampilan profil Anda</p>
                 </div>
               </div>

               <div className="space-y-8">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                   <div className="space-y-3 group">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 group-focus-within:text-primary transition-colors">Nama Lengkap</label>
                     <div className="relative">
                       <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/50 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-semibold text-stone-900 dark:text-stone-100"
                        placeholder="Masukkan nama lengkap..."
                       />
                       <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 dark:text-stone-600 text-xl">edit</span>
                     </div>
                   </div>
                   
                   <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">ID Digital</label>
                     <div className="bg-stone-50 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/30 rounded-2xl px-6 py-4 text-stone-400 dark:text-stone-600 font-mono text-sm flex items-center justify-between">
                        <span>USR-{user?.id.substring(0, 8).toUpperCase()}</span>
                        <span className="material-symbols-outlined text-base">verified</span>
                     </div>
                   </div>
                 </div>
                 
                 <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Alamat Email Terverifikasi</label>
                   <div className="flex items-center gap-4 bg-stone-50 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/30 rounded-2xl px-6 py-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">verified_user</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{user?.email}</span>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Akun login utama anda</span>
                      </div>
                   </div>
                 </div>
                 
                 <div className="pt-10 border-t border-stone-100 dark:border-stone-800/50 flex flex-col sm:flex-row justify-between items-center gap-6">
                   <p className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-400 max-w-[200px] leading-relaxed">
                     Semua perubahan akan disinkronkan ke seluruh bagian dashboard secara real-time.
                   </p>
                   <button 
                    onClick={updateProfile}
                    disabled={updating}
                    className="w-full sm:w-auto bg-green-950 dark:bg-green-800 text-white px-12 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-green-700 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-green-950/20 active:scale-95 disabled:opacity-50"
                   >
                     {updating ? 'Menyimpan...' : 'Perbarui Profil'}
                     <span className="material-symbols-outlined text-lg">arrow_forward</span>
                   </button>
                 </div>
               </div>
             </div>
           </div>

           {/* Stats Side Grid */}
           <div className="md:col-span-4 space-y-8">
             {/* Total Scan Metric */}
             <div className="bg-green-900 dark:bg-green-950 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-700">
               <div className="relative z-10">
                 <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-8">
                    <span className="material-symbols-outlined text-3xl">analytics</span>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 block mb-2">Jejak Analisis</span>
                 <p className="text-7xl font-black mb-1 tracking-tighter leading-none">{stats.totalPredictions}</p>
                 <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Prediksi Tersimpan</p>
               </div>
               {/* Decorative Element */}
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-[150px] rotate-12">monitoring</span>
               </div>
               <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-primary/20 rounded-full blur-[60px]"></div>
             </div>

             {/* System Info */}
             <div className="bg-stone-50 dark:bg-stone-900/50 rounded-[2.2rem] p-10 border border-stone-200 dark:border-stone-800 shadow-sm">
                <h3 className="text-sm font-black mb-8 flex items-center gap-3 text-green-950 dark:text-green-100 uppercase tracking-widest">
                  <span className="w-2 h-6 bg-primary rounded-full"></span>
                  Informasi Sistem
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white dark:bg-stone-800 p-4 rounded-2xl border border-stone-200/50 dark:border-stone-700/50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Status Akun</span>
                    <span className="flex items-center gap-2 text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">
                       <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                       Aktif
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-stone-800 p-4 rounded-2xl border border-stone-200/50 dark:border-stone-700/50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Versi Sistem</span>
                    <span className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-widest">v2.4.1-stable</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-stone-800 p-4 rounded-2xl border border-stone-200/50 dark:border-stone-700/50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Wilayah Tugas</span>
                    <span className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-widest">Aceh Utara</span>
                  </div>
                </div>
                
                <div className="mt-10 p-5 rounded-2xl bg-stone-100 dark:bg-stone-800/50 border border-dashed border-stone-300 dark:border-stone-700">
                   <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 leading-relaxed italic text-center">
                     Akun ini terdaftar sebagai bagian dari sistem intelijen pertanian pemerintah.
                   </p>
                </div>
             </div>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}
