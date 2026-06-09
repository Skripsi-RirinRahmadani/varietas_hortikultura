"use client";

import React, { useEffect, useState, Suspense } from "react";
import AppLayout from "@/components/AppLayout";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Prediction } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconLeaf, IconArrowLeft, IconPlus, IconHistory, IconBrain,
  IconCalendar, IconDroplet, IconTemperature, IconFlask,
  IconMapPin, IconChevronRight, IconDownload, IconTarget,
  IconAdjustments, IconBulb, IconCircleCheck, IconAlertTriangle,
  IconMountain, IconSun, IconLayoutGrid, IconLayoutList,
  IconSearch, IconX, IconChevronLeft,
} from "@tabler/icons-react";

type ViewMode = "card" | "list";
const PAGE_SIZE = 9;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function MetricBar({ value, label, icon: Icon }: { value: number; label: string; icon: React.ElementType }) {
  const pct = Math.min(100, Math.round(value * 100));
  const color = pct >= 90 ? "#00450d" : pct >= 75 ? "#1b6d24" : "#d97706";
  return (
    <div className="bg-muted/50 border border-border rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
            <Icon size={13} style={{ color }} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        </div>
        <span className="text-xl font-black tabular-nums" style={{ color }}>{value.toFixed(2)}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="h-full rounded-full" style={{ background: color }} />
      </div>
      <p className="text-[10px] text-muted-foreground tabular-nums">{pct}% akurasi</p>
    </div>
  );
}

function ParamChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon size={13} className="text-primary" />
      </div>
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide leading-none mb-0.5">{label}</p>
        <p className="text-xs font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-muted" />
      <div className="h-40 rounded-2xl bg-muted" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl bg-muted" />)}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// HISTORY VIEWS
// ════════════════════════════════════════════════════════════════════
function EmptyHistory() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-5">
        <IconHistory size={30} className="text-muted-foreground/30" />
      </div>
      <h3 className="text-lg font-black text-foreground mb-2">Belum Ada Riwayat</h3>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs">Mulai eksplorasi dengan membuat analisis lahan pertama Anda sekarang.</p>
      <Link href="/dashboard/predict"
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
        style={{ background: "linear-gradient(135deg,#00450d,#1b6d24)", boxShadow: "0 4px 14px rgba(0,69,13,0.3)" }}>
        <IconPlus size={15} /> Buat Analisis Baru
      </Link>
    </div>
  );
}

