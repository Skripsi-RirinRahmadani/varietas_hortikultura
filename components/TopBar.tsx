"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export default function TopBar({ title }: { title?: string }) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 w-full z-50 border-b border-stone-200/50 dark:border-stone-800/50">
      <div className="flex justify-between items-center px-6 h-16 w-full max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <span className="text-sm font-black uppercase tracking-[0.05em] text-green-950 dark:text-green-100 hidden sm:block">
            {title || "Sistem Varietas Hortikultura"}
          </span>
          <div className="md:flex items-center bg-stone-100/50 dark:bg-stone-800/50 rounded-xl px-4 py-2 gap-3 border border-stone-200/20 dark:border-stone-700/20 group transition-all duration-300 focus-within:ring-2 focus-within:ring-green-500/20 focus-within:bg-white dark:focus-within:bg-stone-800 shadow-sm">
            <span className="material-symbols-outlined text-stone-400 group-focus-within:text-green-600 transition-colors" data-icon="search">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-48 lg:w-64 placeholder-stone-400 outline-none" 
              placeholder="Cari data..." 
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <button className="p-2 text-stone-600 dark:text-stone-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all rounded-lg active:scale-95">
              <span className="material-symbols-outlined text-[22px]" data-icon="notifications">notifications</span>
            </button>
            <button className="p-2 text-stone-600 dark:text-stone-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all rounded-lg active:scale-95">
              <span className="material-symbols-outlined text-[22px]" data-icon="settings_suggest">settings_suggest</span>
            </button>
            <ThemeToggle />
          </div>

          <div className="h-8 w-[1px] bg-stone-200 dark:bg-stone-800 mx-1 hidden sm:block"></div>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-all active:scale-[0.98]"
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-stone-900 shadow-md">
                {user?.user_metadata?.avatar_url ? (
                  <img 
                    alt="User" 
                    src={user?.user_metadata?.avatar_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {user?.email?.[0].toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col items-start leading-tight">
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}
                </span>
                <span className="text-[10px] font-medium text-stone-500 uppercase tracking-widest">
                  {user?.user_metadata?.role || "Personal"}
                </span>
              </div>
              <span className={`material-symbols-outlined text-stone-400 text-lg transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} data-icon="expand_more">expand_more</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200/50 dark:border-stone-800/50 py-2 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 ease-out overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 mb-2 bg-stone-50/50 dark:bg-black/20">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">Akun Terhubung</p>
                  <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{user?.email}</p>
                </div>

                <div className="px-2 space-y-1">
                  <Link 
                    href="/dashboard/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-800/30 transition-colors">
                      <span className="material-symbols-outlined text-[18px]" data-icon="person">person</span>
                    </div>
                    <span className="text-sm font-medium">Profil Lengkap</span>
                  </Link>
                  <Link 
                    href="/dashboard/results"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-800/30 transition-colors">
                      <span className="material-symbols-outlined text-[18px]" data-icon="history">history</span>
                    </div>
                    <span className="text-sm font-medium">Riwayat Aktivitas</span>
                  </Link>
                </div>

                <div className="my-2 border-t border-stone-100 dark:border-stone-800"></div>

                <div className="px-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/10 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-800/30 transition-colors">
                      <span className="material-symbols-outlined text-[18px]" data-icon="logout">logout</span>
                    </div>
                    <span className="text-sm font-bold">Keluar Sistem</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
