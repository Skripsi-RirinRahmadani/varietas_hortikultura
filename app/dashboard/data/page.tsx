"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/lib/supabase";
import { Commodity, District, Prediction, Variety, Profile } from "@/lib/types";
import CommodityDialog from "@/components/CommodityDialog";
import { exportToCSV, parseCSV } from "@/lib/csv-utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconSearch, IconPlus, IconUpload, IconDownload, IconEdit, IconTrash,
  IconLeaf, IconMapPin, IconDroplet, IconTemperature, IconFlask,
  IconRefresh, IconChevronLeft, IconChevronRight, IconSelector,
  IconChevronUp, IconChevronDown, IconX, IconFilter,
  IconStar, IconStarFilled, IconPlant2, IconMap, IconBrain,
  IconUsers, IconUser, IconCalendar, IconAlertCircle,
} from "@tabler/icons-react";

// ─── Types ──────────────────────────────────────────────────────────────────
type TabKey = "komoditas" | "varietas" | "wilayah" | "prediksi" | "pengguna";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 10;

// ─── Tab config ──────────────────────────────────────────────────────────────
const TABS: { key: TabKey; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "komoditas", label: "Komoditas",  icon: IconLeaf,    desc: "Parameter lingkungan komoditas hortikultura" },
  { key: "varietas",  label: "Varietas",   icon: IconPlant2,  desc: "Data varietas unggulan per komoditas" },
  { key: "wilayah",   label: "Wilayah",    icon: IconMap,     desc: "Data kecamatan & wilayah pertanian" },
  { key: "prediksi",  label: "Prediksi",   icon: IconBrain,   desc: "Riwayat hasil prediksi sistem" },
  { key: "pengguna",  label: "Pengguna",   icon: IconUsers,   desc: "Data akun & profil pengguna" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function cn(...c: (string | undefined | false)[]) { return c.filter(Boolean).join(" "); }

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <IconSelector size={12} className="text-muted-foreground/40 flex-shrink-0" />;
  return dir === "asc"
    ? <IconChevronUp size={12} className="text-primary flex-shrink-0" />
    : <IconChevronDown size={12} className="text-primary flex-shrink-0" />;
}

function StatusBadge({ status }: { status: string }) {
  const ok = status === "Unggulan";
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
      ok ? "bg-primary/10 text-primary border border-primary/20"
         : "bg-muted text-muted-foreground border border-border"
    )}>
      {ok ? <IconStarFilled size={9} /> : <IconStar size={9} />}
      {status}
    </span>
  );
}

const SKELETON_WIDTHS = [80, 120, 96, 64, 110, 88, 72, 104, 60, 92];

function SkeletonRows({ cols }: { cols: number }) {
  return <>
    {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i}>
        {Array.from({ length: cols + 1 }).map((_, j) => (
          <td key={j} className="px-5 py-4">
            <div className="h-4 rounded-lg bg-muted animate-pulse"
              style={{ width: `${SKELETON_WIDTHS[(i * 7 + j) % SKELETON_WIDTHS.length]}px` }} />
          </td>
        ))}
      </tr>
    ))}
  </>;
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <IconFilter size={22} className="text-muted-foreground/40" />
      </div>
      <p className="font-bold text-sm text-foreground mb-1">Tidak ada data ditemukan</p>
      <p className="text-xs text-muted-foreground mb-5">Coba ubah kata kunci atau reset filter</p>
      <button onClick={onReset} className="px-5 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-all">
        Reset Filter
      </button>
    </div>
  );
}

