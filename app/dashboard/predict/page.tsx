"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function PredictPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    soil_type: '',
    ph: '',
    rainfall: '',
    temperature: '',
    elevation: ''
  });

  useEffect(() => {
    const fetchLatestHistory = async () => {
      const { data } = await supabase
        .from('predictions')
        .select('id, created_at, variety_name, soil_type')
        .order('created_at', { ascending: false })
        .limit(2);
      if (data) setHistory(data);
    };
    fetchLatestHistory();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.soil_type || !formData.ph || !formData.rainfall || !formData.temperature || !formData.elevation) {
      alert('Mohon isi semua parameter lahan.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulation of a basic prediction model logic
      // In a real app, this would be an API call to a ML service
      const isPremium = parseFloat(formData.ph) >= 6 && parseFloat(formData.ph) <= 7 && parseFloat(formData.rainfall) > 2000;
      const prediction = {
        soil_type: formData.soil_type,
        ph: parseFloat(formData.ph),
        rainfall: parseFloat(formData.rainfall),
        temperature: parseFloat(formData.temperature),
        elevation: parseFloat(formData.elevation),
        variety_name: isPremium ? 'Varietas Unggulan' : 'Varietas Biasa',
        confidence_score: 0.9 + (Math.random() * 0.09),
        accuracy: 0.96,
        precision: 0.94,
        recall: 0.97,
        f1_score: 0.95,
        recommendation: isPremium 
          ? 'Optimasi dengan pupuk organik 2 ton/hektar untuk hasil maksimal.' 
          : 'Gunakan pengapuran untuk menyeimbangkan pH sebelum penanaman.'
      };

      const { data, error } = await supabase
        .from('predictions')
        .insert([prediction])
        .select()
        .single();

      if (error) throw error;

      router.push(`/dashboard/results?id=${data.id}`);
    } catch (err) {
      console.error('Error saving prediction:', err);
      alert('Gagal menyimpan prediksi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout title="Prediksi Varietas">
      <div className="flex flex-col items-center">
        {/* Breadcrumbs / Top Indicator */}
        <div className="w-full max-w-4xl mb-8">
          <nav className="flex text-sm font-medium text-on-surface-variant mb-4">
            <span className="hover:text-primary transition-colors cursor-pointer">Rekomendasi</span>
            <span className="mx-2 text-outline-variant">/</span>
            <span className="text-on-surface font-semibold tracking-tight">Prediksi Lahan Baru</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full mb-4">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Model Interface v2.4</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-headline font-extrabold text-primary tracking-tight leading-tight">Formulir Prediksi Pertanian</h1>
          <p className="text-on-surface-variant mt-4 max-w-2xl text-lg font-body opacity-80 leading-relaxed">Masukkan parameter lahan dan lingkungan untuk menghasilkan rekomendasi tanaman berbasis data yang dioptimalkan untuk profil geografis Aceh Utara.</p>
        </div>

        {/* Bento Layout Form Container */}
        <form onSubmit={handleSubmit} className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">
          {/* Main Form Body */}
          <div className="md:col-span-8 space-y-6">
            <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/15 shadow-sm">
              <div className="grid grid-cols-1 gap-8">
                {/* Soil Type Field */}
                <div className="space-y-3">
                  <label className="block font-headline font-bold text-on-surface-variant text-xs tracking-[0.15em] uppercase">Pemilihan Jenis Tanah</label>
                  <div className="relative group">
                    <select 
                      name="soil_type"
                      value={formData.soil_type}
                      onChange={handleChange}
                      className="w-full appearance-none bg-surface-container-highest border-none rounded-xl px-4 py-4 text-on-surface font-body font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer outline-none"
                    >
                      <option disabled value="">Identifikasi Karakteristik Lahan...</option>
                      <option value="Aluvial">Aluvial</option>
                      <option value="Andosol">Andosol</option>
                      <option value="Entisol">Entisol</option>
                      <option value="Grumosol">Grumosol</option>
                      <option value="Inceptisol">Inceptisol</option>
                      <option value="Ultisol">Ultisol</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-on-surface-variant">
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* pH & Rainfall Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block font-headline font-bold text-on-surface-variant text-xs tracking-[0.15em] uppercase">Tingkat pH (1-14)</label>
                    <div className="relative group">
                      <input 
                        name="ph"
                        value={formData.ph}
                        onChange={handleChange}
                        className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-4 text-on-surface font-body font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                        max="14" 
                        min="1" 
                        placeholder="e.g. 6.5" 
                        step="0.1" 
                        type="number"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block font-headline font-bold text-on-surface-variant text-xs tracking-[0.15em] uppercase">Curah Hujan (MM/Tahun)</label>
                    <div className="relative group">
                      <input 
                        name="rainfall"
                        value={formData.rainfall}
                        onChange={handleChange}
                        className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-4 text-on-surface font-body font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                        placeholder="e.g. 2100" 
                        type="number"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Temp & Elevation Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block font-headline font-bold text-on-surface-variant text-xs tracking-[0.15em] uppercase">Suhu (Celsius)</label>
                    <div className="relative group">
                      <input 
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleChange}
                        className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-4 text-on-surface font-body font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                        placeholder="e.g. 28.5" 
                        step="0.5" 
                        type="number"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block font-headline font-bold text-on-surface-variant text-xs tracking-[0.15em] uppercase">Ketinggian (Meter)</label>
                    <div className="relative group">
                      <input 
                        name="elevation"
                        value={formData.elevation}
                        onChange={handleChange}
                        className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-4 text-on-surface font-body font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                        placeholder="e.g. 150" 
                        type="number"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Submit CTA */}
            <div className="flex items-center justify-end">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="group relative flex items-center space-x-3 bg-gradient-to-br from-primary to-primary-container text-white px-10 py-5 rounded-2xl font-headline font-extrabold text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? 'Memproses...' : 'Proses Rekomendasi'}</span>
                {!isSubmitting && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>}
              </button>
            </div>
          </div>

          {/* Info Sidebar (Editorial Component) */}
          <div className="md:col-span-4 space-y-6">
            {/* Helper Card */}
            <div className="bg-surface-container p-8 rounded-2xl space-y-6 border border-outline-variant/5">
              <div className="flex items-center space-x-3 text-primary">
                <span className="material-symbols-outlined bg-primary/10 p-2 rounded-lg">info</span>
                <span className="font-headline font-bold text-sm tracking-tight uppercase">Integritas Data</span>
              </div>
              <p className="text-xs leading-relaxed text-on-surface-variant font-body font-medium opacity-80">
                Pastikan seluruh pengukuran diambil dari hasil uji tanah terbaru. Parameter yang tidak akurat dapat menyebabkan pemilihan tanaman yang tidak optimal dan pemborosan sumber daya di lapangan.
              </p>
              <div className="bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Analitik Formulir</span>
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {Object.values(formData).filter(v => v !== '').length * 20}% SIAP
                  </span>
                </div>
                <div className="w-full bg-secondary-container h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full shadow-sm transition-all duration-500" 
                    style={{ width: `${Object.values(formData).filter(v => v !== '').length * 20}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Visual Context Card */}
            <div className="relative h-72 rounded-2xl overflow-hidden group shadow-lg">
              <img 
                alt="Lahan Pertanian Aceh Utara" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdk_QfH3ygV6W-_ntXS_0vUoQGyUpAvIqRM7TRe8wBC8eZfR1ID4m5Nax8seKycKFeixX0ZqU92aBDdQ_jDXRvPNIzWByOAhMf0b1fWmJVjZEt6W3DDeAifOGdY1gGb8U5RsObEJYXPwzdJThpOiga-ObK3PaWzCgdk9GAbkYiHn4W5r5ydhWQzsVt-pgydz0S-aBF8VrDy0eLq_AQq2ui7cAjt9WzjNkrRTfe4oC5iMxx1YsYlBfByr0O43GoTuTyp7S8PdQmHQZa" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-headline font-extrabold text-sm tracking-tight mb-1">Konteks Geografis</p>
                <p className="text-white/80 text-[10px] font-body font-medium leading-tight">Mencocokkan data lahan dengan kondisi ekologis spesifik dari distrik Aceh Utara.</p>
              </div>
            </div>

            {/* History Chip (Editorial Component) */}
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5">
              <span className="block font-headline font-bold text-on-surface-variant text-[10px] tracking-[0.2em] uppercase mb-4 opacity-60">PREDIKSI TERBARU</span>
              <div className="space-y-2">
                {history.length > 0 ? (
                  history.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => router.push(`/dashboard/results?id=${item.id}`)}
                      className="flex items-center justify-between p-3 bg-white/30 backdrop-blur-sm border border-transparent hover:border-primary/20 hover:bg-white/60 rounded-xl transition-all cursor-pointer group"
                    >
                      <div>
                        <p className="text-xs font-bold text-on-surface">{item.soil_type}</p>
                        <p className="text-[10px] text-on-surface-variant font-medium">{item.variety_name}</p>
                      </div>
                      <span className="material-symbols-outlined text-sm text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" data-icon="arrow_outward">arrow_outward</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-on-surface-variant/60 italic text-center py-4">Belum ada riwayat prediksi.</p>
                )}
              </div>
            </div>
          </div>
        </form>

        <footer className="mt-auto w-full max-w-4xl border-t border-outline-variant/10 py-12 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60">
          <div className="text-[10px] font-bold text-on-surface tracking-[0.2em] uppercase text-center md:text-left">
            DINAS PERTANIAN DAN TANAMAN PANGAN KABUPATEN ACEH UTARA
          </div>
          <div className="flex space-x-8 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
            <a className="hover:text-primary transition-colors hover:underline decoration-2 underline-offset-4" href="#">Privasi</a>
            <a className="hover:text-primary transition-colors hover:underline decoration-2 underline-offset-4" href="#">Ketentuan</a>
            <a className="hover:text-primary transition-colors hover:underline decoration-2 underline-offset-4" href="#">Sains</a>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
}
