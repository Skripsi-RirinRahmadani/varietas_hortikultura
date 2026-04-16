import React from 'react';
import AppLayout from '@/components/AppLayout';

export default function DashboardPage() {
  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-green-950 dark:text-green-50 mb-2">Agricultural Overview</h1>
        <p className="text-on-surface-variant max-w-2xl leading-relaxed">System performance and crop yield analysis for Kabupaten Aceh Utara. Data synchronized as of today.</p>
      </div>
      
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* 1. Dataset Summary Card */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/15 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Archive Total</span>
            <h2 className="text-6xl font-headline font-extrabold text-green-950 dark:text-green-50 mb-2">12,842</h2>
            <p className="text-on-surface-variant text-sm font-medium">Verified Data Entries</p>
          </div>
          <div className="mt-8 pt-6 border-t border-surface-container">
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Growth from last quarter</span>
              <span className="text-primary font-bold flex items-center">
                <span className="material-symbols-outlined text-sm mr-1" data-icon="arrow_upward">arrow_upward</span>
                8.4%
              </span>
            </div>
          </div>
        </div>
        
        {/* 2. Model Performance Card (Glassmorphism influence) */}
        <div className="md:col-span-8 bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/15 flex flex-col md:flex-row">
          <div className="flex-1 p-8">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Random Forest Model</span>
            <h3 className="text-2xl font-bold mb-4">Integrity Performance</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-on-surface">Training Set (80%)</span>
                  <span className="text-sm font-bold text-primary">10,273 records</span>
                </div>
                <div className="h-3 w-full bg-secondary-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[80%] rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-on-surface">Testing Set (20%)</span>
                  <span className="text-sm font-bold text-tertiary">2,569 records</span>
                </div>
                <div className="h-3 w-full bg-secondary-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container w-[20%] rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-surface-container-low">
                <p className="text-xs font-semibold text-on-surface-variant uppercase mb-1">Model Accuracy</p>
                <p className="text-2xl font-bold text-green-900">94.2%</p>
              </div>
              <div className="p-4 rounded-lg bg-surface-container-low">
                <p className="text-xs font-semibold text-on-surface-variant uppercase mb-1">Processing Delay</p>
                <p className="text-2xl font-bold text-green-900">0.8s</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 bg-primary-container relative min-h-[200px]">
            <img 
              alt="Data visualization pattern" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSUw7wNiI63Jl66E48mJMrqTYxgWasf2RkYN43YqtyQgIh6bcwdD7QugrqbrvYbFGlWUQG7XeFzsMN3suCoTXGigluBkOVfXy9DN0_YzAqqq1kTorvdijEZ_2JlLRPnSC_51eGzXjsxYSZgpMdl2B9YYgT0u3tcC_ajz3ZJdzHLwdMugNpBS6uxPaosoS7GWwyCOhA7GA_eDYo-koJ7iKibQUA6sJ04BJohF6W8cm_qXe8cUwBivurgPzv7jQElqU8xLGIc-8m5Oxa"
            />
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <span className="material-symbols-outlined text-4xl mb-4" data-icon="memory" style={{ fontVariationSettings: "'wght' 200" }}>memory</span>
              <p className="text-sm font-medium leading-tight opacity-90">Random Forest Classifier utilizing 500 decision trees for optimal regional mapping.</p>
            </div>
          </div>
        </div>
        
        {/* 3. Statistics Chart (Asymmetric Layout) */}
        <div className="md:col-span-12 bg-surface-container-low rounded-xl p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">Commodity Distribution</span>
              <h3 className="text-3xl font-bold">Top 10 High-Yield Commodities</h3>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold uppercase tracking-tight">Active Season</span>
              <span className="px-3 py-1 bg-surface-container-highest text-on-surface-variant rounded-full text-xs font-bold uppercase tracking-tight">2024 Dataset</span>
            </div>
          </div>
          
          {/* Visual Bar Chart Component */}
          <div className="space-y-4">
            {[ 
              { name: 'Chili', val: 95, label: '2.4k Tons' },
              { name: 'Tomato', val: 88, label: '2.1k Tons' },
              { name: 'Watermelon', val: 75, label: '1.8k Tons' },
              { name: 'Cucumber', val: 68, label: '1.6k Tons' },
              { name: 'Rice', val: 62, label: '1.5k Tons' },
              { name: 'Corn', val: 55, label: '1.2k Tons' },
              { name: 'Shallots', val: 48, label: '1.1k Tons' },
              { name: 'Cabbage', val: 42, label: '0.9k Tons' },
              { name: 'Eggplant', val: 35, label: '0.8k Tons' },
              { name: 'Spinach', val: 28, label: '0.6k Tons' },
            ].map((item, index) => (
              <div className="group flex items-center gap-4" key={index}>
                <div className="w-24 shrink-0 text-right">
                  <span className="text-sm font-bold text-on-surface">{item.name}</span>
                </div>
                <div className="flex-1 h-8 bg-surface-container-highest rounded-r-full overflow-hidden relative">
                  <div className={`h-full bg-gradient-to-r from-primary to-primary-container transition-all`} style={{ width: `${item.val}%`, opacity: 1 - index * 0.05 }}></div>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-white">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Secondary Analysis Card (Asymmetric detail) */}
        <div className="md:col-span-12 p-8 bg-tertiary text-white rounded-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="z-10 flex-1">
            <h4 className="text-2xl font-bold mb-4">Strategic Soil Intelligence</h4>
            <p className="text-white/80 max-w-xl leading-relaxed mb-6">Our model suggests a 12% increase in potential yield for lowland areas if irrigation schedules are adjusted according to the latest precipitation forecasts.</p>
            <button className="bg-white text-tertiary px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-white/90 transition-colors">
              Explore Recommendations
              <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
            </button>
          </div>
          <div className="shrink-0 z-10 hidden md:block">
            <img alt="Agricultural landscape" className="w-64 h-48 rounded-lg object-cover shadow-2xl rotate-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCZYv28zdir_BFormtTcmjPc0wL8TT1NXpLvR3uk2POxPEqdGcSReCLvxLBWqBLOMeTlwMo3SK6ZTHcHa-15lNPUCvo5FPhdzQC0Ymw9-6dtO3AiDlNwS8kaa1idon_poOIM98qal9OE3NcOtEB-UXlCB5DdpLPlvOx-uZtS_QFmjXpDzdSZnKpQYKaN0zO-rcbsy2NPiXeq-D1iPC_MGjmmajlRDLbfuoNxmDikpZGUDwMi8HqcuLPcpxOxwqfuFA0ORy7UhfcZii"/>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>
      
      {/* Institutional Signature */}
      <footer className="mt-20 py-10 border-t border-surface-container flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="font-body font-semibold text-xs uppercase tracking-[0.1em] text-on-surface opacity-60">Dinas Pertanian dan Tanaman Pangan Kabupaten Aceh Utara</span>
        <p className="text-xs text-on-surface-variant">© 2024 Goverment System Architecture. All Rights Reserved.</p>
      </footer>
    </AppLayout>
  );
}
