"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabase';

// Dynamically import the Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-stone-100 dark:bg-stone-900 animate-pulse rounded-2xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="material-symbols-outlined text-4xl text-green-600 animate-spin">progress_activity</span>
        <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">Memuat Peta...</p>
      </div>
    </div>
  )
});

// Mock coordinates for Aceh Utara districts
const districtCoordinates: Record<string, [number, number]> = {
  'Lhoksukon': [5.0444, 97.3195],
  'Dewantara': [5.2345, 97.0234],
  'Muara Batu': [5.2456, 96.9678],
  'Baktiya': [5.0234, 97.4567],
  'Seunuddon': [5.1234, 97.5678],
  'Tanah Jambo Aye': [5.0123, 97.5234],
  'Matangkuli': [5.0023, 97.2890],
  'Syamtalira Aron': [5.0567, 97.2456],
  'Meurah Mulia': [5.0345, 97.1890],
  'Samudera': [5.1234, 97.1567],
  'Syamtalira Bayu': [5.1345, 97.1234],
  'Kuta Makmur': [5.0890, 97.1023],
  'Simoang Keuramat': [5.0567, 97.0567],
  'Sawang': [5.0123, 96.9890],
  'Nisama': [5.1567, 97.0123],
  'Banda Baro': [5.1890, 96.9890],
  'Tanah Luas': [4.9890, 97.2567],
  'Paya Bakong': [4.9567, 97.2123],
  'Nibong': [5.0123, 97.2234],
  'Tanah Pasir': [5.0890, 97.2678],
  'Lapang': [5.1123, 97.2890],
  'Muara Mulia': [5.0234, 97.1678],
};

const defaultCenter: [number, number] = [5.0444, 97.3195]; // Lhoksukon center

export default function MapPage() {
  const [districts, setDistricts] = useState<any[]>([]);
  const [commodities, setCommodities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: districtsData } = await supabase.from('districts').select('*');
        const { data: commoditiesData } = await supabase.from('commodities').select('*, districts(name)');
        
        if (districtsData) setDistricts(districtsData);
        if (commoditiesData) {
          setCommodities(commoditiesData);
          
          // Generate markers based on commodities and their districts
          const newMarkers = commoditiesData.map(item => {
            const districtName = item.districts?.name || 'Unknown';
            const coords = districtCoordinates[districtName] || [
              defaultCenter[0] + (Math.random() - 0.5) * 0.2,
              defaultCenter[1] + (Math.random() - 0.5) * 0.2
            ];
            
            return {
              position: coords,
              title: item.name,
              description: `Kecamatan: ${districtName} | Tanah: ${item.soil_type || 'N/A'}`
            };
          });
          
          setMarkers(newMarkers);
        }
      } catch (error) {
        console.error('Error fetching map data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <AppLayout title="Peta Sebaran GIS">
      <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold tracking-tight text-green-950 dark:text-green-50 mb-2">Peta Sebaran Hortikultura</h1>
        <p className="text-on-surface-variant max-w-2xl leading-relaxed">
          Visualisasi spasial komoditas unggulan di berbagai kecamatan di Kabupaten Aceh Utara.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/15 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Statistik Wilayah</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant font-medium">Total Kecamatan</span>
                <span className="text-lg font-black text-green-900 dark:text-green-400">{districts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant font-medium">Total Komoditas</span>
                <span className="text-lg font-black text-green-900 dark:text-green-400">{commodities.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-green-900 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-3xl mb-2 opacity-50">info</span>
              <h4 className="text-lg font-bold mb-2">Tentang GIS</h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Sistem Informasi Geografis ini membantu pemangku kepentingan mengidentifikasi potensi wilayah berdasarkan kondisi agro-klimatologi.
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Map Container */}
        <div className="lg:col-span-3 h-[600px] relative">
          {!loading ? (
            <Map center={defaultCenter} zoom={11} markers={markers} />
          ) : (
            <div className="w-full h-full bg-stone-100 dark:bg-stone-900 animate-pulse rounded-3xl flex items-center justify-center border border-outline-variant/15">
              <div className="flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-4xl text-green-600 animate-spin">progress_activity</span>
                <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">Menyiapkan Data Spasial...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
