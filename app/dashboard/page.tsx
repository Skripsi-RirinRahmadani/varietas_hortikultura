"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ModelPerformance, ProductionStat } from '@/lib/types';

export default function DashboardPage() {
  const [totalCommodities, setTotalCommodities] = useState(0);
  const [totalPredictions, setTotalPredictions] = useState(0);
  const [modelPerf, setModelPerf] = useState<ModelPerformance | null>(null);
  const [productionStats, setProductionStats] = useState<ProductionStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // Fetch total commodities
        const { count: commoditiesCount } = await supabase
          .from('commodities')
          .select('*', { count: 'exact', head: true });
        setTotalCommodities(commoditiesCount || 0);

        // Fetch total predictions
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { count: predictionsCount } = await supabase
            .from('predictions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          setTotalPredictions(predictionsCount || 0);
        }

        // Fetch metadata
        const { data: metadata } = await supabase
          .from('dashboard_metadata')
          .select('*');

        if (metadata) {
          const perf = metadata.find(m => m.key === 'model_performance');
          const prod = metadata.find(m => m.key === 'production_stats');
          
          if (perf) setModelPerf(perf.value as ModelPerformance);
          if (prod) setProductionStats(prod.value as ProductionStat[]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Use metadata values or defaults
  const perf = modelPerf || { accuracy: 94.2, delay: 0.8, training_data: 10273, test_data: 2569 };
  const stats = productionStats.length > 0 ? productionStats : [ 
    { name: 'Cabai', value: 95, label: '2.4k Ton' },
    { name: 'Tomat', value: 88, label: '2.1k Ton' },
    { name: 'Semangka', value: 75, label: '1.8k Ton' }
  ];

  const totalArsip = totalCommodities + totalPredictions;

  return (
    <AppLayout title="Ikhtisar">
      {/* Page Header */}
      <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold tracking-tight text-green-950 dark:text-green-50 mb-2">Ikhtisar Pertanian</h1>
        <p className="text-on-surface-variant max-w-2xl leading-relaxed">
          Performa sistem dan analisis hasil tanaman untuk Kabupaten Aceh Utara. 
          Data disinkronisasi {loading ? 'saat ini...' : 'secara real-time dari Supabase'}.
        </p>
      </div>
      
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* 1. Dataset Summary Card */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/15 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary block">Total Arsip</span>
            </div>
            <h2 className="text-6xl font-headline font-extrabold text-green-950 dark:text-green-50 mb-2 tracking-tighter">
              {(!isMounted || loading) ? '---' : totalArsip.toLocaleString('id-ID')}
            </h2>
            <p className="text-on-surface-variant text-sm font-medium opacity-70">Entri Data Terverifikasi</p>
          </div>
          <div className="mt-8 pt-6 border-t border-outline-variant/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant opacity-60">Komoditas Terdaftar</span>
              <span className="text-primary font-bold">{totalCommodities}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-on-surface-variant opacity-60">Hasil Prediksi</span>
              <span className="text-secondary font-bold">{totalPredictions}</span>
            </div>
          </div>
        </div>
        
        {/* 2. Model Performance Card */}
        <div className="md:col-span-8 bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/15 flex flex-col md:flex-row shadow-sm">
          <div className="flex-1 p-8">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Model Random Forest</span>
            <h3 className="text-2xl font-bold mb-4">Performa Integritas</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-on-surface">Data Latih</span>
                  <span className="text-sm font-bold text-primary">{isMounted ? perf.training_data.toLocaleString('id-ID') : '...'} rekaman</span>
                </div>
                <div className="h-3 w-full bg-secondary-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[80%] rounded-full transition-all duration-1000"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-on-surface">Data Uji</span>
                  <span className="text-sm font-bold text-tertiary">{isMounted ? perf.test_data.toLocaleString('id-ID') : '...'} rekaman</span>
                </div>
                <div className="h-3 w-full bg-secondary-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container w-[20%] rounded-full transition-all duration-1000"></div>
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/5">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 opacity-60">Akurasi Model</p>
                <p className="text-2xl font-black text-primary">{perf.accuracy}%</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/5">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 opacity-60">Delay Pemrosesan</p>
                <p className="text-2xl font-black text-primary">{perf.delay}s</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 bg-primary-container relative min-h-[200px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-90" />
            <img 
              alt="Data visualization pattern" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 scale-110" 
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop"
            />
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10">
              <span className="material-symbols-outlined text-4xl mb-4 opacity-50">memory</span>
              <p className="text-sm font-bold leading-snug opacity-90">
                Classifier menggunakan arsitektur hibrida untuk pemetaan wilayah optimal di Aceh Utara.
              </p>
            </div>
          </div>
        </div>
        
        {/* 3. Statistics Chart */}
        <div className="md:col-span-12 bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">Distribusi Komoditas</span>
              <h3 className="text-3xl font-black tracking-tight">Komoditas Unggulan Teratas</h3>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-black uppercase tracking-widest">Musim Aktif</span>
              <span className="px-4 py-2 bg-surface-container-highest text-on-surface-variant rounded-full text-[10px] font-black uppercase tracking-widest">Supabase Managed</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {stats.map((item, index) => (
              <div className="group flex items-center gap-4 animate-in slide-in-from-left duration-500" key={index} style={{ animationDelay: `${index * 50}ms` }}>
                <div className="w-32 shrink-0 text-right">
                  <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{item.name}</span>
                </div>
                <div className="flex-1 h-10 bg-surface-container-highest rounded-2xl overflow-hidden relative border border-outline-variant/5">
                  <div 
                    className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary-container transition-all duration-1000 ease-out" 
                    style={{ width: `${item.value}%`, opacity: 1 - index * 0.05 }}
                  ></div>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-on-surface-variant group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Secondary Analysis Card */}
        <div className="md:col-span-12 p-10 bg-green-900 text-white rounded-[2.5rem] flex flex-col md:flex-row items-center gap-10 relative overflow-hidden shadow-xl">
          <div className="z-10 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-6 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Rekomendasi AI</span>
            </div>
            <h4 className="text-3xl font-black mb-4 tracking-tight">Intelijen Tanah Strategis</h4>
            <p className="text-white/70 max-w-xl leading-relaxed mb-8 font-medium">Model kami menyarankan peningkatan hasil sebesar 12% untuk area dataran rendah jika jadwal irigasi disesuaikan dengan prakiraan curah hujan terbaru di Kabupaten Aceh Utara.</p>
            <Link href="/dashboard/results" className="bg-white text-green-950 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest inline-flex items-center gap-2 hover:bg-green-50 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/20">
              Jelajahi Rekomendasi
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="shrink-0 z-10 hidden md:block">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <img 
                    alt="Agricultural landscape" 
                    className="w-72 h-52 rounded-3xl object-cover shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 relative z-10 border-4 border-white/10" 
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop"
                />
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/5 rounded-full blur-[80px]"></div>
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-[60px]"></div>
        </div>
      </div>
      
      {/* Institutional Signature */}
      <footer className="mt-20 py-10 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
            </div>
            <span className="font-headline font-bold text-[10px] uppercase tracking-[0.2em] text-on-surface-variant max-w-[200px]">
                Dinas Pertanian dan Tanaman Pangan Kabupaten Aceh Utara
            </span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-40">© 2024 Arsitektur Sistem Pemerintah. Seluruh Hak Cipta Dilindungi.</p>
      </footer>
    </AppLayout>
  );
}
