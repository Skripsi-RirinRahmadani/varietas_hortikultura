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
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Editorial Header Section */}
        <section className="relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-primary font-bold tracking-widest text-[10px] uppercase font-headline">Arsip Administratif</span>
              <h1 className="text-5xl font-extrabold font-headline tracking-tighter text-on-surface">Repositori Data Pertanian</h1>
              <p className="text-on-surface-variant max-w-xl text-lg opacity-80">Matriks tanah dan iklim komprehensif untuk optimasi tanaman di wilayah Kabupaten Aceh Utara.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAdd} className="h-12 px-6 rounded-xl shadow-lg hover:shadow-primary/20 flex items-center gap-2">
                <span className="material-symbols-outlined">add</span>
                Tambah Data
              </Button>
              <Link href="/dashboard/results" className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-on-surface rounded-xl font-semibold hover:bg-surface-container-highest transition-all shadow-sm">
                <span className="material-symbols-outlined">auto_fix_high</span>
                Proses
              </Link>
            </div>
          </div>
        </section>

        {/* Search & Filter Area (Bento-lite) */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
            <div className="flex items-center gap-4 bg-surface-container-lowest px-4 py-4 rounded-xl shadow-inner border border-outline-variant/5 focus-within:border-primary/30 transition-all">
              <span className="material-symbols-outlined text-on-surface-variant">search</span>
              <input 
                className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-on-surface-variant/60 outline-none" 
                placeholder="Cari berdasarkan komoditas, jenis tanah atau kecamatan..." 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-4 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Rekaman</span>
              <span className="text-3xl font-black font-headline text-primary">{commodities.length}</span>
            </div>
            <div className="flex gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv" 
                onChange={handleFileChange}
              />
              <Button 
                onClick={handleImportClick}
                variant="secondary"
                className="h-12 px-5 rounded-xl flex items-center gap-2 bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high transition-all border-none"
              >
                <span className="material-symbols-outlined text-[20px]">upload</span>
                <span className="font-semibold text-sm">Import CSV</span>
              </Button>
              <Button 
                onClick={handleExport}
                className="h-12 px-5 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-primary/20 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                <span className="font-semibold text-sm">Export CSV</span>
              </Button>
            </div>
          </div>
        </section>

        {/* Data Table Section (Editorial Style) */}
        <section className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-xl border border-outline-variant/10 transition-all hover:border-outline-variant/20">
          <div className="px-8 py-8 flex items-center justify-between border-b border-outline-variant/5 bg-gradient-to-r from-surface-container-lowest to-surface-container-low/30">
            <div>
              <h3 className="font-headline font-bold text-2xl text-on-surface">Eksplorasi Dataset</h3>
              <p className="text-xs text-on-surface-variant opacity-60 font-medium">Data parameter varietas hortikultura unggul</p>
            </div>
            <div className="flex gap-2">
              <button className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">filter_list</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">Komoditas</th>
                  <th className="px-4 py-5">Jenis Tanah</th>
                  <th className="px-4 py-5">pH Tanah</th>
                  <th className="px-4 py-5">Curah Hujan</th>
                  <th className="px-4 py-5">Suhu</th>
                  <th className="px-4 py-5">Kecamatan</th>
                  <th className="px-4 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {filteredCommodities.map((item) => (
                  <tr className="hover:bg-surface-container-low/40 transition-all group" key={item.id}>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-container-highest flex items-center justify-center border border-outline-variant/10 shadow-sm">
                          {item.image_url ? (
                            <img alt={item.name} className="w-full h-full object-cover" src={item.image_url} />
                          ) : (
                            <span className="material-symbols-outlined text-primary/40">potted_plant</span>
                          )}
                        </div>
                        <span className="font-bold text-on-surface text-lg tracking-tight group-hover:text-primary transition-colors">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-8 text-on-surface-variant font-medium">{item.soil_type || '---'}</td>
                    <td className="px-4 py-8">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-black text-sm">{item.ph_min} - {item.ph_max}</span>
                        <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-tighter">Skala pH</span>
                      </div>
                    </td>
                    <td className="px-4 py-8">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-black text-sm">{item.rainfall_min} - {item.rainfall_max}</span>
                        <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-tighter">mm / Tahun</span>
                      </div>
                    </td>
                    <td className="px-4 py-8">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-black text-sm">{item.temp_min} - {item.temp_max}°C</span>
                        <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-tighter">Celcius</span>
                      </div>
                    </td>
                    <td className="px-4 py-8">
                      <span className="px-3 py-1.5 bg-surface-container text-on-surface rounded-lg text-xs font-bold border border-outline-variant/10">
                        {item.district?.name || '---'}
                      </span>
                    </td>
                    <td className="px-4 py-8">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm transition-all group-hover:scale-105 ${
                        item.status === 'Unggulan' 
                          ? 'bg-primary-fixed text-on-primary-fixed-variant border border-primary/10' 
                          : 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/10'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="material-symbols-outlined p-2.5 text-on-surface-variant hover:bg-primary-fixed hover:text-on-primary-fixed-variant rounded-xl transition-all"
                        >
                          edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="material-symbols-outlined p-2.5 text-on-surface-variant hover:bg-error/10 hover:text-error rounded-xl transition-all"
                        >
                          delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {loading && (
                  <tr>
                    <td className="px-8 py-20 text-center" colSpan={8}>
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <span className="text-on-surface-variant font-black uppercase tracking-[0.2em] text-[10px]">Sinkronisasi Database...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && filteredCommodities.length === 0 && (
                  <tr>
                    <td className="px-8 py-20 text-center" colSpan={8}>
                      <div className="flex flex-col items-center gap-2 opacity-30">
                        <span className="material-symbols-outlined text-6xl">inventory_2</span>
                        <span className="text-on-surface-variant font-bold">Data tidak ditemukan dalam arsip.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-8 py-6 flex items-center justify-between border-t border-outline-variant/5 bg-surface-container-low/20">
            <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-wider">Menampilkan {filteredCommodities.length} dari {commodities.length} entri</span>
            <div className="flex gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-highest transition-all">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-highest transition-all">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        {/* Recommendation Card */}
        <section className="bg-surface-container-low p-1 rounded-[32px] border border-outline-variant/5 shadow-2xl shadow-on-surface/5">
          <div className="bg-surface-container-lowest p-10 rounded-[30px] border border-outline-variant/10 relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[11px] font-black text-primary tracking-[0.3em] uppercase font-headline bg-primary-fixed/30 px-4 py-2 rounded-full">Protokol Keamanan Data</span>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-outline-variant/30 to-transparent"></div>
            </div>
            <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
              <div className="flex-1 space-y-6">
                <h4 className="text-3xl font-black font-headline text-on-surface tracking-tight leading-tight">Integritas Repositori Digital</h4>
                <p className="text-xl text-on-surface-variant/80 leading-relaxed font-medium">
                  Setiap perubahan data direkam secara otomatis dalam audit log sistem. Pastikan parameter tanah dan iklim telah melalui validasi lapangan oleh tim penyuluh pertanian daerah sebelum disimpan secara permanen dalam dataset pusat.
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-lg">
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    Verified System
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-tertiary uppercase tracking-widest bg-tertiary/5 px-4 py-2 rounded-lg">
                    <span className="material-symbols-outlined text-sm">history</span>
                    Audit Log Active
                  </div>
                </div>
              </div>
              <div className="w-full md:w-80 bg-surface-container-low p-8 rounded-3xl space-y-6 shadow-inner border border-outline-variant/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Kapasitas Penyimpanan</span>
                  <span className="text-xs font-black text-primary">8.4 / 10 GB</span>
                </div>
                <div className="w-full h-4 bg-surface-container-highest rounded-full overflow-hidden p-1 shadow-inner">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-container w-[84%] rounded-full shadow-lg transition-all duration-1000"></div>
                </div>
                <p className="text-[11px] text-on-surface-variant/60 font-medium leading-relaxed italic">Optimalisasi dataset dilakukan setiap periode akhir panen untuk menjaga performa model prediksi varietas.</p>
              </div>
            </div>
            {/* Organic Pattern Overlay */}
            <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none -mr-24 -mt-24 group-hover:opacity-10 transition-opacity duration-700">
              <span className="material-symbols-outlined text-[480px]">eco</span>
            </div>
          </div>
        </section>
      </div>

      {/* Institutional Footer */}
      <footer className="mt-24 py-12 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-8 opacity-60">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-surface-container-highest rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">agriculture</span>
          </div>
          <span className="font-headline font-black text-xs uppercase tracking-[0.2em] text-on-surface max-w-[200px] leading-relaxed">Dinas Pertanian dan Tanaman Pangan Kabupaten Aceh Utara</span>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2">
          <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Sistem Manajemen Pertanian © 2024</p>
          <div className="flex gap-4">
            <span className="text-[10px] font-black text-primary/50 uppercase tracking-widest">Privacy Policy</span>
            <span className="text-[10px] font-black text-primary/50 uppercase tracking-widest">Terms of Service</span>
          </div>
        </div>
      </footer>

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
