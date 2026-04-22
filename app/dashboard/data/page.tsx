"use client";

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Commodity, District } from '@/lib/types';
import CommodityDialog from '@/components/CommodityDialog';
import { exportToCSV, parseCSV } from '@/lib/csv-utils';
import { Button } from '@/components/ui/button';

export default function DataManagementPage() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data: commodityData } = await supabase
      .from('commodities')
      .select('*, district:districts(name)')
      .order('name', { ascending: true });
    
    if (commodityData) setCommodities(commodityData);

    const { data: districtData } = await supabase
      .from('districts')
      .select('*')
      .order('name', { ascending: true });
    
    if (districtData) setDistricts(districtData);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (item: Commodity) => {
    setSelectedCommodity(item);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedCommodity(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const { error } = await supabase
        .from('commodities')
        .delete()
        .eq('id', id);
      
      if (!error) {
        fetchData();
      } else {
        alert('Gagal menghapus data.');
      }
    }
  };

  const handleExport = () => {
    exportToCSV(commodities, `data-komoditas-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const parsedData = parseCSV(content);
      
      if (parsedData.length === 0) {
        alert('File CSV kosong atau tidak valid.');
        return;
      }

      setLoading(true);
      try {
        // Prepare data with district_id mapping
        const dataToInsert = parsedData.map(item => {
          const district = districts.find(d => d.name.toLowerCase() === (item as any)._district_name?.toLowerCase());
          const { _district_name, ...cleanItem } = item as any;
          return {
            ...cleanItem,
            district_id: district?.id || districts[0]?.id // Fallback to first district if not found
          };
        });

        const { error } = await supabase.from('commodities').upsert(dataToInsert);
        if (error) throw error;
        
        alert(`Berhasil mengimpor ${dataToInsert.length} data.`);
        fetchData();
      } catch (err) {
        console.error('Import error:', err);
        alert('Gagal mengimpor data. Pastikan format CSV sesuai.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const filteredCommodities = commodities.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.soil_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.district?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout title="Manajemen Data">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-700">
        {/* Header Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background p-8 border border-primary/5 shadow-sm">
          <div className="absolute top-0 right-0 -m-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-[2px] bg-primary rounded-full" />
                <span className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase font-headline">Dataset Unggulan</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface">
                Data <span className="text-primary">Komoditas</span>
              </h1>
              <p className="text-on-surface-variant max-w-2xl text-base md:text-lg opacity-70 leading-relaxed font-medium">
                Pusat manajemen parameter varietas hortikultura untuk optimalisasi pertanian di Kabupaten Aceh Utara.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleAdd} 
                className="group relative overflow-hidden h-12 px-6 rounded-2xl bg-primary text-on-primary hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20 active:scale-95"
              >
                <div className="flex items-center gap-2 relative z-10">
                  <span className="material-symbols-outlined text-sm transition-transform group-hover:rotate-90 duration-300">add</span>
                  <span className="text-sm font-bold">Tambah Rekaman</span>
                </div>
              </Button>
              <Link 
                href="/dashboard/results" 
                className="flex items-center gap-2 px-6 h-12 bg-surface-container-highest text-on-surface rounded-2xl font-bold hover:bg-surface-container-high transition-all active:scale-95 border border-outline-variant/10 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                <span className="text-sm font-bold">Analisis</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Action Toolbar */}
        <section className="sticky top-20 z-[40] space-y-4">
            <div className="bg-surface-container-low/80 backdrop-blur-xl p-3 rounded-[2.5rem] border border-outline-variant/20 shadow-xl shadow-surface-container-lowest/50">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 flex items-center gap-3 bg-surface-container-lowest px-5 py-3.5 rounded-2xl shadow-inner border border-outline-variant/10 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all duration-300">
                        <span className="material-symbols-outlined text-on-surface-variant/50 text-xl">search</span>
                        <input 
                            className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-on-surface-variant/40 outline-none text-sm font-medium" 
                            placeholder="Cari komoditas, jenis tanah atau lokasi..." 
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 p-1">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept=".csv" 
                            onChange={handleFileChange}
                        />
                        <Button 
                            onClick={handleImportClick}
                            variant="outline"
                            className="h-11 px-6 rounded-xl flex items-center gap-2 border-outline-variant/20 bg-transparent hover:bg-surface-container transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">publish</span>
                            <span className="font-bold text-[10px] uppercase tracking-widest md:block hidden">Import</span>
                        </Button>
                        <Button 
                            onClick={handleExport}
                            variant="outline"
                            className="h-11 px-6 rounded-xl flex items-center gap-2 border-outline-variant/20 bg-transparent hover:bg-surface-container transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">file_download</span>
                            <span className="font-bold text-[10px] uppercase tracking-widest md:block hidden">Export</span>
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 mt-2">
                    <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-primary'}`} />
                        <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-[0.15em] flex items-center gap-2">
                            {loading ? 'Menyelaraskan...' : (
                                <>
                                    <span className="text-primary font-black">{filteredCommodities.length}</span>
                                    <span>Dataset Aktif</span>
                                </>
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 group">
                        <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest mr-2 opacity-0 group-hover:opacity-100 transition-opacity">Kontrol Tampilan</span>
                        <button className="material-symbols-outlined w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all">tune</button>
                        <button className="material-symbols-outlined w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all">sort_by_alpha</button>
                    </div>
                </div>
            </div>

        </section>

        {/* Data Content Area */}
        <section className="pb-20">
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-6 md:hidden">
            {filteredCommodities.map((item, idx) => (
              <div 
                key={item.id} 
                className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm space-y-5 animate-in slide-in-from-bottom-4 duration-500" 
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-container-highest flex items-center justify-center border border-outline-variant/10 shadow-inner group-hover:scale-105 transition-transform duration-300">
                      {item.image_url ? (
                        <img alt={item.name} className="w-full h-full object-cover" src={item.image_url} />
                      ) : (
                        <span className="material-symbols-outlined text-primary/30 text-2xl">potted_plant</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="font-extrabold text-lg text-on-surface leading-tight mb-1">{item.name}</h3>
                    <div className="flex items-center gap-1.5 opacity-60">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        <p className="text-[11px] font-bold uppercase tracking-wider">{item.district?.name || 'Seluruh Wilayah'}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${
                    item.status === 'Unggulan' 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'pH Tanah', val: `${item.ph_min}-${item.ph_max}`, icon: 'science' },
                    { label: 'Curah Hujan', val: `${item.rainfall_min}mm`, icon: 'water_drop' },
                    { label: 'Suhu Optimal', val: `${item.temp_min}°C`, icon: 'thermostat' }
                  ].map(stat => (
                    <div key={stat.label} className="bg-surface-container-low/50 p-3 rounded-2xl border border-outline-variant/5 text-center">
                      <span className="material-symbols-outlined text-xs text-on-surface-variant/40 mb-1">{stat.icon}</span>
                      <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-tighter mb-1">{stat.label}</p>
                      <p className="text-xs font-black text-on-surface tracking-tight">{stat.val}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                        <span className="text-[10px] text-on-surface-variant font-bold italic opacity-50 truncate max-w-[140px]">
                            {item.soil_type || 'Tanpa keterangan tanah'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleEdit(item)}
                            className="w-11 h-11 flex items-center justify-center bg-primary/5 text-primary hover:bg-primary hover:text-on-primary rounded-xl transition-all duration-300 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button 
                            onClick={() => handleDelete(item.id)}
                            className="w-11 h-11 flex items-center justify-center bg-error/5 text-error hover:bg-error hover:text-white rounded-xl transition-all duration-300 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-surface-container-lowest rounded-[2.5rem] overflow-hidden shadow-2xl shadow-surface-container-lowest/10 border border-outline-variant/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50 text-on-surface-variant border-b border-outline-variant/10">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Komoditas & Tanah</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Biometrik Lingkungan</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Wilayah</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-center">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-right">Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {filteredCommodities.map((item) => (
                    <tr className="hover:bg-primary/[0.02] transition-colors group" key={item.id}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                            <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-surface-container-highest flex items-center justify-center border border-outline-variant/10 z-10">
                                {item.image_url ? (
                                <img alt={item.name} className="w-full h-full object-cover" src={item.image_url} />
                                ) : (
                                <span className="material-symbols-outlined text-primary/30 text-lg">potted_plant</span>
                                )}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-on-surface text-lg tracking-tight group-hover:text-primary transition-colors">{item.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant/30" />
                                <p className="text-[11px] text-on-surface-variant font-bold opacity-60 truncate max-w-[200px]">{item.soil_type || 'Tanpa keterangan khusus'}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-6">
                            <div className="space-y-1">
                                <span className="block text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">pH Tanah</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[10px] text-primary">circle</span>
                                    <span className="text-sm font-black tracking-tighter">{item.ph_min}-{item.ph_max}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="block text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Hujan</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[10px] text-blue-500">water_drop</span>
                                    <span className="text-sm font-black tracking-tighter">{item.rainfall_min} <span className="text-[9px] opacity-40 uppercase">mm</span></span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="block text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Suhu</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[10px] text-orange-500">thermostat</span>
                                    <span className="text-sm font-black tracking-tighter">{item.temp_min}-{item.temp_max}°C</span>
                                </div>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant/10">
                          <span className="material-symbols-outlined text-xs text-primary/60">location_on</span>
                          <span className="text-[11px] font-black tracking-tight">{item.district?.name || '---'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-sm ${
                          item.status === 'Unggulan' 
                            ? 'bg-primary text-on-primary' 
                            : 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/10'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-xl transition-all duration-300 shadow-sm"
                            title="Edit Data"
                          >
                            <span className="material-symbols-outlined text-lg">edit_note</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="w-10 h-10 flex items-center justify-center bg-error/10 text-error hover:bg-error hover:text-white rounded-xl transition-all duration-300 shadow-sm"
                            title="Hapus Data"
                          >
                            <span className="material-symbols-outlined text-lg">delete_sweep</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* States */}
          {loading && (
            <div className="mt-8 py-32 text-center bg-surface-container-lowest/50 backdrop-blur rounded-[2.5rem] border border-outline-variant/10 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-surface-container-high">
                    <div className="h-full bg-primary animate-progress origin-left w-1/3" />
                </div>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-[3px] border-primary/10 border-t-primary rounded-full animate-spin"></div>
                    <div className="space-y-1">
                        <p className="text-on-surface font-black text-sm uppercase tracking-[0.3em]">Singkronisasi Database</p>
                        <p className="text-on-surface-variant text-[10px] font-medium opacity-50">Mengunduh metadata komoditas terbaru...</p>
                    </div>
                </div>
            </div>
          )}
          {!loading && filteredCommodities.length === 0 && (
            <div className="mt-8 py-32 text-center bg-surface-container-lowest rounded-[2.5rem] border border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center relative">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">search_off</span>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-error/10 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm text-error">close</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <h3 className="text-on-surface font-black text-lg">Pencarian Tidak Ditemukan</h3>
                    <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest opacity-40 max-w-[240px]">
                        Coba gunakan kata kunci lain atau bersihkan filter pencarian Anda.
                    </p>
                </div>
                <Button onClick={() => setSearchQuery('')} variant="outline" className="rounded-full px-8 text-[10px] font-black uppercase tracking-widest border-outline-variant/50">
                    Atur Ulang
                </Button>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredCommodities.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 pt-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant border border-outline-variant/5">
                        <span className="text-xs font-black">{filteredCommodities.length}</span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-50">Dataset Ditampilkan</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-sm">
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-highest transition-all group active:scale-90">
                        <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">chevron_left</span>
                    </button>
                    {[1].map(p => (
                        <button key={p} className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-on-primary font-black text-xs shadow-lg shadow-primary/20 transition-all active:scale-95">
                            {p}
                        </button>
                    ))}
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-highest transition-all group active:scale-90">
                        <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">chevron_right</span>
                    </button>
                </div>
            </div>
          )}
        </section>

        {/* Simplified Footer Info */}
        <div className="pt-12 pb-10 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                    <span className="material-symbols-outlined text-sm">verified</span>
                </div>
                <div className="space-y-0.5">
                    <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface">Data Terverifikasi</span>
                    <span className="block text-[8px] font-bold uppercase tracking-widest text-on-surface-variant opacity-40">Integritas Metadata 100%</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="h-4 w-[1px] bg-outline-variant/20 hidden md:block" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40">Dataset Pertanian © 2024 Aceh Utara</p>
            </div>
        </div>
      </div>

      <CommodityDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        commodity={selectedCommodity}
        districts={districts}
        onSuccess={fetchData}
      />
    </AppLayout>
  );

}
