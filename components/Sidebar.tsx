import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <>
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 p-4 space-y-6 bg-[#eeeeea] dark:bg-stone-950 z-40 pt-20">
        <div className="px-2">
          <h2 className="font-headline font-extrabold text-green-900 dark:text-green-50 text-xl tracking-tight">Dinas Pertanian</h2>
          <p className="text-xs text-on-surface-variant font-medium opacity-70">Aceh Utara</p>
        </div>
        <nav className="flex-1 space-y-1 pt-4">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-stone-900 text-green-900 dark:text-green-400 font-bold rounded-lg shadow-sm hover:translate-x-1 transition-transform duration-200">
            <span className="material-symbols-outlined" data-icon="dashboard" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="font-body text-sm tracking-wide">Dashboard</span>
          </Link>
          <Link href="/dashboard/data" className="flex items-center gap-3 px-4 py-3 text-stone-600 dark:text-stone-400 hover:text-green-800 dark:hover:text-green-300 hover:translate-x-1 transition-transform duration-200">
            <span className="material-symbols-outlined" data-icon="database">database</span>
            <span className="font-body text-sm tracking-wide">Data Management</span>
          </Link>
          <Link href="/dashboard/results" className="flex items-center gap-3 px-4 py-3 text-stone-600 dark:text-stone-400 hover:text-green-800 dark:hover:text-green-300 hover:translate-x-1 transition-transform duration-200">
            <span className="material-symbols-outlined" data-icon="psychology">psychology</span>
            <span className="font-body text-sm tracking-wide">Recommendations</span>
          </Link>
        </nav>
        <div className="pt-4">
          <Link href="/dashboard/predict" className="w-full py-3 px-4 rounded-lg bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-lg" data-icon="add">add</span>
            New Analysis
          </Link>
        </div>
        <div className="mt-auto border-t border-stone-200 dark:border-stone-800 pt-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-stone-500 dark:text-stone-400 hover:text-green-800 dark:hover:text-green-300 text-sm">
            <span className="material-symbols-outlined text-sm" data-icon="help">help</span>
            Support
          </button>
          <Link href="/login" className="w-full flex items-center gap-3 px-4 py-2 text-stone-500 dark:text-stone-400 hover:text-red-800 dark:hover:text-red-400 text-sm">
            <span className="material-symbols-outlined text-sm" data-icon="logout">logout</span>
            Log Out
          </Link>
        </div>
      </aside>

      {/* Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg px-6 h-16 flex justify-between items-center z-50 border-t border-outline-variant/10">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined" data-icon="dashboard" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="text-[10px] font-bold">Dashboard</span>
        </Link>
        <Link href="/dashboard/data" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined" data-icon="database">database</span>
          <span className="text-[10px] font-medium">Data</span>
        </Link>
        <Link href="/dashboard/results" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined" data-icon="psychology">psychology</span>
          <span className="text-[10px] font-medium">Model</span>
        </Link>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined" data-icon="settings">settings</span>
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </nav>
    </>
  );
}
