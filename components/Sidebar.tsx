"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconLayoutDashboard,
  IconDatabase,
  IconMap2,
  IconHistory,
  IconPlant2,
  IconBrain,
  IconChevronDown,
  IconChevronRight,
  IconLogout,
  IconLeaf,
  IconSparkles,
  IconClock,
  IconSeeding,
} from "@tabler/icons-react";

// ── Nav item type ─────────────────────────────────────────────────────────────
interface NavItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  badge?: number;
}

// ── Desktop nav item ──────────────────────────────────────────────────────────
function SideNavItem({ href, label, icon: Icon, active, badge }: NavItemProps) {
  return (
    <Link href={href} className="block relative group">
      <motion.div
        whileHover={{ x: active ? 0 : 2 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 relative"
        style={active
          ? { background: "var(--primary)", color: "white" }
          : { color: "var(--muted-foreground)" }
        }
      >
        {/* Hover bg */}
        {!active && (
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: "rgba(0,69,13,0.07)" }} />
        )}

        {/* Active glow */}
        {active && (
          <div className="absolute inset-0 rounded-xl opacity-30 blur-md"
            style={{ background: "var(--primary)" }} />
        )}

        <div className="relative flex items-center gap-3 w-full">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${active ? "bg-white/15" : "bg-transparent group-hover:bg-white/5"}`}>
            <Icon
              size={18}
              stroke={active ? 2.2 : 1.7}
              className="transition-all"
              style={{ color: active ? "white" : "inherit" }}
            />
          </div>
          <span className={`text-[13px] font-semibold tracking-tight flex-1 ${active ? "text-white" : "group-hover:text-foreground"}`}>
            {label}
          </span>
          {badge !== undefined && badge > 0 && (
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none ${active ? "bg-white/25 text-white" : "bg-primary/15 text-primary"}`}>
              {badge}
            </span>
          )}
          {active && (
            <motion.div
              layoutId="sidebar-active-dot"
              className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0"
            />
          )}
        </div>
      </motion.div>
    </Link>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-5 pb-1.5">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
        {children}
      </span>
    </div>
  );
}

