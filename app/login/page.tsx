"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sprout,
  MapPin,
  BarChart3,
  LogIn,
} from "lucide-react";

// ── Floating particle for left panel ────────────────────────────────────────
function Particles() {
  const items = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 3 + 1.5,
    delay: Math.random() * 5,
    dur: Math.random() * 8 + 10,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.r * 2,
            height: p.r * 2,
            background: "rgba(134,239,172,0.35)",
          }}
          animate={{ y: [-14, 14, -14], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ── Input Field ───────────────────────────────────────────────────────────────
function InputField({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  icon: Icon,
  suffix,
  autoComplete,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ElementType;
  suffix?: React.ReactNode;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-0.5">
        {label}
      </label>
      <div
        className="relative flex items-center rounded-xl transition-all duration-200"
        style={{
          background: "rgba(0,69,13,0.04)",
          border: `1.5px solid ${focused ? "#00450d" : "rgba(0,69,13,0.15)"}`,
          boxShadow: focused ? "0 0 0 3px rgba(0,69,13,0.08)" : "none",
        }}
      >
        <div className="absolute left-3.5 flex items-center pointer-events-none">
          <Icon
            className="w-4 h-4 transition-colors duration-200"
            style={{ color: focused ? "#00450d" : "#9ca3af" }}
          />
        </div>
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          required
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-10 py-3.5 bg-transparent text-foreground text-sm placeholder-muted-foreground/50 focus:outline-none font-body"
        />
        {suffix && <div className="absolute right-3">{suffix}</div>}
      </div>
    </div>
  );
}

// ── Stats badge ───────────────────────────────────────────────────────────────
function StatBadge({ icon: Icon, label, value, delay }: { icon: React.ElementType; label: string; value: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.09)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(74,222,128,0.2)" }}>
        <Icon className="w-4 h-4 text-green-300" />
      </div>
      <div>
        <div className="text-white font-headline font-bold text-sm leading-none">{value}</div>
        <div className="text-white/60 text-[11px] mt-0.5">{label}</div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message || "Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-background font-body overflow-hidden">

      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative flex-col"
        style={{
          background: "linear-gradient(150deg, #001a05 0%, #003010 40%, #004d16 70%, #006620 100%)",
        }}
      >
        <Particles />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(134,239,172,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(134,239,172,0.05) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* Glow blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,150,50,0.2) 0%, transparent 70%)" }} />

        {/* Right glowing border */}
        <div className="absolute top-0 right-0 bottom-0 w-[1px]"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(74,222,128,0.4), rgba(134,239,172,0.5), rgba(74,222,128,0.4), transparent)" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(74,222,128,0.2)", border: "1px solid rgba(74,222,128,0.4)" }}>
              <Leaf className="w-5 h-5 text-green-300" />
            </div>
            <span className="text-white/90 font-headline font-black text-xs uppercase tracking-[0.2em]">
              SiVartas
            </span>
          </motion.div>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit mb-8"
              style={{
                background: "rgba(74,222,128,0.12)",
                border: "1px solid rgba(74,222,128,0.3)",
              }}
            >
              <span className="text-green-300 text-[11px] font-semibold uppercase tracking-widest">
                Dinas Pertanian Aceh Utara
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-headline font-black leading-[1.1] tracking-tight"
              style={{ fontSize: "clamp(2.5rem, 4vw, 3.8rem)", color: "#f0fff4" }}
            >
              Sistem{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #4ade80 0%, #86efac 50%, #bbf7d0 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Rekomendasi
              </span>
              <br />
              Varietas Unggulan
              <br />
              Hortikultura
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-6 text-base leading-relaxed max-w-md"
              style={{ color: "rgba(187,247,208,0.7)" }}
            >
              Meningkatkan ketahanan pangan melalui inovasi data dan pemilihan varietas unggul
              bagi petani Aceh Utara.
            </motion.p>

            {/* Stats row */}
            <div className="mt-12 grid grid-cols-3 gap-3">
              <StatBadge icon={Sprout} value="120+" label="Varietas" delay={0.6} />
              <StatBadge icon={MapPin} value="27" label="Kecamatan" delay={0.7} />
              <StatBadge icon={BarChart3} value="98%" label="Akurasi" delay={0.8} />
            </div>
          </div>

          {/* Footer text */}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative bg-background">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0,69,13,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, var(--background) 100%)" }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-headline font-black text-sm uppercase tracking-widest text-foreground">SiVartas</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="font-headline font-black text-3xl text-foreground tracking-tight">Selamat Datang</h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-6 p-4 rounded-xl flex items-start gap-3 text-sm font-medium overflow-hidden"
                style={{
                  background: "rgba(186,26,26,0.08)",
                  border: "1px solid rgba(186,26,26,0.2)",
                  color: "#ba1a1a",
                }}
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <InputField
              id="email"
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={setEmail}
              icon={Mail}
              autoComplete="email"
            />

            <InputField
              id="password"
              label="Kata Sandi"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
              value={password}
              onChange={setPassword}
              icon={Lock}
              autoComplete="current-password"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Ingat saya
                </span>
              </label>
              <Link href="#" className="text-sm font-semibold text-primary hover:underline underline-offset-4">
                Lupa sandi?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="relative w-full py-3.5 rounded-xl font-headline font-bold text-sm text-white flex items-center justify-center gap-2 overflow-hidden transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-1"
              style={{
                background: loading ? "#00450d" : "linear-gradient(135deg, #00450d 0%, #1b6d24 100%)",
                boxShadow: "0 4px 20px rgba(0,69,13,0.35)",
              }}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Login ke Sistem
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-[1px] bg-border" />
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">atau</span>
            <div className="flex-1 h-[1px] bg-border" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/register" className="font-bold text-primary hover:underline underline-offset-4">
              Daftar Sekarang
            </Link>
          </p>

          {/* Footer */}
        </motion.div>
      </div>
    </main>
  );
}
