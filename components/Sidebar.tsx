"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dasbor', icon: 'dashboard' },
    { href: '/dashboard/data', label: 'Manajemen Data', icon: 'database' },
    { href: '/dashboard/map', label: 'Peta Sebaran', icon: 'map' },
  ];

  useEffect(() => {
    let currentUser: any = null;

    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      currentUser = user;

      const { data, error } = await supabase
        .from('predictions')
        .select('id, created_at, variety_name, soil_type, user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (!error && data) {
        setHistory(data);
      }
    };

    fetchHistory();

    // Set up real-time subscription to update history when new predictions are saved
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'predictions',
        },
        (payload) => {
          // Only add if it belongs to the current user
          if (currentUser && payload.new.user_id === currentUser.id) {
            setHistory((prev) => [payload.new, ...prev.slice(0, 4)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 p-5 space-y-8 bg-surface-container-low dark:bg-stone-950 z-40 pt-20 border-r border-stone-200/50 dark:border-stone-800/50 shadow-xl dark:shadow-none">
        <div className="px-3 py-2 flex items-center gap-3 bg-green-50/50 dark:bg-green-900/10 rounded-2xl border border-green-100/50 dark:border-green-800/20">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
            <span className="material-symbols-outlined text-white text-2xl">agriculture</span>
          </div>
          <div className="flex flex-col">
            <h2 className="font-headline font-black text-green-950 dark:text-green-50 text-base leading-tight tracking-tight uppercase">Dinas Pertanian</h2>
            <p className="text-[10px] text-green-700/70 dark:text-green-400/50 font-bold tracking-widest uppercase">Aceh Utara</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em]">Menu Utama</span>
          </div>
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive(item.href) 
                  ? 'bg-green-600 text-white shadow-xl shadow-green-600/20 font-bold scale-[1.02]' 
                  : 'text-stone-600 dark:text-stone-400 hover:bg-green-50 dark:hover:bg-green-900/10 hover:text-green-800 dark:hover:text-green-300'
              }`}
            >
              <span 
                className={`material-symbols-outlined transition-all duration-300 ${isActive(item.href) ? 'text-white' : 'group-hover:scale-110'}`} 
                style={{ fontVariationSettings: isActive(item.href) ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-body text-[14px] tracking-wide">{item.label}</span>
              {isActive(item.href) && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
              )}
            </Link>
          ))}

          {/* Dropdown Rekomendasi */}
          <div className="pt-2">
            <div className="px-3 mb-2">
              <span className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em]">Data Intel</span>
            </div>
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive('/dashboard/results') || isHistoryOpen
                  ? 'bg-stone-100 dark:bg-stone-900 text-green-900 dark:text-green-400 font-bold' 
                  : 'text-stone-600 dark:text-stone-400 hover:bg-green-50 dark:hover:bg-green-900/10 hover:text-green-800 dark:hover:text-green-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span 
                  className={`material-symbols-outlined transition-colors duration-300 ${isActive('/dashboard/results') ? 'text-green-600' : ''}`}
                  style={{ fontVariationSettings: isActive('/dashboard/results') ? "'FILL' 1" : "'FILL' 0" }}
                >
                  psychology
                </span>
                <span className="font-body text-[14px] tracking-wide">Rekomendasi</span>
              </div>
              <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isHistoryOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {isHistoryOpen && (
              <div className="mt-1 ml-4 border-l-2 border-stone-200 dark:border-stone-800 flex flex-col gap-1 pl-4 animate-in fade-in slide-in-from-left-2 duration-300">
                <Link 
                  href="/dashboard/results"
                  className={`text-xs p-2 rounded-xl transition-all ${
                    isActive('/dashboard/results') && !pathname.includes('id=') 
                    ? 'text-green-700 bg-green-50 dark:bg-green-900/20 font-bold' 
                    : 'text-stone-500 hover:text-green-600 hover:bg-stone-50 dark:hover:bg-stone-900/50'
                  }`}
                >
                  Lihat Semua
                </Link>
                {history.length > 0 ? (
                  history.map((item) => (
                    <Link 
                      key={item.id}
                      href={`/dashboard/results?id=${item.id}`}
                      className={`group p-2.5 rounded-xl transition-all flex flex-col gap-0.5 ${
                        pathname.includes(item.id) 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30' 
                        : 'hover:bg-stone-50 dark:hover:bg-stone-900/50'
                      }`}
                    >
                      <span className={`text-[12px] truncate ${pathname.includes(item.id) ? 'text-green-800 dark:text-green-400 font-bold' : 'text-stone-600 dark:text-stone-400'}`}>
                        {item.variety_name}
                      </span>
                      <div className="flex items-center gap-1.5 opacity-60">
                        <span className="text-[9px] font-bold uppercase tracking-wider">
                          {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-stone-300 shrink-0"></span>
                        <span className="text-[9px] font-medium truncate uppercase tracking-tighter">{item.soil_type}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <span className="text-[10px] p-2 text-stone-400 italic">Belum ada histori</span>
                )}
              </div>
            )}
          </div>
        </nav>

        <div className="px-2">
          <Link 
            href="/dashboard/predict" 
            className={`w-full py-4 px-4 rounded-2xl bg-gradient-to-br from-green-900 via-green-800 to-green-950 text-white font-black text-[13px] tracking-[0.05em] shadow-xl shadow-green-900/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group`}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="material-symbols-outlined text-xl">add_circle</span>
            <span>ANALISIS BARU</span>
          </Link>
        </div>

        <div className="border-t border-stone-200 dark:border-stone-800 pt-6 mt-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-stone-500 dark:text-stone-400 hover:text-green-700 dark:hover:text-green-400 hover:bg-stone-50 dark:hover:bg-stone-900/50 rounded-xl text-sm transition-all group">
            <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">help</span>
            <span className="font-medium">Bantuan & Dukungan</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-500 dark:text-stone-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl text-sm transition-all group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">logout</span>
            <span className="font-medium">Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-stone-950/90 backdrop-blur-lg px-6 h-16 flex justify-between items-center z-50 border-t border-stone-200 dark:border-stone-800">
        {navItems.map((item) => (
          <Link 
            key={item.href}
            href={item.href} 
            className={`flex flex-col items-center gap-1 ${
              isActive(item.href) ? 'text-green-900 dark:text-green-400' : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <span 
              className="material-symbols-outlined"
              style={{ fontVariationSettings: isActive(item.href) ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-bold">{item.label.split(' ')[0]}</span>
          </Link>
        ))}
        <Link 
          href="/dashboard/results" 
          className={`flex flex-col items-center gap-1 ${
            isActive('/dashboard/results') ? 'text-green-900 dark:text-green-400' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <span 
            className="material-symbols-outlined"
            style={{ fontVariationSettings: isActive('/dashboard/results') ? "'FILL' 1" : "'FILL' 0" }}
          >
            psychology
          </span>
          <span className="text-[10px] font-bold">Histori</span>
        </Link>
        <Link 
          href="/dashboard/predict" 
          className={`flex flex-col items-center gap-1 ${
            isActive('/dashboard/predict') ? 'text-green-900 dark:text-green-400' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <span 
            className="material-symbols-outlined"
            style={{ fontVariationSettings: isActive('/dashboard/predict') ? "'FILL' 1" : "'FILL' 0" }}
          >
            add_circle
          </span>
          <span className="text-[10px] font-bold">Prediksi</span>
        </Link>
      </nav>
    </>
  );
}

