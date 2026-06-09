"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  LogOut,
  User,
  History,
  Leaf,
  X,
} from "lucide-react";

// ── Avatar initials ───────────────────────────────────────────────────────────
function Avatar({ user }: { user: any }) {
  const initials = (() => {
    const name = user?.user_metadata?.full_name || user?.email || "U";
    return name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  })();

  if (user?.user_metadata?.avatar_url) {
    return (
      <img
        src={user.user_metadata.avatar_url}
        alt="Avatar"
        className="w-full h-full object-cover rounded-full"
      />
    );
  }
  return (
    <span className="text-white font-black text-xs select-none">{initials}</span>
  );
}

// ── Page title map ─────────────────────────────────────────────────────────────
const pageTitles: Record<string, string> = {
  "/dashboard": "Dasbor",
  "/dashboard/data": "Manajemen Data",
  "/dashboard/map": "Peta Sebaran",
  "/dashboard/predict": "Analisis Baru",
  "/dashboard/results": "Riwayat Rekomendasi",
  "/dashboard/profile": "Profil Saya",
};

export default function TopBar({ title }: { title?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const pageTitle = title || pageTitles[pathname] || "Sistem Varietas Hortikultura";

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user ?? null)
    );
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="flex items-center justify-between h-14 md:h-16 px-4 md:px-6 max-w-screen-2xl mx-auto gap-3">

        {/* ── Left: Logo + Title ── */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo mark (visible on mobile, hidden on desktop where sidebar has logo) */}
          <Link
            href="/dashboard"
            className="md:hidden flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center"
          >
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </Link>

          {/* Page title */}
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col min-w-0"
            >
              <span className="text-sm font-black tracking-tight text-foreground truncate leading-tight">
                {pageTitle}
              </span>
              <span className="hidden md:block text-[10px] font-medium text-muted-foreground tracking-wider uppercase truncate">
                Dinas Pertanian · Aceh Utara
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Center: Search (desktop) ── */}
        <div className="hidden md:flex flex-1 max-w-sm mx-6">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Cari data varietas, kecamatan..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-background transition-all placeholder-muted-foreground/60"
            />
          </div>
        </div>

        {/* ── Right: Actions ── */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">

          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            aria-label="Cari"
          >
            {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Divider */}
          <div className="w-[1px] h-6 bg-border mx-0.5 hidden sm:block" />

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1 pr-2 rounded-xl hover:bg-muted transition-all group"
              aria-label="Menu akun"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[#1b6d24] flex items-center justify-center ring-2 ring-background shadow-sm flex-shrink-0 overflow-hidden">
                <Avatar user={user} />
              </div>

              {/* Name — desktop only */}
              <div className="hidden lg:flex flex-col items-start leading-none">
                <span className="text-sm font-bold text-foreground max-w-[120px] truncate">
                  {displayName}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium max-w-[120px] truncate">
                  {displayEmail}
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-card border border-border shadow-xl overflow-hidden z-50"
                  style={{ transformOrigin: "top right" }}
                >
                  {/* User info header */}
                  <div className="px-4 py-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[#1b6d24] flex items-center justify-center flex-shrink-0 overflow-hidden shadow">
                        <Avatar user={user} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-2 space-y-0.5">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-primary/8 hover:text-primary transition-all group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <User className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      Profil Saya
                    </Link>
                    <Link
                      href="/dashboard/results"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-primary/8 hover:text-primary transition-all group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <History className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      Riwayat Rekomendasi
                    </Link>
                  </div>

                  <div className="border-t border-border mx-2" />

                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/8 transition-all group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/15 transition-colors">
                        <LogOut className="w-3.5 h-3.5 text-destructive" />
                      </div>
                      Keluar Sistem
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Mobile search bar (expandable) ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border"
          >
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari data varietas, kecamatan..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-background transition-all placeholder-muted-foreground/60"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
