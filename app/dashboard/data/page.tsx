"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Commodity } from '@/lib/types';

export default function DataManagementPage() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommodities = async () => {
      const { data, error } = await supabase
        .from('commodities')
        .select('*, district:districts(name)');
      
      if (data) {
        setCommodities(data);
      }
      setLoading(false);
    };
    fetchCommodities();
  }, []);

  return (
    <AppLayout title="Manajemen Data">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Editorial Header Section */}
        <section className="relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-primary font-bold tracking-widest text-[10px] uppercase font-headline">Arsip Administratif</span>
              <h1 className="text-5xl font-extrabold font-headline tracking-tighter text-on-surface">Repositori Data Pertanian</h1>
              <p className="text-on-surface-variant max-w-xl text-lg opacity-80">Matriks tanah dan iklim komprehensif untuk optimasi tanaman di wilayah Kabupaten Aceh Utara.</p>
            </div>
            <Link href="/dashboard/results" className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-container transition-all shadow-sm">
              <span className="material-symbols-outlined">auto_fix_high</span>
              Praproses Data
            </Link>
          </div>
        </section>

        {/* Search & Filter Area (Bento-lite) */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 bg-surface-container-low p-6 rounded-xl">
            <div className="flex items-center gap-4 bg-surface-container-highest px-4 py-3 rounded-lg border-b-2 border-transparent focus-within:border-primary transition-all">
              <span className="material-symbols-outlined text-on-surface-variant">search</span>
              <input 
                className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-on-surface-variant/60 outline-none" 
                placeholder="Cari berdasarkan komoditas atau kecamatan..." 
                type="text"
              />
            </div>
          </div>
          <div className="md:col-span-4 bg-surface-container-low p-6 rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Rekaman</span>
              <span className="text-3xl font-black font-headline text-primary">1.248</span>
            </div>
            <div className="flex -space-x-2">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold ring-2 ring-surface">Rice</span>
              <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-xs font-bold ring-2 ring-surface">Corn</span>
            </div>
          </div>
        </section>

        {/* Data Table Section (Editorial Style) */}
        <section className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
          <div className="px-8 py-6 flex items-center justify-between border-b border-outline-variant/10">
            <h3 className="font-headline font-bold text-xl text-on-surface">Eksplorasi Dataset</h3>
            <div className="flex gap-2">
              <button className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">filter_list</button>
              <button className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">download</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-[11px] font-bold uppercase tracking-[0.1em]">
                  <th className="px-8 py-4">Komoditas</th>
                  <th className="px-4 py-4">Jenis Tanah</th>
                  <th className="px-4 py-4">pH Tanah</th>
                  <th className="px-4 py-4">Curah Hujan</th>
                  <th className="px-4 py-4">Suhu</th>
                  <th className="px-4 py-4">Kecamatan</th>
                  <th className="px-8 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {commodities.map((item) => (
                  <tr className="hover:bg-surface-container-low/50 transition-colors group" key={item.id}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md overflow-hidden bg-surface-container">
                          {item.image_url && <img alt={item.name} className="w-full h-full object-cover" src={item.image_url} />}
                        </div>
                        <span className="font-bold text-on-surface">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-6 text-on-surface-variant">{item.soil_type}</td>
                    <td className="px-4 py-6 text-on-surface font-medium">
                      {item.ph_min} - {item.ph_max}
                    </td>
                    <td className="px-4 py-6 text-on-surface-variant font-medium">
                      {item.rainfall_min} - {item.rainfall_max} mm
                    </td>
                    <td className="px-4 py-6 text-on-surface-variant font-medium">
                      {item.temp_min} - {item.temp_max}°C
                    </td>
                    <td className="px-4 py-6 text-on-surface">
                      {(item as any).district?.name || '---'}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        item.status === 'Unggulan' 
                          ? 'bg-primary-fixed text-on-primary-fixed-variant' 
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {loading && (
                  <tr>
                    <td className="px-8 py-10 text-center" colSpan={7}>
                      <span className="text-on-surface-variant animate-pulse font-medium">Memuat data repositori...</span>
                    </td>
                  </tr>
                )}
                {!loading && commodities.length === 0 && (
                  <tr>
                    <td className="px-8 py-10 text-center" colSpan={7}>
                      <span className="text-on-surface-variant font-medium">Tidak ada data ditemukan.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-8 py-6 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-lowest/50">
            <span className="text-xs text-on-surface-variant font-medium">Menampilkan 1-10 dari 1.248 entri</span>
            <div className="flex gap-1">
              {[1, 2, 3, '...', 125].map((page, i) => (
                <button 
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition-all ${
                    page === 1 ? 'bg-primary text-white shadow-sm' : 'hover:bg-surface-container text-on-surface-variant'
                  } ${page === '...' ? 'cursor-default pointer-events-none' : ''}`}
                  key={i}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Recommendation Card (Specialized Component) */}
        <section className="bg-surface p-1 rounded-2xl border border-outline-variant/10">
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/20 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase font-headline">Dinas Pertanian Identity</span>
              <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="flex-1 space-y-4">
                <h4 className="text-2xl font-bold font-headline text-on-surface tracking-tight">Laporan Kualitas Preprocessing Data</h4>
                <p className="text-lg text-on-surface-variant leading-relaxed">
                  Siklus pembersihan otomatis terakhir mengidentifikasi <span className="font-bold text-tertiary">14 inkonsistensi</span> dalam pencatatan pH tanah dari Kecamatan Lhoksukon. Direkomendasikan untuk melakukan verifikasi manual bagi entri jenis tanah Aluvial sebelum proyeksi panen akhir.
                </p>
              </div>
              <div className="w-full md:w-64 bg-surface-container-low p-6 rounded-xl space-y-4 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-on-surface-variant">Progres Hasil Panen</span>
                  <span className="text-xs font-bold text-primary">84%</span>
                </div>
                <div className="w-full h-3 bg-secondary-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[84%] rounded-full shadow-lg"></div>
                </div>
                <p className="text-[10px] text-on-surface-variant/70 italic leading-snug">Proyeksi hasil panen berdasarkan kelembaban tanah dan data presipitasi saat ini di wilayah Aceh Utara.</p>
              </div>
            </div>
            {/* Organic Pattern Overlay */}
            <div className="absolute top-0 right-0 opacity-5 pointer-events-none -mr-16 -mt-16">
              <span className="material-symbols-outlined text-[320px]">grid_guides</span>
            </div>
          </div>
        </section>
      </div>

      {/* Institutional Footer */}
      <footer className="mt-20 py-10 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 opacity-70">
        <span className="font-body font-semibold text-xs uppercase tracking-[0.1em] text-on-surface">Dinas Pertanian dan Tanaman Pangan Kabupaten Aceh Utara</span>
        <p className="text-xs text-on-surface-variant font-medium">© 2024 Sistem Manajemen Pertanian. Seluruh Hak Cipta Dilindungi.</p>
      </footer>
    </AppLayout>
  );
}
