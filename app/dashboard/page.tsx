"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ModelPerformance, ProductionStat, Commodity } from '@/lib/types';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

// Animated Counter Component
const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toLocaleString('id-ID')}</span>;
};

export default function DashboardPage() {
  const router = useRouter();
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
        // Fetch commodities dengan prioritas order
        const { data: commoditiesData, count: commoditiesCount } = await supabase
          .from('commodities')
          .select('*', { count: 'exact' })
          .order('name');

        if (commoditiesData) {
          // Format commodities untuk display dengan default varieties
          const formattedCommodities = commoditiesData.map((c: Commodity) => ({
            id: c.id,
            name: c.name,
            image: c.image_url || (getDefaultImageUrl(c.name)),
            desc: `${c.name} - Varietas hortikultura Aceh Utara`,
            varieties: getDefaultVarieties(c.name)
          }));
          setCommodities(formattedCommodities);
        }
        setTotalCommodities(commoditiesCount || 0);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { count: predictionsCount } = await supabase
            .from('predictions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          setTotalPredictions(predictionsCount || 0);
        }

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

  const [selectedCommodity, setSelectedCommodity] = useState<any>(null);
  const [commodities, setCommodities] = useState<any[]>([]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80
      }
    }
  };

  // Helper function untuk default image URL jika tidak ada di database
  const getDefaultImageUrl = (name: string): string => {
    const imageMap: Record<string, string> = {
      'Ketimun': '/ketimun.png',
      'Kacang Panjang': '/kacang_panjang.png',
      'Kangkung': '/kangkung.png',
      'Terung': '/terung.png',
      'Cabe Rawit': '/cabe_rawit.png',
      'Cabe Keriting': '/cabe_keriting.png',
      'Cabe Besar': '/cabe_besar.png',
      'Tomat': '/tomat.png',
      'Semangka': '/semangka.png',
      'Bayam': '/bayam.png',
    };
    return imageMap[name] || '/horticulture_hero.png';
  };

  // Helper function untuk default varieties
  const getDefaultVarieties = (name: string): string[] => {
    const varietiesMap: Record<string, string[]> = {
      'Ketimun': ['Hercules F1', 'Mercy F1', 'Roman F1'],
      'Kacang Panjang': ['Parade Tavi', 'Kanton Tavi', 'KP-1'],
      'Kangkung': ['Bangkok LP-1', 'Bisi Kangkung', 'Sutra'],
      'Terung': ['Mustang F1', 'Laguna F1', 'Antaboga'],
      'Cabe Rawit': ['Dewata F1', 'Bara', 'Taruna'],
      'Cabe Keriting': ['TM 999', 'Lado F1', 'Kencana'],
      'Cabe Besar': ['Tanjung 2', 'Gada MK F1', 'Laris F1'],
      'Tomat': ['Servo F1', 'Ratna', 'Intan'],
      'Semangka': ['Crimson Sweet', 'Sugar Baby', 'Amara F1'],
      'Bayam': ['Maestro', 'Bangkok', 'Cempaka'],
    };
    return varietiesMap[name] || [];
  };

  return (
    <>
      <AppLayout title="Katalog Komoditas">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-12"
        >
          {/* Visual Hero Header */}
          <motion.div 
            variants={itemVariants} 
            className="relative h-[500px] w-full rounded-[48px] overflow-hidden shadow-2xl group border border-white/10"
          >
            <img 
              alt="Horticulture Hero" 
              className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" 
              src="/horticulture_hero.png"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-16 left-16 right-16">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="inline-flex items-center gap-3 bg-primary/90 backdrop-blur-md px-5 py-2.5 rounded-full mb-8 border border-white/20"
              >
                <span className="material-symbols-outlined text-white text-base animate-pulse">stars</span>
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Visual Intelligence v3.0</span>
              </motion.div>
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8 drop-shadow-2xl">
                Varietas Unggulan<br/><span className="text-primary-container">Aceh Utara</span>
              </h1>
              <p className="text-white/80 max-w-2xl text-xl font-medium leading-relaxed drop-shadow-md">
                Eksplorasi visual 10 komoditas hortikultura prioritas yang menjadi tulang punggung ketahanan pangan daerah.
              </p>
            </div>
          </motion.div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {commodities.map((plant, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ y: -12 }}
                onClick={() => setSelectedCommodity(plant)}
                className="group relative cursor-pointer"
              >
                <div className="relative aspect-[3/4] rounded-[32px] overflow-hidden shadow-lg group-hover:shadow-primary/30 transition-all duration-500 bg-muted">
                  {plant.image ? (
                    <img
                      src={plant.image}
                      alt={plant.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground">Gambar tidak tersedia</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute inset-0 p-8 flex flex-col justify-end transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                    <p className="text-primary-container text-[10px] font-black uppercase tracking-[0.3em] mb-2">Komoditas #{index + 1}</p>
                    <h3 className="text-2xl font-black text-white leading-tight mb-2">{plant.name}</h3>
                    <p className="text-white/60 text-xs font-medium leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {plant.desc}
                    </p>
                  </div>
                </div>
                
                {/* Floating Action Button for each card */}
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Footer CTA */}
          <motion.div 
            variants={itemVariants}
            className="bg-stone-100 dark:bg-stone-900 rounded-[40px] p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-stone-200/50 dark:border-stone-800/50"
          >
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-3xl font-black tracking-tight text-stone-900 dark:text-stone-100">Siap Memulai Analisis?</h3>
              <p className="text-stone-600 dark:text-stone-400 font-medium">Gunakan model AI kami untuk memprediksi kecocokan lahan dengan 10 komoditas di atas.</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); router.push('/dashboard/predict'); }}
              className="px-10 py-6 bg-green-600 dark:bg-green-500 text-white dark:text-green-950 rounded-3xl font-black text-lg shadow-xl shadow-green-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 whitespace-nowrap"
            >
              <span>Buka Form Prediksi</span>
              <span className="material-symbols-outlined">psychology</span>
            </button>
          </motion.div>

          {/* Institutional Signature Footer */}
          <motion.footer 
            variants={itemVariants}
            className="mt-20 py-10 border-t border-stone-200 dark:border-stone-800 flex flex-col md:flex-row justify-between items-center gap-6"
          >
            <div className="flex items-center gap-4 group">
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0] }}
                className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-900 flex items-center justify-center border border-stone-200/50 dark:border-stone-800/50"
              >
                <span className="material-symbols-outlined text-green-700 dark:text-green-400 text-xl">account_balance</span>
              </motion.div>
              <span className="font-headline font-bold text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400 max-w-[200px] group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                Dinas Pertanian dan Tanaman Pangan Kabupaten Aceh Utara
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-600">
              © 2026 Arsitektur Sistem Pemerintah. Seluruh Hak Cipta Dilindungi.
            </p>
          </motion.footer>
        </motion.div>
      </AppLayout>

      <AnimatePresence>
        {selectedCommodity && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCommodity(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-[48px] overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row max-h-[90vh]"
            >
              <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-stone-100 dark:bg-stone-800">
                {selectedCommodity.image ? (
                  <img
                    src={selectedCommodity.image}
                    alt={selectedCommodity.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-muted-foreground">Gambar tidak tersedia</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent md:hidden" />
              </div>
              
              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter mb-2 text-stone-900 dark:text-stone-50">{selectedCommodity.name}</h2>
                    <p className="text-green-700 dark:text-green-400 font-bold text-sm uppercase tracking-widest">{selectedCommodity.name}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedCommodity(null)}
                    className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-stone-500 dark:text-stone-400"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-4">Daftar Varietas Unggulan</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCommodity.varieties.map((v: string) => (
                        <div key={v} className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl font-bold text-sm border border-green-100 dark:border-green-800/30">
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedCommodity.note && (
                    <div className="p-6 bg-amber-50 dark:bg-amber-950/20 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                      <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400">
                        <span className="material-symbols-outlined text-sm">info</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Catatan Penting</span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed italic text-stone-600 dark:text-stone-400">
                        "{selectedCommodity.note}"
                      </p>
                    </div>
                  )}

                  <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      Data varietas di atas adalah benih resmi yang direkomendasikan untuk wilayah Kabupaten Aceh Utara guna memastikan hasil panen yang optimal dan tahan terhadap hama lokal.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
