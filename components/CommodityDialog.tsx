"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Commodity, District } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { IconX } from "@tabler/icons-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  commodity: Commodity | null;
  districts: District[];
  onSuccess: () => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", step }: {
  value: any; onChange: (v: any) => void; placeholder?: string; type?: string; step?: string;
}) {
  return (
    <input
      type={type} step={step} value={value ?? ""} placeholder={placeholder}
      onChange={(e) => onChange(type === "number" ? parseFloat(e.target.value) || "" : e.target.value)}
      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
    />
  );
}

export default function CommodityDialog({ open, onOpenChange, commodity, districts, onSuccess }: Props) {
  const [form, setForm] = useState<Partial<Commodity>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(commodity ? { ...commodity } : { status: "Biasa", district_id: districts[0]?.id });
      setError("");
    }
  }, [open, commodity, districts]);

  const set = (key: keyof Commodity) => (v: any) => setForm(f => ({ ...f, [key]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) { setError("Nama komoditas wajib diisi."); return; }
    setSaving(true); setError("");
    const payload = {
      name: form.name, image_url: form.image_url || null, soil_type: form.soil_type || null,
      ph_min: form.ph_min, ph_max: form.ph_max,
      rainfall_min: form.rainfall_min, rainfall_max: form.rainfall_max,
      temp_min: form.temp_min, temp_max: form.temp_max,
      district_id: form.district_id, status: form.status || "Biasa",
    };
    const { error: err } = commodity
      ? await supabase.from("commodities").update(payload).eq("id", commodity.id)
      : await supabase.from("commodities").insert([payload]);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSuccess(); onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden z-10">

            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
              <div>
                <h2 className="font-headline font-black text-lg text-foreground">
                  {commodity ? "Edit Komoditas" : "Tambah Komoditas"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Parameter lingkungan tanaman hortikultura</p>
              </div>
              <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <IconX size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <Field label="Nama Komoditas">
                <Input value={form.name} onChange={set("name")} placeholder="Contoh: Cabai Merah" />
              </Field>
              <Field label="Jenis Tanah">
                <Input value={form.soil_type} onChange={set("soil_type")} placeholder="Contoh: Latosol, Andosol" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="pH Min"><Input type="number" step="0.1" value={form.ph_min} onChange={set("ph_min")} placeholder="5.5" /></Field>
                <Field label="pH Max"><Input type="number" step="0.1" value={form.ph_max} onChange={set("ph_max")} placeholder="7.0" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Curah Hujan Min (mm)"><Input type="number" value={form.rainfall_min} onChange={set("rainfall_min")} placeholder="1500" /></Field>
                <Field label="Curah Hujan Max (mm)"><Input type="number" value={form.rainfall_max} onChange={set("rainfall_max")} placeholder="3000" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Suhu Min (°C)"><Input type="number" step="0.1" value={form.temp_min} onChange={set("temp_min")} placeholder="20" /></Field>
                <Field label="Suhu Max (°C)"><Input type="number" step="0.1" value={form.temp_max} onChange={set("temp_max")} placeholder="32" /></Field>
              </div>
              <Field label="Wilayah">
                <select value={form.district_id || ""} onChange={e => set("district_id")(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                  <option value="">Pilih wilayah</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </Field>
              <Field label="URL Gambar (opsional)">
                <Input value={form.image_url} onChange={set("image_url")} placeholder="https://..." />
              </Field>
              <Field label="Status">
                <select value={form.status || "Biasa"} onChange={e => set("status")(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                  <option value="Biasa">Biasa</option>
                  <option value="Unggulan">Unggulan</option>
                </select>
              </Field>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive">{error}</div>
              )}

              <div className="flex gap-3 pt-2 border-t border-border">
                <button type="button" onClick={() => onOpenChange(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-all">Batal</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#00450d,#1b6d24)" }}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
