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
  CheckCircle2,
  User,
  ArrowLeft,
  ShieldCheck,
  Sprout,
  Users,
} from "lucide-react";

// ── Particles ─────────────────────────────────────────────────────────────────
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

// ── Benefit item for left panel ───────────────────────────────────────────────
function BenefitItem({ icon: Icon, text, delay }: { icon: React.ElementType; text: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center gap-3"
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.25)" }}>
        <Icon className="w-3.5 h-3.5 text-green-300" />
      </div>
      <span className="text-sm" style={{ color: "rgba(187,247,208,0.8)" }}>{text}</span>
    </motion.div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (authError) throw authError;

      // Create profile for new user with default role 'user'
      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: authData.user.id,
              full_name: fullName,
              role: 'user',
            },
          ]);
        if (profileError) console.error("Error creating profile:", profileError);
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || "Terjadi kesalahan saat pendaftaran.");
    } finally {
      setLoading(false);
    }
  };

  // ── Password strength ──────────────────────────────────────────────────────
  const pwdStrength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabels = ["", "Lemah", "Cukup", "Baik", "Kuat"];
  const strengthColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

  return (
    <main className="min-h-screen flex bg-background font-body overflow-hidden">

      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative flex-col"
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
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,150,50,0.2) 0%, transparent 70%)" }} />

        {/* Right glowing border */}
        <div className="absolute top-0 right-0 bottom-0 w-[1px]"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(74,222,128,0.4), rgba(134,239,172,0.5), rgba(74,222,128,0.4), transparent)" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12 xl:p-14">
          {/* Logo + back */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(74,222,128,0.2)", border: "1px solid rgba(74,222,128,0.4)" }}>
                <Leaf className="w-5 h-5 text-green-300" />
              </div>
              <span className="text-white/90 font-headline font-black text-xs uppercase tracking-[0.2em]">
                SiVartas
              </span>
            </div>
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs font-semibold transition-all px-3 py-1.5 rounded-lg"
              style={{ color: "rgba(134,239,172,0.8)", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali Login
            </Link>
          </motion.div>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit mb-8"
              style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)" }}
            >
              <span className="text-green-300 text-[11px] font-semibold uppercase tracking-widest">
                Buat Akun Baru
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-headline font-black leading-[1.1] tracking-tight"
              style={{ fontSize: "clamp(2rem, 3.5vw, 3.2rem)", color: "#f0fff4" }}
            >
              Gabung &{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #4ade80 0%, #86efac 50%, #bbf7d0 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Ciptakan
              </span>
              <br />
              Ketahanan Pangan
              <br />
              Aceh Utara
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-5 text-sm leading-relaxed max-w-sm"
              style={{ color: "rgba(187,247,208,0.7)" }}
            >
              Daftarkan akun untuk mengakses rekomendasi varietas terbaik sesuai kondisi lahan Anda.
            </motion.p>

            {/* Separator */}
            <div className="my-8 h-[1px] max-w-sm"
              style={{ background: "linear-gradient(90deg, rgba(74,222,128,0.3), transparent)" }} />

            {/* Benefit list */}
            <div className="flex flex-col gap-3.5">
              <BenefitItem icon={Sprout} text="Akses database 120+ varietas unggulan" delay={0.6} />
              <BenefitItem icon={ShieldCheck} text="Data aman dengan enkripsi berlapis" delay={0.7} />
              <BenefitItem icon={Users} text="Terhubung dengan penyuluh & petani lain" delay={0.8} />
            </div>
          </div>

          {/* Footer */}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-start justify-center px-6 py-10 overflow-y-auto relative bg-background">
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
          className="relative w-full max-w-[420px] py-6"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-headline font-black text-sm uppercase tracking-widest text-foreground">SiVartas</span>
            </div>
            <Link href="/login" className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <ArrowLeft className="w-3.5 h-3.5" /> Login
            </Link>
          </div>

          {/* Header */}
          <div className="mb-7">
            <h2 className="font-headline font-black text-3xl text-foreground tracking-tight">Buat Akun</h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              Lengkapi data berikut untuk mendaftar ke sistem
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-5 p-4 rounded-xl flex items-start gap-3 text-sm font-medium overflow-hidden"
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

          {/* Success */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-5 p-5 rounded-xl flex flex-col gap-2"
                style={{
                  background: "rgba(0,69,13,0.07)",
                  border: "1px solid rgba(0,69,13,0.2)",
                }}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-headline font-bold text-primary text-sm">Pendaftaran Berhasil!</span>
                </div>
                <p className="text-xs text-muted-foreground pl-8">
                  Cek email Anda untuk verifikasi. Anda akan diarahkan ke halaman login...
                </p>
                {/* Progress bar */}
                <motion.div
                  className="mx-8 mt-1 h-1 rounded-full bg-primary/20 overflow-hidden"
                >
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "linear" }}
                    className="h-full rounded-full bg-primary"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <InputField
              id="fullName"
              label="Nama Lengkap"
              type="text"
              placeholder="Masukkan nama lengkap"
              value={fullName}
              onChange={setFullName}
              icon={User}
            />

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

            <div className="flex flex-col gap-1.5">
              <InputField
                id="password"
                label="Kata Sandi"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 karakter"
                value={password}
                onChange={setPassword}
                icon={Lock}
                autoComplete="new-password"
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
              {/* Password strength */}
              {password && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-0.5">
                  <div className="flex gap-1.5 mt-1.5 mb-1">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: n <= pwdStrength ? strengthColors[pwdStrength] : "rgba(0,69,13,0.1)" }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium" style={{ color: strengthColors[pwdStrength] }}>
                    Kekuatan: {strengthLabels[pwdStrength]}
                  </span>
                </motion.div>
              )}
            </div>

            <InputField
              id="confirmPassword"
              label="Konfirmasi Sandi"
              type="password"
              placeholder="Ulangi kata sandi"
              value={confirmPassword}
              onChange={setConfirmPassword}
              icon={Lock}
              autoComplete="new-password"
            />

            {/* Password match indicator */}
            {confirmPassword && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-xs font-medium -mt-1"
                style={{ color: password === confirmPassword ? "#16a34a" : "#dc2626" }}
              >
                {password === confirmPassword ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> Kata sandi cocok</>
                ) : (
                  <><AlertCircle className="w-3.5 h-3.5" /> Kata sandi tidak cocok</>
                )}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading || success}
              whileHover={{ scale: loading || success ? 1 : 1.01 }}
              whileTap={{ scale: loading || success ? 1 : 0.98 }}
              className="relative w-full py-3.5 rounded-xl font-headline font-bold text-sm text-white flex items-center justify-center gap-2 overflow-hidden transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              style={{
                background: "linear-gradient(135deg, #00450d 0%, #1b6d24 100%)",
                boxShadow: "0 4px 20px rgba(0,69,13,0.35)",
              }}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : success ? (
                <><CheckCircle2 className="w-4 h-4" /> Pendaftaran Berhasil!</>
              ) : (
                <>Buat Akun <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-[1px] bg-border" />
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">atau</span>
            <div className="flex-1 h-[1px] bg-border" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline underline-offset-4">
              Masuk di Sini
            </Link>
          </p>

          {/* Footer */}
        </motion.div>
      </div>
    </main>
  );
}