// ── Bottom bar nav item (mobile) ──────────────────────────────────────────────
function BottomNavItem({ href, label, Icon, active }: {
  href: string; label: string; Icon: React.ElementType; active: boolean;
}) {
  return (
    <Link href={href} className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full">
      <motion.div whileTap={{ scale: 0.82 }} className="relative flex flex-col items-center gap-1">
        {active && (
          <motion.div
            layoutId="bottom-active-bg"
            className="absolute -inset-x-3 -inset-y-1.5 rounded-2xl"
            style={{ background: "rgba(0,69,13,0.08)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <div className="relative">
          <Icon
            size={21}
            stroke={active ? 2.2 : 1.6}
            style={{ color: active ? "var(--primary)" : "var(--muted-foreground)" }}
            className="transition-colors duration-150"
          />
          {active && (
            <motion.div
              layoutId="bottom-active-dot"
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
              style={{ background: "var(--primary)" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </div>
        <span
          className="text-[10px] font-semibold relative"
          style={{ color: active ? "var(--primary)" : "var(--muted-foreground)" }}
        >
          {label}
        </span>
      </motion.div>
    </Link>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    let currentUser: any = null;

    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return;
      currentUser = u;
      setUser(u);

      const { data } = await supabase
        .from("predictions")
        .select("id, created_at, variety_name, soil_type, user_id")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setHistory(data);
    };

    init();

    const channel = supabase
      .channel("sidebar-predictions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "predictions" },
        (payload) => {
          if (currentUser && payload.new.user_id === currentUser.id)
            setHistory((prev) => [payload.new, ...prev.slice(0, 4)]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Auto-open history accordion when on results page
  useEffect(() => {
    if (pathname.startsWith("/dashboard/results")) setIsHistoryOpen(true);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <>
      {/* ════════════════════════════════════════
          DESKTOP SIDEBAR
      ════════════════════════════════════════ */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-[240px] z-40 border-r border-border"
        style={{ background: "var(--card)" }}>

        {/* ── Header / Branding (fixed) ── */}
        <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-border">
          <div className="flex items-center gap-3 px-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
              style={{ background: "linear-gradient(135deg, #00450d, #1b6d24)" }}
            >
              <IconLeaf size={18} className="text-white" stroke={2} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-black tracking-tight text-foreground leading-none">SiVartas</p>
              <p className="text-[10px] font-semibold text-muted-foreground mt-0.5 truncate">
                Dinas Pertanian Aceh Utara
              </p>
            </div>
          </div>
        </div>

        {/* ── Scrollable nav ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-border
          hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">

          {/* Menu Utama */}
          <SectionLabel>Menu Utama</SectionLabel>
          <div className="space-y-0.5">
            <SideNavItem href="/dashboard" label="Dasbor" icon={IconLayoutDashboard} active={isActive("/dashboard")} />
            <SideNavItem href="/dashboard/data" label="Manajemen Data" icon={IconDatabase} active={isActive("/dashboard/data")} />
            <SideNavItem href="/dashboard/map" label="Peta Sebaran" icon={IconMap2} active={isActive("/dashboard/map")} />
          </div>

          {/* Rekomendasi */}
          <SectionLabel>Rekomendasi</SectionLabel>
          <div className="space-y-0.5">
            <SideNavItem
              href="/dashboard/predict"
              label="Analisis Baru"
              icon={IconSparkles}
              active={isActive("/dashboard/predict")}
            />

            {/* History accordion */}
            <div>
              <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 group"
                style={
                  isActive("/dashboard/results") || isHistoryOpen
                    ? { background: "rgba(0,69,13,0.07)", color: "var(--primary)" }
                    : { color: "var(--muted-foreground)" }
                }
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent group-hover:bg-primary/8 transition-colors">
                  <IconBrain size={18} stroke={1.7} />
                </div>
                <span className="text-[13px] font-semibold flex-1 text-left group-hover:text-foreground transition-colors">
                  Riwayat
                </span>
                {history.length > 0 && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-primary/12 text-primary leading-none">
                    {history.length}
                  </span>
                )}
                <motion.div
                  animate={{ rotate: isHistoryOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconChevronDown size={14} />
                </motion.div>
              </button>

              {/* Accordion content */}
              <AnimatePresence initial={false}>
                {isHistoryOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="ml-3 mt-1 mb-1 pl-3 border-l-2 border-border space-y-0.5">
                      {/* All results link */}
                      <Link
                        href="/dashboard/results"
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          isActive("/dashboard/results")
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <IconHistory size={13} stroke={1.8} />
                        Lihat Semua
                      </Link>

                      {/* Recent items */}
                      {history.length > 0 ? history.map((item) => (
                        <Link
                          key={item.id}
                          href={`/dashboard/results?id=${item.id}`}
                          className={`flex flex-col gap-0.5 px-2.5 py-2 rounded-lg transition-colors ${
                            pathname.includes(item.id)
                              ? "bg-primary/10 border border-primary/15"
                              : "hover:bg-muted"
                          }`}
                        >
                          <span className={`text-[12px] font-semibold truncate ${
                            pathname.includes(item.id) ? "text-primary" : "text-foreground"
                          }`}>
                            {item.variety_name}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <IconClock size={9} className="text-muted-foreground flex-shrink-0" />
                            <span className="text-[10px] text-muted-foreground truncate">
                              {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            </span>
                            {item.soil_type && (
                              <>
                                <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                                <IconSeeding size={9} className="text-muted-foreground flex-shrink-0" />
                                <span className="text-[10px] text-muted-foreground truncate uppercase tracking-tight">
                                  {item.soil_type}
                                </span>
                              </>
                            )}
                          </div>
                        </Link>
                      )) : (
                        <div className="px-2.5 py-3 text-center">
                          <p className="text-[11px] text-muted-foreground/60 italic">Belum ada riwayat</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* User info mini card */}
          <div className="mt-4 mb-2 mx-0">
            <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl bg-muted/50 border border-border">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-black shadow-sm"
                style={{ background: "linear-gradient(135deg, #00450d, #1b6d24)" }}
              >
                {displayName[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-foreground truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Spacer so last item isn't hidden behind sticky bottom */}
          <div className="h-4" />
        </div>

        {/* ── Fixed bottom ── */}
        <div className="flex-shrink-0 px-3 pb-4 pt-3 border-t border-border space-y-1.5">
          {/* CTA */}
          <Link
            href="/dashboard/predict"
            className="group relative flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-[13px] font-bold overflow-hidden transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #00450d 0%, #1b6d24 100%)",
              boxShadow: "0 4px 16px rgba(0,69,13,0.3)",
            }}
          >
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <IconSparkles size={15} stroke={2} className="relative z-10" />
            <span className="relative z-10 tracking-wide">Analisis Baru</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent group-hover:bg-destructive/10 transition-colors flex-shrink-0">
              <IconLogout size={16} stroke={1.7} />
            </div>
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════
          FLOATING BOTTOM BAR (MOBILE)
      ════════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div
          className="relative flex items-center justify-between px-3 h-16 rounded-[24px] overflow-visible"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div
            className="absolute top-0 left-8 right-8 h-[1px] rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0,69,13,0.2), transparent)" }}
          />

          <BottomNavItem href="/dashboard" label="Dasbor" Icon={IconLayoutDashboard} active={isActive("/dashboard")} />
          <BottomNavItem href="/dashboard/data" label="Data" Icon={IconDatabase} active={isActive("/dashboard/data")} />

          {/* Center FAB */}
          <Link href="/dashboard/predict" className="relative -mt-6 flex-shrink-0">
            <motion.div
              whileTap={{ scale: 0.91 }}
              whileHover={{ scale: 1.05 }}
              className="relative w-14 h-14 rounded-[18px] flex items-center justify-center overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #00450d 0%, #1b6d24 100%)",
                boxShadow: "0 4px 20px rgba(0,69,13,0.4), 0 0 0 3px var(--card), 0 0 0 4.5px rgba(0,69,13,0.12)",
              }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 55%)" }}
              />
              <IconSparkles size={24} className="text-white relative z-10" stroke={1.8} />
              {isActive("/dashboard/predict") && (
                <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-green-300" />
              )}
            </motion.div>
          </Link>

          <BottomNavItem href="/dashboard/map" label="Peta" Icon={IconMap2} active={isActive("/dashboard/map")} />
          <BottomNavItem href="/dashboard/results" label="Histori" Icon={IconHistory} active={isActive("/dashboard/results")} />
        </div>
      </div>
    </>
  );
}
