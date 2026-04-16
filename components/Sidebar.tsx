"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Sidebar() {
  const pathname = usePathname();
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dasbor', icon: 'dashboard' },
    { href: '/dashboard/data', label: 'Manajemen Data', icon: 'database' },
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('predictions')
        .select('id, created_at, variety_name, soil_type')
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
          setHistory((prev) => [payload.new, ...prev.slice(0, 4)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 p-4 space-y-6 bg-[#eeeeea] dark:bg-stone-950 z-40 pt-20">
        <div className="px-2">
          <h2 className="font-headline font-extrabold text-green-900 dark:text-green-50 text-xl tracking-tight">Dinas Pertanian</h2>
          <p className="text-xs text-on-surface-variant font-medium opacity-70">Aceh Utara</p>
        </div>
        <nav className="flex-1 space-y-1 pt-4">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:translate-x-1 ${
                isActive(item.href) 
                  ? 'bg-white dark:bg-stone-900 text-green-900 dark:text-green-400 font-bold shadow-sm' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-green-800 dark:hover:text-green-300'
              }`}
            >
              <span 
                className="material-symbols-outlined" 
                style={{ fontVariationSettings: isActive(item.href) ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-body text-sm tracking-wide">{item.label}</span>
            </Link>
          ))}

          {/* Dropdown Rekomendasi */}
          <div className="space-y-1">
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive('/dashboard/results') || isHistoryOpen
                  ? 'bg-white dark:bg-stone-900 text-green-900 dark:text-green-400 font-bold shadow-sm' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-green-800 dark:hover:text-green-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span 
                  className="material-symbols-outlined" 
                  style={{ fontVariationSettings: isActive('/dashboard/results') ? "'FILL' 1" : "'FILL' 0" }}
                >
                  psychology
                </span>
                <span className="font-body text-sm tracking-wide">Rekomendasi</span>
              </div>
              <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isHistoryOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {isHistoryOpen && (
              <div className="ml-9 flex flex-col gap-1 pr-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Link 
                  href="/dashboard/results"
                  className={`text-xs p-2 rounded-md hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors ${
                    isActive('/dashboard/results') && !pathname.includes('id=') ? 'text-green-800 font-bold' : 'text-stone-500'
                  }`}
                >
                  Lihat Semua
                </Link>
                {history.length > 0 ? (
                  history.map((item) => (
                    <Link 
                      key={item.id}
                      href={`/dashboard/results?id=${item.id}`}
                      className={`text-[11px] p-2 border-l-2 border-transparent hover:border-green-600 hover:bg-stone-200 dark:hover:bg-stone-800 transition-all flex flex-col ${
                        pathname.includes(item.id) ? 'border-green-600 bg-stone-200 dark:bg-stone-800 text-green-800 font-bold' : 'text-stone-500'
                      }`}
                    >
                      <span className="truncate">{item.variety_name}</span>
                      <span className="text-[9px] opacity-60">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {item.soil_type}
                      </span>
                    </Link>
                  ))
                ) : (
                  <span className="text-[10px] p-2 text-stone-400 italic">Belum ada histori</span>
                )}
              </div>
            )}
          </div>
        </nav>
        <div className="pt-4">
          <Link 
            href="/dashboard/predict" 
            className={`w-full py-3 px-4 rounded-lg bg-gradient-to-br from-[#00450d] to-[#065f18] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity ${
              isActive('/dashboard/predict') ? 'ring-2 ring-[#00450d] ring-offset-2' : ''
            }`}
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Analisis Baru
          </Link>
        </div>
        <div className="mt-auto border-t border-stone-200 dark:border-stone-800 pt-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-stone-500 dark:text-stone-400 hover:text-green-800 dark:hover:text-green-300 text-sm">
            <span className="material-symbols-outlined text-sm">help</span>
            Bantuan
          </button>
          <Link href="/login" className="w-full flex items-center gap-3 px-4 py-2 text-stone-500 dark:text-stone-400 hover:text-red-800 dark:hover:text-red-400 text-sm">
            <span className="material-symbols-outlined text-sm">logout</span>
            Keluar
          </Link>
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

