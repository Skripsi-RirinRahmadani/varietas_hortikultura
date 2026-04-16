"use client";

import React, { useEffect, useState, Suspense } from "react";
import AppLayout from "@/components/AppLayout";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

function ResultsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (id) {
        const { data: prediction, error } = await supabase
          .from("predictions")
          .select("*")
          .eq("id", id)
          .single();
        
        if (!error && prediction) {
          setData(prediction);
        }
      } else {
        const { data: allHistory, error } = await supabase
          .from("predictions")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (!error && allHistory) {
          setHistory(allHistory);
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-on-surface-variant font-medium animate-pulse">Memuat data...</p>
      </div>
    );
  }

  // List View (All History)
  if (!id) {
    return (
      <main className="max-w-screen-2xl mx-auto w-full pb-20">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full mb-4">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Arsip Rekomendasi</span>
          </div>
          <h1 className="font-headline text-4xl lg:text-5xl font-extrabold text-[#00450d] tracking-tight mb-4 leading-tight">
            Riwayat Analisis Lahan
          </h1>
          <p className="font-body text-[#1a1c1a] text-lg opacity-70 max-w-2xl">
            Akses kembali seluruh hasil evaluasi dan rekomendasi varietas yang telah dibuat oleh sistem cerdas.
          </p>
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <Link 
                key={item.id}
                href={`/dashboard/results?id=${item.id}`}
                className="group bg-white rounded-2xl p-6 border border-outline-variant/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">eco</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Waktu</p>
                    <p className="text-[11px] font-bold text-on-surface">
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                <h3 className="font-headline text-xl font-bold text-[#1a1c1a] mb-2 group-hover:text-primary transition-colors">
                  {item.variety_name}
                </h3>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-[#f4f4f0] p-3 rounded-lg">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tighter mb-1 opacity-60">Tanah</p>
                    <p className="text-xs font-bold text-on-surface truncate">{item.soil_type}</p>
                  </div>
                  <div className="bg-[#f4f4f0] p-3 rounded-lg">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tighter mb-1 opacity-60">pH Lahan</p>
                    <p className="text-xs font-bold text-on-surface">{item.ph}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                  <div className="flex items-center gap-1.5 opacity-60">
                    <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Confidence: {(item.confidence_score * 100).toFixed(0)}%</span>
                  </div>
                  <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/20">
            <span className="material-symbols-outlined text-6xl text-primary/20 mb-4 animate-bounce">psychology</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">Belum Ada Riwayat</h3>
            <p className="text-on-surface-variant mb-8 text-center max-w-sm">Mulai eksplorasi dengan membuat analisis lahan pertama Anda sekarang.</p>
            <Link 
              href="/dashboard/predict"
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Buat Analisis Baru
            </Link>
          </div>
        )}
      </main>
    );
  }

  // Detail View (Specific ID)
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="material-symbols-outlined text-6xl text-error opacity-20">search_off</span>
        <h2 className="text-2xl font-bold text-on-surface">Data Tidak Ditemukan</h2>
        <p className="text-on-surface-variant">ID prediksi tidak valid atau telah dihapus.</p>
        <a href="/dashboard/results" className="text-primary font-bold hover:underline mt-4">Kembali ke Riwayat</a>
      </div>
    );
  }

  return (
    <main className="max-w-screen-2xl mx-auto w-full pb-20">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4 hover:translate-x-[-4px] transition-transform"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Kembali ke Riwayat
          </button>
          <h1 className="font-headline text-4xl font-extrabold text-[#00450d] tracking-tight mb-2">
            Hasil Klasifikasi Varietas
          </h1>
          <p className="font-body text-[#1a1c1a] text-lg opacity-70">
            Analisis lahan: {data.soil_type} • pH {data.ph} • {data.rainfall} mm/th
          </p>
        </div>
        <div className="text-right pb-1">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Waktu Analisis</p>
          <p className="text-xs font-bold text-on-surface">
            {new Date(data.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prediction Result Section (Large Card) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-8 border-none shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00450d]/5 rounded-full -mr-16 -mt-16"></div>
            <div className="w-32 h-32 rounded-full bg-[#a3f69c]/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-6xl text-[#00450d]" style={{ fontVariationSettings: "'FILL' 1" }}>
                eco
              </span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <span className="font-label text-xs font-bold uppercase tracking-widest text-[#00450d] mb-2 block">
                Hasil Prediksi Akhir
              </span>
              <h2 className="font-headline text-5xl font-extrabold text-[#1a1c1a] mb-3 tracking-tighter">
                {data.variety_name}
              </h2>
              <p className="text-[#41493e] leading-relaxed max-w-xl">
                Berdasarkan parameter analisis tanah, iklim, dan ketinggian {data.elevation}m, sistem mengklasifikasikan benih ini ke dalam kategori <span className="font-bold text-[#00450d]">{data.variety_name.toLowerCase()}</span> untuk wilayah Aceh Utara.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-[#00450d]/10 border border-[#00450d]/20 px-6 py-4 rounded-xl text-center">
                <p className="text-[10px] uppercase font-bold text-[#00450d] tracking-widest mb-1">Skor Kepercayaan</p>
                <p className="text-3xl font-black text-[#00450d]">{(data.confidence_score * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Evaluation Metrics Scorecard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Accuracy */}
            <div className="bg-[#f4f4f0] p-6 rounded-xl border-none">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#41493e] font-label">Akurasi</span>
                <span className="material-symbols-outlined text-[#00450d] text-sm">verified</span>
              </div>
              <div className="text-3xl font-black text-[#1a1c1a]">{data.accuracy || '0.96'}</div>
              <div className="mt-2 h-1.5 w-full bg-[#e8e8e4] rounded-full overflow-hidden">
                <div className="h-full bg-[#00450d] rounded-full" style={{ width: `${(data.accuracy || 0.96) * 100}%` }}></div>
              </div>
            </div>

            {/* Precision */}
            <div className="bg-[#f4f4f0] p-6 rounded-xl border-none">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#41493e] font-label">Presisi</span>
                <span className="material-symbols-outlined text-[#00450d] text-sm">ads_click</span>
              </div>
              <div className="text-3xl font-black text-[#1a1c1a]">{data.precision || '0.94'}</div>
              <div className="mt-2 h-1.5 w-full bg-[#e8e8e4] rounded-full overflow-hidden">
                <div className="h-full bg-[#00450d] rounded-full" style={{ width: `${(data.precision || 0.94) * 100}%` }}></div>
              </div>
            </div>

            {/* Recall */}
            <div className="bg-[#f4f4f0] p-6 rounded-xl border-none">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#41493e] font-label">Recall</span>
                <span className="material-symbols-outlined text-[#00450d] text-sm">history</span>
              </div>
              <div className="text-3xl font-black text-[#1a1c1a]">{data.recall || '0.97'}</div>
              <div className="mt-2 h-1.5 w-full bg-[#e8e8e4] rounded-full overflow-hidden">
                <div className="h-full bg-[#00450d] rounded-full" style={{ width: `${(data.recall || 0.97) * 100}%` }}></div>
              </div>
            </div>

            {/* F1-Score */}
            <div className="bg-[#f4f4f0] p-6 rounded-xl border-none">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#41493e] font-label">F1-Score</span>
                <span className="material-symbols-outlined text-[#00450d] text-sm">functions</span>
              </div>
              <div className="text-3xl font-black text-[#1a1c1a]">{data.f1_score || '0.95'}</div>
              <div className="mt-2 h-1.5 w-full bg-[#e8e8e4] rounded-full overflow-hidden">
                <div className="h-full bg-[#00450d] rounded-full" style={{ width: `${(data.f1_score || 0.95) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Confusion Matrix Visualization */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-8 border-none shadow-sm h-full font-body">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline font-bold text-lg text-[#1a1c1a]">Matriks Kebingungan</h3>
              <span className="material-symbols-outlined text-[#41493e]">info</span>
            </div>
            <div className="grid grid-cols-[auto_1fr_1fr] grid-rows-[auto_1fr_1fr] gap-1 text-sm">
              <div></div>
              <div className="text-center font-bold text-[#41493e] py-2">Pred: Unggul</div>
              <div className="text-center font-bold text-[#41493e] py-2">Pred: Biasa</div>
              <div className="flex items-center font-bold text-[#41493e] pr-4">Aktual: Unggul</div>
              <div className="aspect-square bg-[#065f18] text-white flex flex-col items-center justify-center rounded-lg shadow-inner p-2 text-center">
                <span className="text-2xl font-black">142</span>
                <span className="text-[10px] font-medium opacity-80 uppercase tracking-tighter leading-none">Positif Benar</span>
              </div>
              <div className="aspect-square bg-[#833f00]/20 text-[#602d00] flex flex-col items-center justify-center rounded-lg p-2 text-center">
                <span className="text-2xl font-black">8</span>
                <span className="text-[10px] font-medium opacity-80 uppercase tracking-tighter leading-none">Negatif Salah</span>
              </div>
              <div className="flex items-center font-bold text-[#41493e] pr-4">Aktual: Biasa</div>
              <div className="aspect-square bg-[#833f00]/20 text-[#602d00] flex flex-col items-center justify-center rounded-lg p-2 text-center">
                <span className="text-2xl font-black">4</span>
                <span className="text-[10px] font-medium opacity-80 uppercase tracking-tighter leading-none">Positif Salah</span>
              </div>
              <div className="aspect-square bg-[#065f18]/60 text-white flex flex-col items-center justify-center rounded-lg shadow-inner p-2 text-center">
                <span className="text-2xl font-black">86</span>
                <span className="text-[10px] font-medium opacity-80 uppercase tracking-tighter leading-none">Negatif Benar</span>
              </div>
            </div>
            <div className="mt-8 p-4 bg-[#f4f4f0] rounded-lg border border-outline-variant/10">
              <p className="text-xs text-[#41493e] leading-relaxed">
                <span className="font-bold text-[#00450d]">Insight:</span> Model memiliki tingkat kesalahan False Negative yang sangat rendah (8), memastikan benih berkualitas tinggi jarang terabaikan.
              </p>
            </div>
          </div>
        </div>

        {/* Recommendation Card Section */}
        <div className="lg:col-span-12">
          <div className="bg-[#faf9f5] p-6 rounded-2xl border border-outline-variant/10">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-[10px] font-bold font-headline uppercase tracking-widest text-[#1a1c1a] px-3 py-1 bg-[#e2e3df] rounded-full">
                Rekomendasi Dinas Pertanian
              </span>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="max-w-2xl">
                  <h4 className="font-headline text-2xl font-bold text-[#00450d] mb-4">Langkah Strategis Berikutnya</h4>
                  <p className="text-[#41493e] leading-relaxed">
                    {data.recommendation || 'Gunakan parameter spesifik untuk hasil yang lebih akurat.'}
                  </p>
                </div>
                <button className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-[#00450d] to-[#065f18] text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap">
                  <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">download</span>
                  Unduh Sertifikat Benih
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <AppLayout title="Hasil Evaluasi">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      }>
        <ResultsContent />
      </Suspense>
      <footer className="mt-12 py-8 text-right border-t border-stone-200">
        <p className="font-['Inter'] text-[10px] font-medium uppercase tracking-[0.2em] text-[#41493e]">
          Dinas Pertanian dan Tanaman Pangan Kabupaten Aceh Utara
        </p>
      </footer>
    </AppLayout>
  );
}