// ─── Shared Toolbar ───────────────────────────────────────────────────────────
function Toolbar({
  search, onSearch, total, loading, onRefresh, onAdd, addLabel,
  filterSlot, importRef, onImport, onExport, showImportExport = true,
}: {
  search: string; onSearch: (v: string) => void; total: number;
  loading: boolean; onRefresh: () => void; onAdd?: () => void; addLabel?: string;
  filterSlot?: React.ReactNode; importRef?: React.RefObject<HTMLInputElement | null>;
  onImport?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport?: () => void; showImportExport?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border bg-muted/20">
      <div className="relative flex-1">
        <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text" placeholder="Cari data..." value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder-muted-foreground/50"
        />
        {search && (
          <button onClick={() => onSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <IconX size={13} />
          </button>
        )}
      </div>
      {filterSlot}
      <div className="flex items-center gap-2">
        {onAdd && (
          <button onClick={onAdd}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg,#00450d,#1b6d24)", boxShadow: "0 2px 10px rgba(0,69,13,0.25)" }}>
            <IconPlus size={14} /> {addLabel ?? "Tambah"}
          </button>
        )}
        {showImportExport && importRef && onImport && (
          <>
            <input type="file" ref={importRef} className="hidden" accept=".csv" onChange={onImport} />
            <button onClick={() => importRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border border-border bg-background hover:bg-muted transition-all">
              <IconUpload size={13} /><span className="hidden sm:inline">Import</span>
            </button>
          </>
        )}
        {onExport && showImportExport && (
          <button onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border border-border bg-background hover:bg-muted transition-all">
            <IconDownload size={13} /><span className="hidden sm:inline">Export</span>
          </button>
        )}
        <button onClick={onRefresh} title="Refresh"
          className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted transition-all text-muted-foreground hover:text-foreground">
          <IconRefresh size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
}

// ─── Shared count + reset bar ─────────────────────────────────────────────────
function CountBar({ total, hasFilter, onReset }: { total: number; hasFilter: boolean; onReset: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-muted/10 text-xs text-muted-foreground">
      <span><span className="font-bold text-foreground">{total}</span> data ditemukan</span>
      {hasFilter && (
        <button onClick={onReset} className="flex items-center gap-1 text-primary hover:underline font-medium">
          <IconX size={11} /> Reset filter
        </button>
      )}
    </div>
  );
}

// ─── Shared pagination ────────────────────────────────────────────────────────
function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) =>
    Math.max(1, Math.min(page - 2, totalPages - 4)) + i
  );
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-muted/10">
      <span className="text-xs text-muted-foreground">
        Halaman <span className="font-bold text-foreground">{page}</span> dari <span className="font-bold text-foreground">{totalPages}</span>
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          <IconChevronLeft size={13} />
        </button>
        {pages.map((p) => (
          <button key={p} onClick={() => onChange(p)}
            className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
            style={page === p ? { background: "var(--primary)", color: "white" } : { border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
            {p}
          </button>
        ))}
        <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          <IconChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Field input helper ───────────────────────────────────────────────────────
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
    <input type={type} step={step} value={value ?? ""} onChange={(e) => onChange(type === "number" ? parseFloat(e.target.value) : e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all" />
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, subtitle, children }: {
  open: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden z-10">
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
              <div>
                <h2 className="font-headline font-black text-lg text-foreground">{title}</h2>
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <IconX size={16} />
              </button>
            </div>
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 1 — KOMODITAS
// ════════════════════════════════════════════════════════════════════
function TabKomoditas({ districts }: { districts: District[] }) {
  const [data, setData] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Unggulan" | "Biasa">("all");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Commodity | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: d } = await supabase.from("commodities").select("*, district:districts(name)").order("name");
    if (d) setData(d);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [search, statusFilter, sortField, sortDir]);

  const filtered = data.filter(c =>
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.soil_type?.toLowerCase().includes(search.toLowerCase()) || c.district?.name?.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === "all" || c.status === statusFilter)
  ).sort((a, b) => {
    const va = (a as any)[sortField] ?? ""; const vb = (b as any)[sortField] ?? "";
    return sortDir === "asc" ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1);
  });

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data ini?")) return;
    await supabase.from("commodities").delete().eq("id", id);
    fetch();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const parsed = parseCSV(ev.target?.result as string);
      if (!parsed.length) return alert("File tidak valid.");
      const rows = parsed.map((item: any) => {
        const d = districts.find(x => x.name.toLowerCase() === item._district_name?.toLowerCase());
        const { _district_name, ...clean } = item;
        return { ...clean, district_id: d?.id || districts[0]?.id };
      });
      const { error } = await supabase.from("commodities").upsert(rows);
      if (!error) { alert(`${rows.length} data diimpor.`); fetch(); } else alert("Gagal impor.");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const cols = [
    { label: "Komoditas", field: "name" }, { label: "pH", field: "ph_min" },
    { label: "Hujan", field: "rainfall_min" }, { label: "Suhu", field: "temp_min" },
    { label: "Wilayah", field: "district" }, { label: "Status", field: "status" },
  ];

  return (
    <>
      <Toolbar search={search} onSearch={setSearch} total={filtered.length} loading={loading} onRefresh={fetch}
        onAdd={() => { setSelected(null); setDialogOpen(true); }} addLabel="Tambah"
        filterSlot={
          <div className="flex items-center gap-1 p-1 rounded-xl bg-background border border-border">
            {(["all", "Unggulan", "Biasa"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={statusFilter === s ? { background: "var(--primary)", color: "white" } : { color: "var(--muted-foreground)" }}>
                {s === "all" ? "Semua" : s}
              </button>
            ))}
          </div>
        }
        importRef={fileRef} onImport={handleImport}
        onExport={() => exportToCSV(data, `komoditas-${new Date().toISOString().split("T")[0]}.csv`)}
      />
      <CountBar total={filtered.length} hasFilter={!!search || statusFilter !== "all"} onReset={() => { setSearch(""); setStatusFilter("all"); }} />
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {cols.map(c => (
                <th key={c.field} onClick={() => { if (sortField === c.field) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortField(c.field); setSortDir("asc"); } }}
                  className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  <div className="flex items-center gap-1.5">{c.label}<SortIcon active={sortField === c.field} dir={sortDir} /></div>
                </th>
              ))}
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? <SkeletonRows cols={cols.length} /> : paged.map(item => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center flex-shrink-0">
                      {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : <IconLeaf size={15} className="text-primary/40" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">{item.soil_type || "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm tabular-nums text-foreground">{item.ph_min}–{item.ph_max}</td>
                <td className="px-5 py-4 text-sm tabular-nums text-foreground">{item.rainfall_min ?? "—"} <span className="text-[10px] text-muted-foreground">mm</span></td>
                <td className="px-5 py-4 text-sm tabular-nums text-foreground">{item.temp_min}–{item.temp_max} <span className="text-[10px] text-muted-foreground">°C</span></td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-xs font-medium border border-border">
                    <IconMapPin size={10} className="text-muted-foreground" />{item.district?.name || "—"}
                  </span>
                </td>
                <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setSelected(item); setDialogOpen(true); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"><IconEdit size={14} /></button>
                    <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"><IconTrash size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile */}
      <div className="md:hidden divide-y divide-border">
        {(loading ? [] : paged).map(item => (
          <div key={item.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-sm text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.soil_type || "—"}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[{ icon: IconFlask, val: `pH ${item.ph_min}–${item.ph_max}` }, { icon: IconDroplet, val: `${item.rainfall_min}mm` }, { icon: IconTemperature, val: `${item.temp_min}–${item.temp_max}°C` }, { icon: IconMapPin, val: item.district?.name || "—" }].map(({ icon: Ic, val }) => (
                <span key={val} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-[11px] font-medium border border-border"><Ic size={10} />{val}</span>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <button onClick={() => { setSelected(item); setDialogOpen(true); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border border-border hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"><IconEdit size={13} />Edit</button>
              <button onClick={() => handleDelete(item.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border border-border hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-all"><IconTrash size={13} />Hapus</button>
            </div>
          </div>
        ))}
      </div>
      {!loading && filtered.length === 0 && <EmptyState onReset={() => { setSearch(""); setStatusFilter("all"); }} />}
      <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      <CommodityDialog open={dialogOpen} onOpenChange={setDialogOpen} commodity={selected} districts={districts} onSuccess={fetch} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 2 — VARIETAS
// ════════════════════════════════════════════════════════════════════
function TabVarietas({ commodities }: { commodities: Commodity[] }) {
  const [data, setData] = useState<Variety[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Variety | null>(null);
  const [form, setForm] = useState<Partial<Variety>>({});
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: d } = await supabase.from("varieties").select("*, commodity:commodities(name)").order("name");
    if (d) setData(d);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [search]);

  const openAdd = () => { setSelected(null); setForm({ status: "Biasa", commodity_id: commodities[0]?.id }); setModalOpen(true); };
  const openEdit = (item: Variety) => { setSelected(item); setForm({ ...item }); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { name: form.name, commodity_id: form.commodity_id, description: form.description, harvest_age_days: form.harvest_age_days, yield_per_ha: form.yield_per_ha, resistance: form.resistance, source: form.source, status: form.status };
    const { error } = selected
      ? await supabase.from("varieties").update(payload).eq("id", selected.id)
      : await supabase.from("varieties").insert([payload]);
    setSaving(false);
    if (!error) { fetch(); setModalOpen(false); } else alert("Gagal menyimpan.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data varietas ini?")) return;
    await supabase.from("varieties").delete().eq("id", id);
    fetch();
  };

  const filtered = data.filter(v => !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.commodity?.name.toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <Toolbar search={search} onSearch={setSearch} total={filtered.length} loading={loading} onRefresh={fetch}
        onAdd={openAdd} addLabel="Tambah" showImportExport={false} />
      <CountBar total={filtered.length} hasFilter={!!search} onReset={() => setSearch("")} />
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Nama Varietas", "Komoditas", "Umur Panen", "Hasil/Ha", "Ketahanan", "Status"].map(h => (
                <th key={h} className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
              <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? <SkeletonRows cols={6} /> : paged.map(item => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-5 py-4">
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground">{item.source || "—"}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-xs font-medium border border-border">
                    <IconLeaf size={10} className="text-primary/60" />{item.commodity?.name || "—"}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-foreground tabular-nums">{item.harvest_age_days ? `${item.harvest_age_days} hari` : "—"}</td>
                <td className="px-5 py-4 text-sm text-foreground tabular-nums">{item.yield_per_ha ? `${item.yield_per_ha} ton/ha` : "—"}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground max-w-[150px] truncate">{item.resistance || "—"}</td>
                <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"><IconEdit size={14} /></button>
                    <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"><IconTrash size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile */}
      <div className="md:hidden divide-y divide-border">
        {paged.map(item => (
          <div key={item.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div><p className="font-bold text-sm">{item.name}</p><p className="text-xs text-muted-foreground">{item.commodity?.name || "—"}</p></div>
              <StatusBadge status={item.status} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.harvest_age_days && <span className="text-[11px] px-2 py-1 rounded-lg bg-muted border border-border">{item.harvest_age_days} hari</span>}
              {item.yield_per_ha && <span className="text-[11px] px-2 py-1 rounded-lg bg-muted border border-border">{item.yield_per_ha} ton/ha</span>}
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <button onClick={() => openEdit(item)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border border-border hover:text-primary hover:bg-primary/5 transition-all"><IconEdit size={13} />Edit</button>
              <button onClick={() => handleDelete(item.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border border-border hover:text-destructive hover:bg-destructive/5 transition-all"><IconTrash size={13} />Hapus</button>
            </div>
          </div>
        ))}
      </div>
      {!loading && filtered.length === 0 && <EmptyState onReset={() => setSearch("")} />}
      <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={selected ? "Edit Varietas" : "Tambah Varietas"}
        subtitle="Data varietas unggulan tanaman hortikultura">
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Nama Varietas"><Input value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Contoh: Cabai TM-999" /></Field>
          <Field label="Komoditas">
            <select value={form.commodity_id || ""} onChange={e => setForm(f => ({ ...f, commodity_id: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
              <option value="">Pilih komoditas</option>
              {commodities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Umur Panen (hari)"><Input type="number" value={form.harvest_age_days} onChange={v => setForm(f => ({ ...f, harvest_age_days: v }))} placeholder="60" /></Field>
            <Field label="Hasil per Ha (ton)"><Input type="number" step="0.1" value={form.yield_per_ha} onChange={v => setForm(f => ({ ...f, yield_per_ha: v }))} placeholder="12.5" /></Field>
          </div>
          <Field label="Ketahanan Penyakit"><Input value={form.resistance} onChange={v => setForm(f => ({ ...f, resistance: v }))} placeholder="Tahan layu bakteri" /></Field>
          <Field label="Sumber / Instansi"><Input value={form.source} onChange={v => setForm(f => ({ ...f, source: v }))} placeholder="BPTP Aceh" /></Field>
          <Field label="Deskripsi"><textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Keterangan tambahan..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none" /></Field>
          <Field label="Status">
            <select value={form.status || "Biasa"} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
              <option value="Biasa">Biasa</option>
              <option value="Unggulan">Unggulan</option>
            </select>
          </Field>
          <div className="flex gap-3 pt-2 border-t border-border">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-all">Batal</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#00450d,#1b6d24)" }}>
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 3 — WILAYAH
// ════════════════════════════════════════════════════════════════════
function TabWilayah() {
  const [data, setData] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<District | null>(null);
  const [form, setForm] = useState<Partial<District>>({});
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: d } = await supabase.from("districts").select("*").order("name");
    if (d) setData(d);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [search]);

  const openAdd = () => { setSelected(null); setForm({}); setModalOpen(true); };
  const openEdit = (item: District) => { setSelected(item); setForm({ ...item }); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const { error } = selected
      ? await supabase.from("districts").update({ name: form.name, description: form.description }).eq("id", selected.id)
      : await supabase.from("districts").insert([{ name: form.name, description: form.description }]);
    setSaving(false);
    if (!error) { fetch(); setModalOpen(false); } else alert("Gagal menyimpan.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus wilayah ini?")) return;
    await supabase.from("districts").delete().eq("id", id);
    fetch();
  };

  const filtered = data.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.description?.toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <Toolbar search={search} onSearch={setSearch} total={filtered.length} loading={loading} onRefresh={fetch}
        onAdd={openAdd} addLabel="Tambah" showImportExport={false} />
      <CountBar total={filtered.length} hasFilter={!!search} onReset={() => setSearch("")} />
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["#", "Nama Kecamatan", "Deskripsi", "Dibuat"].map(h => (
                <th key={h} className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
              <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? <SkeletonRows cols={4} /> : paged.map((item, i) => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-5 py-4 text-xs text-muted-foreground tabular-nums">{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <IconMapPin size={14} className="text-primary" />
                    </div>
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground max-w-[240px] truncate">{item.description || "—"}</td>
                <td className="px-5 py-4 text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"><IconEdit size={14} /></button>
                    <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"><IconTrash size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile */}
      <div className="md:hidden divide-y divide-border">
        {paged.map(item => (
          <div key={item.id} className="p-4 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><IconMapPin size={15} className="text-primary" /></div>
              <div><p className="font-bold text-sm">{item.name}</p><p className="text-xs text-muted-foreground">{item.description || "Tanpa deskripsi"}</p></div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <button onClick={() => openEdit(item)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border border-border hover:text-primary hover:bg-primary/5 transition-all"><IconEdit size={13} />Edit</button>
              <button onClick={() => handleDelete(item.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border border-border hover:text-destructive hover:bg-destructive/5 transition-all"><IconTrash size={13} />Hapus</button>
            </div>
          </div>
        ))}
      </div>
      {!loading && filtered.length === 0 && <EmptyState onReset={() => setSearch("")} />}
      <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selected ? "Edit Wilayah" : "Tambah Wilayah"} subtitle="Data kecamatan pertanian">
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Nama Kecamatan"><Input value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Contoh: Muara Batu" /></Field>
          <Field label="Deskripsi"><textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Keterangan wilayah..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none" /></Field>
          <div className="flex gap-3 pt-2 border-t border-border">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-all">Batal</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: "linear-gradient(135deg,#00450d,#1b6d24)" }}>
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 4 — PREDIKSI
// ════════════════════════════════════════════════════════════════════
function TabPrediksi() {
  const [data, setData] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: d } = await supabase.from("predictions").select("*").order("created_at", { ascending: false });
    if (d) setData(d);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data prediksi ini?")) return;
    await supabase.from("predictions").delete().eq("id", id);
    fetch();
  };

  const filtered = data.filter(d => !search ||
    d.variety_name.toLowerCase().includes(search.toLowerCase()) ||
    d.soil_type.toLowerCase().includes(search.toLowerCase()) ||
    d.identified_location?.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <Toolbar search={search} onSearch={setSearch} total={filtered.length} loading={loading} onRefresh={fetch}
        showImportExport={false} />
      <CountBar total={filtered.length} hasFilter={!!search} onReset={() => setSearch("")} />
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Varietas", "Lokasi", "Parameter", "Akurasi", "Tanggal"].map(h => (
                <th key={h} className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
              <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? <SkeletonRows cols={5} /> : paged.map(item => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><IconBrain size={14} className="text-primary" /></div>
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.variety_name}</p>
                      <p className="text-[11px] text-muted-foreground">{item.soil_type}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground max-w-[140px] truncate">{item.identified_location || "—"}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground tabular-nums">
                    <span>pH {item.ph} · {item.rainfall}mm</span>
                    <span>{item.temperature}°C · {item.elevation}m</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  {item.confidence_score != null && (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.confidence_score * 100}%`, background: "var(--primary)" }} />
                      </div>
                      <span className="text-xs font-bold text-foreground">{(item.confidence_score * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <IconCalendar size={11} />
                    {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"><IconTrash size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile */}
      <div className="md:hidden divide-y divide-border">
        {paged.map(item => (
          <div key={item.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div><p className="font-bold text-sm">{item.variety_name}</p><p className="text-xs text-muted-foreground">{item.soil_type} · {item.identified_location || "—"}</p></div>
              <span className="text-xs font-bold text-primary">{item.confidence_score ? `${(item.confidence_score * 100).toFixed(0)}%` : "—"}</span>
            </div>
            <button onClick={() => handleDelete(item.id)} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border border-border hover:text-destructive hover:bg-destructive/5 transition-all"><IconTrash size={13} />Hapus</button>
          </div>
        ))}
      </div>
      {!loading && filtered.length === 0 && <EmptyState onReset={() => setSearch("")} />}
      <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 5 — PENGGUNA
// ════════════════════════════════════════════════════════════════════
function TabPengguna() {
  const [data, setData] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: d } = await supabase.from("profiles").select("*").order("updated_at", { ascending: false });
    if (d) setData(d);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [search]);

  const filtered = data.filter(d => !search ||
    d.full_name?.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <Toolbar search={search} onSearch={setSearch} total={filtered.length} loading={loading} onRefresh={fetch} showImportExport={false} />
      <CountBar total={filtered.length} hasFilter={!!search} onReset={() => setSearch("")} />

      {/* Info banner */}
      <div className="mx-5 mt-3 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 text-xs text-amber-700 dark:text-amber-400">
        <IconAlertCircle size={14} className="flex-shrink-0" />
        Data pengguna ditampilkan dari tabel <code className="font-mono bg-amber-100 dark:bg-amber-900/30 px-1 rounded">profiles</code>. Manajemen akun lengkap tersedia di Supabase Auth.
      </div>

      <div className="hidden md:block overflow-x-auto mt-3">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Pengguna", "ID", "Terakhir Update"].map(h => (
                <th key={h} className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? <SkeletonRows cols={2} /> : paged.map(item => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {item.avatar_url
                      ? <img src={item.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-border flex-shrink-0" />
                      : (
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#00450d,#1b6d24)" }}>
                          {item.full_name?.[0]?.toUpperCase() ?? <IconUser size={15} />}
                        </div>
                      )}
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.full_name || "Tanpa nama"}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{item.id.slice(0, 8)}…</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{item.id}</td>
                <td className="px-5 py-4 text-xs text-muted-foreground">
                  {item.updated_at ? new Date(item.updated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile */}
      <div className="md:hidden divide-y divide-border">
        {paged.map(item => (
          <div key={item.id} className="p-4 flex items-center gap-3">
            {item.avatar_url
              ? <img src={item.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0" />
              : <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0" style={{ background: "linear-gradient(135deg,#00450d,#1b6d24)" }}>{item.full_name?.[0]?.toUpperCase() ?? "?"}</div>
            }
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground truncate">{item.full_name || "Tanpa nama"}</p>
              <p className="text-[10px] font-mono text-muted-foreground truncate">{item.id}</p>
            </div>
          </div>
        ))}
      </div>
      {!loading && filtered.length === 0 && <EmptyState onReset={() => setSearch("")} />}
      <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════
export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("komoditas");
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  useEffect(() => {
    supabase.from("commodities").select("id, name").order("name").then(({ data }) => { if (data) setCommodities(data as any); });
    supabase.from("districts").select("*").order("name").then(({ data }) => { if (data) setDistricts(data); });
  }, []);

  const currentTab = TABS.find(t => t.key === activeTab)!;

  return (
    <AppLayout title="Manajemen Data">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground font-headline">Master Data</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{currentTab.desc}</p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-muted/60 border border-border overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={active ? { background: "var(--card)", color: "var(--foreground)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" } : { color: "var(--muted-foreground)" }}
              >
                {active && (
                  <motion.div layoutId="tab-active" className="absolute inset-0 rounded-xl bg-card shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }} style={{ zIndex: -1 }} />
                )}
                <Icon size={15} stroke={active ? 2.2 : 1.7} style={{ color: active ? "var(--primary)" : "inherit" }} />
                <span className={active ? "text-foreground font-bold" : ""}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
          >
            {activeTab === "komoditas" && <TabKomoditas districts={districts} />}
            {activeTab === "varietas"  && <TabVarietas commodities={commodities} />}
            {activeTab === "wilayah"   && <TabWilayah />}
            {activeTab === "prediksi"  && <TabPrediksi />}
            {activeTab === "pengguna"  && <TabPengguna />}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
