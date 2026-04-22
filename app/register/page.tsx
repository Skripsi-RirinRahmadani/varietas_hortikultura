"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Kata sandi tidak cocok.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) throw authError;

      setSuccess(true);
      // Wait a bit before redirecting to login
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-12 items-stretch bg-background font-body text-on-surface overflow-hidden">
      {/* Branding Section (Editorial Column) - Mirroring Login */}
      <section 
        className="hidden md:flex md:col-span-7 lg:col-span-8 bg-login-hero flex-col justify-between p-12 relative overflow-hidden" 
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 69, 13, 0.4), rgba(0, 69, 13, 0.7)), url(https://images.unsplash.com/photo-1592982537447-6f2a6a0c3023?q=80&w=2000&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10">
          <Link href="/login" className="inline-flex items-center gap-3 bg-surface-bright/20 backdrop-blur-md px-4 py-2 rounded-xl hover:bg-surface-bright/30 transition-all">
            <span className="material-symbols-outlined text-surface-bright text-sm" data-icon="arrow_back">arrow_back</span>
            <span className="text-surface-bright font-headline font-black uppercase tracking-widest text-xs">Kembali ke Login</span>
          </Link>
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="font-headline text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tighter">
            Gabung & Ciptakan Ketahanan Pangan
          </h1>
          <div className="mt-8 h-1 w-24 bg-primary-fixed"></div>
          <p className="mt-8 text-surface-bright/90 text-lg lg:text-xl font-medium leading-relaxed">
            Daftarkan akun anda untuk mulai menggunakan sistem rekomendasi varietas tanaman terbaik di wilayah Aceh Utara.
          </p>
        </div>
        <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-8">
          <div className="flex flex-col">
            <span className="text-white/60 font-label text-xs uppercase tracking-widest">Digital Platform</span>
            <span className="text-white font-headline font-bold">Varietas Unggul Aceh Utara</span>
          </div>
          <div className="text-right">
            <span className="text-white/40 text-[10px] uppercase tracking-tighter">Registration Portal v2.0</span>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-secondary/60 to-transparent pointer-events-none"></div>
      </section>

      {/* Register Panel */}
      <section className="col-span-1 md:col-span-5 lg:col-span-4 bg-surface flex flex-col justify-center px-8 lg:px-16 py-12 relative overflow-y-auto">
        <div className="w-full max-w-sm mx-auto z-10 py-8">
          <div className="mb-10 text-left">
            <h3 className="font-headline font-bold text-3xl text-on-surface tracking-tight mb-2">Buat Akun</h3>
            <p className="text-on-surface-variant font-body">Lengkapi data di bawah untuk mendaftar sistem.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="material-symbols-outlined text-xl" data-icon="error">error</span>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-primary-container text-on-primary-container rounded-xl text-sm font-medium flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl" data-icon="check_circle">check_circle</span>
                Pendaftaran Berhasil!
              </div>
              <p className="text-xs opacity-80">Silahkan cek email anda untuk verifikasi atau anda akan diarahkan ke halaman login.</p>
            </div>
          )}
          
          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="fullName">Nama Lengkap</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl group-focus-within:text-primary transition-colors" data-icon="badge">badge</span>
                </div>
                <input 
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-highest border-none focus:ring-0 rounded-xl font-body text-on-surface placeholder-on-surface-variant/50 transition-all duration-200" 
                  id="fullName" 
                  name="fullName" 
                  placeholder="Nama Lengkap Anda" 
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="email">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl group-focus-within:text-primary transition-colors" data-icon="mail">mail</span>
                </div>
                <input 
                  autoComplete="email" 
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-highest border-none focus:ring-0 rounded-xl font-body text-on-surface placeholder-on-surface-variant/50 transition-all duration-200" 
                  id="email" 
                  name="email" 
                  placeholder="email@contoh.com" 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="password">Kata Sandi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl group-focus-within:text-primary transition-colors" data-icon="lock">lock</span>
                </div>
                <input 
                  autoComplete="new-password" 
                  className="w-full pl-12 pr-12 py-3.5 bg-surface-container-highest border-none focus:ring-0 rounded-xl font-body text-on-surface placeholder-on-surface-variant/50 transition-all duration-200" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button 
                    className="text-on-surface-variant hover:text-primary transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined" data-icon={showPassword ? "visibility_off" : "visibility"}>
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="confirmPassword">Konfirmasi Sandi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl group-focus-within:text-primary transition-colors" data-icon="lock_reset">lock_reset</span>
                </div>
                <input 
                  autoComplete="new-password" 
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-highest border-none focus:ring-0 rounded-xl font-body text-on-surface placeholder-on-surface-variant/50 transition-all duration-200" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  placeholder="••••••••" 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>
              </div>
            </div>
            
            <button 
              disabled={loading || success}
              className="w-full mt-4 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold rounded-xl shadow-lg shadow-primary/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
              type="submit"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Daftar Akun</span>
                  <span className="material-symbols-outlined text-xl" data-icon="app_registration">app_registration</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Masuk Sini
              </Link>
            </p>
          </div>
          
          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4 w-full">
              <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant/40">Dikelola Oleh</span>
              <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
            </div>
            <div className="text-center">
              <h4 className="font-headline font-extrabold text-on-surface text-sm uppercase tracking-[0.1em]">Dinas Pertanian Aceh Utara</h4>
              <p className="font-body text-[11px] text-on-surface-variant mt-1">Pemerintah Kabupaten Aceh Utara</p>
            </div>
          </div>
        </div>
        
        {/* Decorative Grid Pattern */}
        <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined text-[300px]" data-icon="grid_guides">grid_guides</span>
        </div>
      </section>
    </main>
  );
}
