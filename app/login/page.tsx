"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Successful login
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-12 items-stretch bg-background font-body text-on-surface overflow-hidden">
      {/* Branding Section (Editorial Column) */}
      <section 
        className="hidden md:flex md:col-span-7 lg:col-span-8 bg-login-hero flex-col justify-between p-12 relative overflow-hidden" 
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 69, 13, 0.4), rgba(0, 69, 13, 0.7)), url(https://lh3.googleusercontent.com/aida-public/AB6AXuC4vXmGxAW5-D_Gxk4TslCld8DKL5TcnL316sscZZM2SJ9EVX-I6oe1DacPaM95ZyRqA7jomjKsXdKVuGw6jiX4LkylYT5CshYes-WIHrvTRNjRvLjmSxMQpBmFqfVU1ul0EgKsu7x0p0F4Qlkmldjk6o3hne4jNIbBUELzlnblCWm-6qUrRlY-FzjStDd20hxVUlk-IGMjfgyyy8b4OTrYD0O4jpDxLnQEWU-12i_PMGFH_CiD9OYrVSY_dX6AAl0uAi3Pk8g0SH1T)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 bg-surface-bright/20 backdrop-blur-md px-4 py-2 rounded-xl">
            <span className="material-symbols-outlined text-surface-bright" data-icon="potted_plant">potted_plant</span>
            <span className="text-surface-bright font-headline font-black uppercase tracking-widest text-xs">Dinas Pertanian</span>
          </div>
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="font-headline text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tighter">
            Rancang Bangun Sistem Rekomendasi Pemilihan Varietas Unggulan Tanaman Hortikultura
          </h1>
          <div className="mt-8 h-1 w-24 bg-primary-fixed"></div>
          <p className="mt-8 text-surface-bright/90 text-lg lg:text-xl font-medium leading-relaxed">
            Meningkatkan ketahanan pangan melalui inovasi data dan pemilihan varietas unggul bagi petani Aceh Utara.
          </p>
        </div>
        <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-8">
          <div className="flex flex-col">
            <span className="text-white/60 font-label text-xs uppercase tracking-widest">Wilayah Kerja</span>
            <span className="text-white font-headline font-bold">Aceh Utara, Indonesia</span>
          </div>
          <div className="text-right">
            <span className="text-white/40 text-[10px] uppercase tracking-tighter">Digital Agronomist Interface v2.0</span>
          </div>
        </div>
        {/* Glass Overlay for Texture */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/60 to-transparent pointer-events-none"></div>
      </section>

      {/* Login Panel (Focus Area) */}
      <section className="col-span-1 md:col-span-5 lg:col-span-4 bg-surface flex flex-col justify-center px-8 lg:px-16 py-12 relative">
        {/* Mobile Header Only */}
        <div className="md:hidden mb-12 flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-primary text-5xl mb-4" data-icon="agriculture">agriculture</span>
          <h2 className="font-headline font-bold text-xl text-primary leading-tight">Dinas Pertanian dan Tanaman Pangan Aceh Utara</h2>
        </div>
        
        <div className="w-full max-w-sm mx-auto z-10">
          <div className="mb-10 text-left">
            <h3 className="font-headline font-bold text-3xl text-on-surface tracking-tight mb-2">Portal Akses</h3>
            <p className="text-on-surface-variant font-body">Silahkan masuk untuk mengelola sistem rekomendasi varietas.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="material-symbols-outlined text-xl" data-icon="error">error</span>
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="email">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl group-focus-within:text-primary transition-colors" data-icon="mail">mail</span>
                </div>
                <input 
                  autoComplete="email" 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-highest border-none focus:ring-0 rounded-xl font-body text-on-surface placeholder-on-surface-variant/50 transition-all duration-200" 
                  id="email" 
                  name="email" 
                  placeholder="Masukkan email anda" 
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
                  autoComplete="current-password" 
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-highest border-none focus:ring-0 rounded-xl font-body text-on-surface placeholder-on-surface-variant/50 transition-all duration-200" 
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
            
            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface" type="checkbox"/>
                <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">Ingat saya</span>
              </label>
              <Link className="text-sm font-semibold text-primary hover:underline underline-offset-4 decoration-2" href="#">Lupa sandi?</Link>
            </div>
            
            <button 
              disabled={loading}
              className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold rounded-xl shadow-lg shadow-primary/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
              type="submit"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Login Ke Sistem</span>
                  <span className="material-symbols-outlined text-xl" data-icon="login">login</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant">
              Belum punya akun?{' '}
              <Link href="/register" className="text-primary font-bold hover:underline">
                Daftar Sekarang
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
        
        {/* Decorative Organic Pattern Subtly in BG */}
        <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined text-[300px]" data-icon="grid_guides">grid_guides</span>
        </div>
        
        {/* Global Institutional Signature (Fixed position as per design system) */}
        <div className="absolute bottom-6 left-6 z-50 pointer-events-none hidden md:block">
          <span className="text-surface font-body text-[10px] tracking-[0.2em] font-medium uppercase opacity-50">
            Dinas Pertanian dan Tanaman Pangan Kabupaten Aceh Utara
          </span>
        </div>
      </section>
    </main>
  );
}
