import React, { useState, useEffect } from 'react';
import { Dialog } from 'radix-ui';
import { supabase } from '@/lib/supabase';
import { Commodity, District } from '@/lib/types';
import { Button } from './ui/button';

interface CommodityDialogProps {
  commodity?: Commodity | null;
  districts: District[];
  onSuccess: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommodityDialog({ 
  commodity, 
  districts, 
  onSuccess, 
  open, 
  onOpenChange 
}: CommodityDialogProps) {
  const [formData, setFormData] = useState<Partial<Commodity>>({
    name: '',
    soil_type: '',
    ph_min: 0,
    ph_max: 14,
    rainfall_min: 0,
    rainfall_max: 5000,
    temp_min: 0,
    temp_max: 50,
    district_id: '',
    status: 'Biasa'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (commodity) {
      setFormData({
        name: commodity.name,
        soil_type: commodity.soil_type,
        ph_min: commodity.ph_min,
        ph_max: commodity.ph_max,
        rainfall_min: commodity.rainfall_min,
        rainfall_max: commodity.rainfall_max,
        temp_min: commodity.temp_min,
        temp_max: commodity.temp_max,
        district_id: commodity.district_id,
        status: commodity.status
      });
    } else {
      setFormData({
        name: '',
        soil_type: '',
        ph_min: 0,
        ph_max: 14,
        rainfall_min: 0,
        rainfall_max: 5000,
        temp_min: 0,
        temp_max: 50,
        district_id: districts[0]?.id || '',
        status: 'Biasa'
      });
    }
  }, [commodity, districts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (commodity?.id) {
        const { error } = await supabase
          .from('commodities')
          .update(formData)
          .eq('id', commodity.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('commodities')
          .insert([formData]);
        if (error) throw error;
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving commodity:', error);
      alert('Gagal menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl p-8 z-[101] animate-in zoom-in-95 fade-in duration-300 border border-outline-variant/10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Dialog.Title className="text-2xl font-bold font-headline text-on-surface">
                {commodity ? 'Edit Data Komoditas' : 'Tambah Komoditas Baru'}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-on-surface-variant opacity-70">
                Lengkapi informasi parameter lingkungan untuk optimasi pertumbuhan varietas.
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-2 hover:bg-surface-container rounded-full transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Nama Komoditas</label>
                <div className="group relative">
                  <input
                    required
                    className="w-full bg-surface-container-highest px-4 py-3 rounded-lg text-on-surface outline-none transition-all"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Padi IR64"
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-primary w-0 group-focus-within:w-full transition-all duration-300" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Jenis Tanah</label>
                <div className="group relative">
                  <input
                    className="w-full bg-surface-container-highest px-4 py-3 rounded-lg text-on-surface outline-none transition-all"
                    value={formData.soil_type}
                    onChange={e => setFormData({ ...formData, soil_type: e.target.value })}
                    placeholder="Contoh: Aluvial"
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-primary w-0 group-focus-within:w-full transition-all duration-300" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Wilayah Kecamatan</label>
                <select
                  className="w-full bg-surface-container-highest px-4 py-3 rounded-lg text-on-surface outline-none appearance-none"
                  value={formData.district_id}
                  onChange={e => setFormData({ ...formData, district_id: e.target.value })}
                >
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">pH Tanah (Min - Max)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    className="w-full bg-surface-container-highest px-4 py-3 rounded-lg text-on-surface outline-none"
                    value={formData.ph_min}
                    onChange={e => setFormData({ ...formData, ph_min: parseFloat(e.target.value) })}
                  />
                  <span className="text-on-surface-variant">/</span>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full bg-surface-container-highest px-4 py-3 rounded-lg text-on-surface outline-none"
                    value={formData.ph_max}
                    onChange={e => setFormData({ ...formData, ph_max: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Curah Hujan (Min - Max) mm</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-full bg-surface-container-highest px-4 py-3 rounded-lg text-on-surface outline-none"
                    value={formData.rainfall_min}
                    onChange={e => setFormData({ ...formData, rainfall_min: parseFloat(e.target.value) })}
                  />
                  <span className="text-on-surface-variant">/</span>
                  <input
                    type="number"
                    className="w-full bg-surface-container-highest px-4 py-3 rounded-lg text-on-surface outline-none"
                    value={formData.rainfall_max}
                    onChange={e => setFormData({ ...formData, rainfall_max: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Suhu (Min - Max) °C</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-full bg-surface-container-highest px-4 py-3 rounded-lg text-on-surface outline-none"
                    value={formData.temp_min}
                    onChange={e => setFormData({ ...formData, temp_min: parseFloat(e.target.value) })}
                  />
                  <span className="text-on-surface-variant">/</span>
                  <input
                    type="number"
                    className="w-full bg-surface-container-highest px-4 py-3 rounded-lg text-on-surface outline-none"
                    value={formData.temp_max}
                    onChange={e => setFormData({ ...formData, temp_max: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Status Komoditas</label>
                <select
                  className="w-full bg-surface-container-highest px-4 py-3 rounded-lg text-on-surface outline-none appearance-none"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="Biasa">Biasa</option>
                  <option value="Unggulan">Unggulan</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/10">
              <Dialog.Close asChild>
                <Button variant="ghost" type="button">Batal</Button>
              </Dialog.Close>
              <Button disabled={loading} type="submit" className="min-w-[120px]">
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
