import React from 'react';

export default function TopBar() {
  return (
    <header className="bg-[#faf9f5]/80 dark:bg-stone-900/80 backdrop-blur-xl fixed top-0 w-full z-50 shadow-sm dark:shadow-none">
      <div className="flex justify-between items-center px-6 h-16 w-full max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <span className="text-sm font-black uppercase tracking-[0.05em] text-green-950 dark:text-green-100">
            Dinas Pertanian dan Tanaman Pangan Aceh Utara
          </span>
          <div className="hidden md:flex items-center bg-surface-container rounded-full px-4 py-1.5 gap-2 border border-outline-variant/10">
            <span className="material-symbols-outlined text-on-surface-variant text-sm" data-icon="search">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder-on-surface-variant/60" 
              placeholder="Search data points..." 
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-green-900 dark:text-green-50 hover:bg-stone-100/50 dark:hover:bg-stone-800/50 transition-colors active:scale-95 duration-150 ease-in-out rounded-full w-10 h-10 flex items-center justify-center">
            <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
          </button>
          <button className="p-2 text-green-900 dark:text-green-50 hover:bg-stone-100/50 dark:hover:bg-stone-800/50 transition-colors active:scale-95 duration-150 ease-in-out rounded-full w-10 h-10 flex items-center justify-center">
            <span className="material-symbols-outlined" data-icon="settings">settings</span>
          </button>
          <div className="h-8 w-8 rounded-full bg-primary-container overflow-hidden ring-2 ring-outline-variant/20">
            <img 
              alt="User profile photo" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYrIy4bKv55dC8o-HsMusgXpmWoJpLyZZJQDf5dmp1shpaPj5D92c9xVcFRqtfmZrJ8mhdMdn0TijtpoA9xGizr85EKzwMyTs77hW6fiRHbcNlc-ri2huvkPhRKur2tJr1IvaQhkIqmYA-cjK6Tid3UQ3JpvUMAzTdbalYGznZK8JWugJwdPz8RiskbZSmt9DXrrTc3mdzeUwmJnUOWB70jNYvLd8NEXXBlLWi6LCe7cbz3STVVmJzg9dQIC_ej6Uo6DeFpVm7Xhe3"
            />
          </div>
        </div>
      </div>
      <div className="bg-stone-200/20 dark:bg-stone-800/20 h-[1px] w-full block"></div>
    </header>
  );
}