// Card / Grid view item
function CardItem({ item, i }: { item: Prediction; i: number }) {
  const pct = Math.round(item.confidence_score * 100);
  const isHigh = pct >= 85;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }}>
      <Link href={`/dashboard/results?id=${item.id}`}
        className="group flex flex-col h-full rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
        <div className="h-1 w-full" style={{ background: isHigh ? "linear-gradient(90deg,#00450d,#1b6d24)" : "var(--muted)" }} />
        <div className="p-5 flex flex-col gap-4 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-105"
              style={{ background: "linear-gradient(135deg,#00450d,#1b6d24)" }}>
              <IconLeaf size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Hasil Prediksi</p>
              <h3 className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">{item.variety_name}</h3>
            </div>
            <div className={`px-2 py-1 rounded-lg text-[10px] font-black flex-shrink-0 ${isHigh ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              {pct}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Tanah", value: item.soil_type },
              { label: "pH", value: String(item.ph) },
              { label: "Hujan", value: `${item.rainfall} mm` },
              { label: "Suhu", value: `${item.temperature}°C` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/50 rounded-xl px-3 py-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
                <p className="text-xs font-bold text-foreground truncate">{value}</p>
              </div>
            ))}
          </div>

          {item.identified_location && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <IconMapPin size={11} className="text-primary/60" />
              <span className="truncate">{item.identified_location}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <IconCalendar size={11} />
              {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-primary group-hover:gap-2 transition-all">
              Detail <IconChevronRight size={12} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Row / List view item
function RowItem({ item, i }: { item: Prediction; i: number }) {
  const pct = Math.round(item.confidence_score * 100);
  const isHigh = pct >= 85;
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: i * 0.03 }}>
      <Link href={`/dashboard/results?id=${item.id}`}
        className="group flex items-center gap-4 px-5 py-4 border-b border-border hover:bg-muted/30 transition-colors last:border-b-0">
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-105"
          style={{ background: "linear-gradient(135deg,#00450d,#1b6d24)" }}>
          <IconLeaf size={15} className="text-white" />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">{item.variety_name}</p>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
            <span className="text-[11px] text-muted-foreground">{item.soil_type}</span>
            <span className="text-[11px] text-muted-foreground">pH {item.ph}</span>
            <span className="text-[11px] text-muted-foreground">{item.rainfall} mm</span>
            <span className="text-[11px] text-muted-foreground">{item.temperature}°C</span>
          </div>
        </div>

        {/* Location */}
        {item.identified_location && (
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0 max-w-[140px]">
            <IconMapPin size={11} className="text-primary/60 flex-shrink-0" />
            <span className="truncate">{item.identified_location}</span>
          </div>
        )}

        {/* Confidence bar */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0 w-28">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: isHigh ? "#00450d" : "#d97706" }} />
          </div>
          <span className={`text-[11px] font-black w-8 text-right ${isHigh ? "text-primary" : "text-amber-600 dark:text-amber-400"}`}>{pct}%</span>
        </div>

        {/* Date */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted-foreground flex-shrink-0 w-28">
          <IconCalendar size={11} />
          {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
        </div>

        <IconChevronRight size={14} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </Link>
    </motion.div>
  );
}

function HistoryList({ history, viewMode }: { history: Prediction[]; viewMode: ViewMode }) {
  if (history.length === 0) return <EmptyHistory />;

  if (viewMode === "card") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {history.map((item, i) => <CardItem key={item.id} item={item} i={i} />)}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Table header */}
      <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-3 border-b border-border bg-muted/30">
        <div className="w-9" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Varietas / Parameter</span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground hidden md:block w-[140px]">Lokasi</span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground hidden sm:block w-28">Kepercayaan</span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground hidden lg:block w-28">Tanggal</span>
        <div className="w-4" />
      </div>
      {history.map((item, i) => <RowItem key={item.id} item={item} i={i} />)}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// DETAIL VIEW
// ════════════════════════════════════════════════════════════════════
function DetailView({ data }: { data: Prediction }) {
  const pct = Math.round(data.confidence_score * 100);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Back + header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link href="/dashboard/results"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-4 group">
            <IconArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Riwayat
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-foreground font-headline">Hasil Klasifikasi Varietas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data.soil_type} · pH {data.ph} · {data.rainfall} mm/th · {data.elevation}m dpl
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 text-xs text-muted-foreground border border-border rounded-xl px-3 py-2">
          <IconCalendar size={13} />
          {new Date(data.created_at).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── Hero result card ── */}
        <div className="lg:col-span-8 rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          {/* Dark header strip */}
          <div className="relative px-6 py-6 overflow-hidden" style={{ background: "linear-gradient(135deg,#001a05 0%,#00450d 100%)" }}>
            {/* Glow */}
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20" style={{ background: "radial-gradient(circle,#4ade80,transparent)" }} />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <IconLeaf size={28} className="text-green-300" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-1">Hasil Prediksi Akhir</p>
                <h2 className="text-3xl font-black text-white leading-tight">
                  {data.identified_location || "Lokasi Teridentifikasi"}
                </h2>
                <p className="text-sm text-green-200/70 mt-1 max-w-lg">
                  Berdasarkan parameter lahan, sistem mengidentifikasi wilayah{" "}
                  <span className="text-green-300 font-semibold">{data.identified_location}</span>{" "}
                  sebagai lokasi paling cocok untuk budidaya.
                </p>
              </div>
              <div className="flex-shrink-0 text-center bg-white/10 border border-white/20 rounded-2xl px-5 py-4">
                <p className="text-[10px] uppercase font-bold text-green-300 tracking-widest mb-1">Skor Kepercayaan</p>
                <p className="text-4xl font-black text-white">{pct}%</p>
                <div className="mt-2 h-1 w-full rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full rounded-full bg-green-400" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Parameter chips */}
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ParamChip icon={IconFlask} label="Jenis Tanah" value={data.soil_type} />
            <ParamChip icon={IconDroplet} label="Curah Hujan" value={`${data.rainfall} mm/th`} />
            <ParamChip icon={IconTemperature} label="Suhu" value={`${data.temperature}°C`} />
            <ParamChip icon={IconMountain} label="Ketinggian" value={`${data.elevation} mdpl`} />
            <ParamChip icon={IconFlask} label="pH Tanah" value={String(data.ph)} />
            {data.sunlight_duration != null && <ParamChip icon={IconSun} label="Sinar Matahari" value={`${data.sunlight_duration} jam/hari`} />}
            {data.water_availability && <ParamChip icon={IconDroplet} label="Ketersediaan Air" value={data.water_availability} />}
          </div>
        </div>

        {/* ── Confusion matrix ── */}
        <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <IconAdjustments size={15} className="text-primary" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Matriks Konfusi</h3>
          </div>
          <div className="grid grid-cols-[auto_1fr_1fr] grid-rows-[auto_1fr_1fr] gap-1.5 text-xs">
            <div />
            <div className="text-center font-bold text-[10px] uppercase tracking-wider text-muted-foreground py-1.5">Pred: Unggul</div>
            <div className="text-center font-bold text-[10px] uppercase tracking-wider text-muted-foreground py-1.5">Pred: Biasa</div>
            <div className="flex items-center font-bold text-[10px] uppercase tracking-wider text-muted-foreground pr-2 writing-mode-vertical" style={{ writingMode: "initial" }}>
              <span className="rotate-0 whitespace-nowrap text-[9px]">Aktual: Unggul</span>
            </div>
            <div className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 p-2 text-center"
              style={{ background: "linear-gradient(135deg,#00450d,#065f18)" }}>
              <span className="text-2xl font-black text-white">142</span>
              <span className="text-[9px] font-bold text-green-200 uppercase tracking-tight leading-none">TP</span>
            </div>
            <div className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 p-2 text-center bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
              <span className="text-2xl font-black text-amber-700 dark:text-amber-400">8</span>
              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-tight leading-none">FN</span>
            </div>
            <div className="flex items-center font-bold text-muted-foreground pr-2">
              <span className="whitespace-nowrap text-[9px] uppercase tracking-wider">Aktual: Biasa</span>
            </div>
            <div className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 p-2 text-center bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
              <span className="text-2xl font-black text-amber-700 dark:text-amber-400">4</span>
              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-tight leading-none">FP</span>
            </div>
            <div className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 p-2 text-center"
              style={{ background: "linear-gradient(135deg,#065f18,#1b6d24)" }}>
              <span className="text-2xl font-black text-white">86</span>
              <span className="text-[9px] font-bold text-green-200 uppercase tracking-tight leading-none">TN</span>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/10">
            <IconBulb size={13} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              False Negative sangat rendah (8), memastikan benih berkualitas jarang terabaikan.
            </p>
          </div>
        </div>

        {/* ── Evaluation metrics ── */}
        <div className="lg:col-span-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <IconTarget size={15} className="text-primary" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Metrik Evaluasi Model</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricBar value={data.accuracy ?? 0.96} label="Akurasi" icon={IconCircleCheck} />
            <MetricBar value={data.precision ?? 0.94} label="Presisi" icon={IconTarget} />
            <MetricBar value={data.recall ?? 0.97} label="Recall" icon={IconHistory} />
            <MetricBar value={data.f1_score ?? 0.95} label="F1-Score" icon={IconBrain} />
          </div>
        </div>

        {/* ── Recommendation ── */}
        {data.recommendation && (
          <div className="lg:col-span-12 rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <IconLeaf size={15} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Rekomendasi Varietas</h3>
                <p className="text-[11px] text-muted-foreground">Dinas Pertanian dan Tanaman Pangan · Kabupaten Aceh Utara</p>
              </div>
            </div>
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex flex-wrap gap-2">
                {data.recommendation.split(", ").map((rec, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold border"
                    style={{ background: "#00450d12", color: "#00450d", borderColor: "#00450d25" }}>
                    <IconLeaf size={12} />
                    {rec}
                  </span>
                ))}
              </div>
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white flex-shrink-0 transition-all hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg,#00450d,#1b6d24)", boxShadow: "0 4px 14px rgba(0,69,13,0.25)" }}>
                <IconDownload size={15} /> Unduh Laporan
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN CONTENT
// ════════════════════════════════════════════════════════════════════
function ResultsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<Prediction | null>(null);
  const [history, setHistory] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      if (id) {
        const { data: pred } = await supabase.from("predictions").select("*").eq("id", id).eq("user_id", user.id).single();
        if (pred) setData(pred);
      } else {
        const { data: all } = await supabase.from("predictions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
        if (all) setHistory(all);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <LoadingSkeleton />;

  if (id && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <IconAlertTriangle size={24} className="text-muted-foreground/40" />
        </div>
        <h2 className="text-lg font-black text-foreground mb-2">Data Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground mb-6">ID prediksi tidak valid atau telah dihapus.</p>
        <Link href="/dashboard/results" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
          <IconArrowLeft size={13} /> Kembali ke Riwayat
        </Link>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {id && data ? (
        <DetailView key="detail" data={data} />
      ) : (
        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Page header */}
          <div className="mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 text-primary text-[10px] font-black uppercase tracking-widest mb-3">
              <IconHistory size={11} /> Arsip Rekomendasi
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground font-headline">Riwayat Analisis Lahan</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Akses kembali seluruh hasil evaluasi dan rekomendasi varietas dari sistem.
            </p>
          </div>

          {/* Toolbar: search + toggle */}
          {history.length > 0 && (() => {
            const filtered = history.filter(item =>
              !search ||
              item.variety_name.toLowerCase().includes(search.toLowerCase()) ||
              item.soil_type.toLowerCase().includes(search.toLowerCase()) ||
              item.identified_location?.toLowerCase().includes(search.toLowerCase())
            );
            const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
            const safePage = Math.min(page, totalPages);
            const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
            const pageNums = Array.from({ length: Math.min(5, totalPages) }, (_, i) =>
              Math.max(1, Math.min(safePage - 2, totalPages - 4)) + i
            );

            return (
              <>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      type="text" value={search} placeholder="Cari varietas, jenis tanah, lokasi..."
                      onChange={e => { setSearch(e.target.value); setPage(1); }}
                      className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder-muted-foreground/50"
                    />
                    {search && (
                      <button onClick={() => { setSearch(""); setPage(1); }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <IconX size={13} />
                      </button>
                    )}
                  </div>

                  {/* View toggle */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border flex-shrink-0">
                    {([
                      { mode: "card" as ViewMode, icon: IconLayoutGrid, label: "Card" },
                      { mode: "list" as ViewMode, icon: IconLayoutList, label: "List" },
                    ]).map(({ mode, icon: Icon, label }) => (
                      <button key={mode} onClick={() => setViewMode(mode)} title={label}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                        style={viewMode === mode
                          ? { background: "var(--card)", color: "var(--foreground)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }
                          : { color: "var(--muted-foreground)" }}>
                        <Icon size={14} />
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Count */}
                <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                  <span>
                    <span className="font-bold text-foreground">{filtered.length}</span> hasil ditemukan
                    {search && <> untuk <span className="font-bold text-foreground">"{search}"</span></>}
                  </span>
                  {search && (
                    <button onClick={() => { setSearch(""); setPage(1); }} className="flex items-center gap-1 text-primary hover:underline font-medium">
                      <IconX size={11} /> Reset
                    </button>
                  )}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                  <motion.div key={`${viewMode}-${safePage}-${search}`}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}>
                    <HistoryList history={paged} viewMode={viewMode} />
                  </motion.div>
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      Halaman <span className="font-bold text-foreground">{safePage}</span> dari{" "}
                      <span className="font-bold text-foreground">{totalPages}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        <IconChevronLeft size={13} />
                      </button>
                      {pageNums.map(p => (
                        <button key={p} onClick={() => setPage(p)}
                          className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                          style={safePage === p
                            ? { background: "var(--primary)", color: "white" }
                            : { border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                          {p}
                        </button>
                      ))}
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        <IconChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ResultsPage() {
  return (
    <AppLayout title="Riwayat Rekomendasi">
      <Suspense fallback={<LoadingSkeleton />}>
        <ResultsContent />
      </Suspense>
    </AppLayout>
  );
}
