"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  Leaf,
  BarChart3,
  MapPin,
  Sprout,
  ChevronRight,
  Star,
  Shield,
  Zap,
  Users,
  ArrowRight,
  FlaskConical,
  Globe,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

// ─── Utility ────────────────────────────────────────────────────────────────
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Animated Number ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 15 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, motionVal, value]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Grid Background ──────────────────────────────────────────────────────────
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#00450d 1px, transparent 1px), linear-gradient(90deg, #00450d 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
    </div>
  );
}

// ─── Floating Particle ────────────────────────────────────────────────────────
function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 4,
    duration: Math.random() * 6 + 8,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [-20, 20, -20], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Shimmer Button ───────────────────────────────────────────────────────────
function ShimmerButton({ children, className, href }: { children: React.ReactNode; className?: string; href: string }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-headline font-bold text-base overflow-hidden cursor-pointer",
          className
        )}
      >
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
          }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        {children}
      </motion.div>
    </Link>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  desc,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4 }}
      className="group relative p-6 rounded-2xl bg-card border border-border overflow-hidden"
    >
      {/* Animated border gradient on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ boxShadow: "inset 0 0 0 1px rgba(0,69,13,0.4)" }} />

      {/* Glow top-left */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4 group-hover:bg-primary/20 transition-colors duration-300">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-headline font-bold text-lg text-card-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ value, suffix, label, delay = 0 }: { value: number; suffix?: string; label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 text-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <div className="relative">
        <div className="text-4xl font-headline font-black text-primary mb-1">
          <AnimatedNumber value={value} suffix={suffix} />
        </div>
        <div className="text-sm font-label text-muted-foreground font-medium uppercase tracking-wider">{label}</div>
      </div>
    </motion.div>
  );
}

// ─── Marquee Crop ─────────────────────────────────────────────────────────────
const crops = [
  "🌶️ Cabai Merah", "🍅 Tomat", "🥬 Kangkung", "🧅 Bawang Merah",
  "🥦 Brokoli", "🌽 Jagung Manis", "🥕 Wortel", "🍆 Terong",
  "🫑 Paprika", "🌿 Bayam", "🥒 Mentimun", "🧄 Bawang Putih",
];

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="flex overflow-hidden gap-4 py-2">
      <motion.div
        className="flex gap-4 shrink-0"
        animate={{ x: reverse ? ["0%", "50%"] : ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[...crops, ...crops].map((c, i) => (
          <div
            key={i}
            className="flex-shrink-0 px-5 py-2.5 rounded-full bg-card border border-border text-sm font-label font-semibold text-foreground/80 whitespace-nowrap"
          >
            {c}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Bento Card ───────────────────────────────────────────────────────────────
function BentoCard({
  className,
  children,
  delay = 0,
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={cn(
        "relative rounded-2xl bg-card border border-border overflow-hidden p-6",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-headline font-black text-sm uppercase tracking-widest text-foreground">
            SiVartas
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Fitur</a>
          <a href="#stats" className="hover:text-foreground transition-colors">Statistik</a>
          <a href="#about" className="hover:text-foreground transition-colors">Tentang</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Daftar <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background font-body text-foreground overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
        <GridBackground />
        <Particles />

        {/* Glow blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-widest"
        >
          <Star className="w-3 h-3" />
          Dinas Pertanian Aceh Utara
          <Star className="w-3 h-3" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative max-w-4xl text-4xl sm:text-5xl lg:text-7xl font-headline font-black leading-tight tracking-tighter text-foreground"
        >
          Sistem Rekomendasi{" "}
          <span className="relative inline-block">
            <span
              className="relative z-10"
              style={{
                background: "linear-gradient(135deg, #00450d 0%, #1b6d24 50%, #4ade80 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Varietas Unggulan
            </span>
            {/* underline accent */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-primary to-primary/30 origin-left"
            />
          </span>{" "}
          Tanaman Hortikultura
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="relative mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          Platform berbasis data untuk membantu petani dan penyuluh pertanian Kabupaten Aceh Utara
          dalam memilih varietas hortikultura yang optimal sesuai kondisi lahan dan iklim lokal.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <ShimmerButton
            href="/predict"
            className="bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            Coba Gratis <ArrowRight className="w-4 h-4" />
          </ShimmerButton>
          <ShimmerButton
            href="/register"
            className="bg-card border border-border text-foreground"
          >
            Daftar Akun
          </ShimmerButton>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 rounded-full border-2 border-border flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-muted-foreground" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Marquee ── */}
      <section className="py-12 overflow-hidden border-y border-border bg-muted/30">
        <MarqueeRow />
        <MarqueeRow reverse />
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-widest mb-4">
              <Zap className="w-3 h-3" />
              Fitur Unggulan
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-black tracking-tight text-foreground">
              Semua yang Anda butuhkan
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
              Teknologi modern untuk mendukung ketahanan pangan dan produktivitas pertanian hortikultura Aceh Utara.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={FlaskConical}
              title="Rekomendasi Cerdas"
              desc="Algoritma berbasis data menganalisis kondisi tanah, iklim, dan topografi untuk merekomendasikan varietas terbaik."
              delay={0}
            />
            <FeatureCard
              icon={MapPin}
              title="Peta Interaktif"
              desc="Visualisasi sebaran lahan pertanian dan kesesuaian varietas di seluruh wilayah Kabupaten Aceh Utara."
              delay={0.1}
            />
            <FeatureCard
              icon={BarChart3}
              title="Analitik Produksi"
              desc="Dashboard real-time untuk memantau data produksi, produktivitas, dan tren hasil panen tanaman hortikultura."
              delay={0.2}
            />
            <FeatureCard
              icon={Sprout}
              title="Database Varietas"
              desc="Ensiklopedia lengkap varietas tanaman hortikultura dengan karakteristik, keunggulan, dan panduan budidaya."
              delay={0.3}
            />
            <FeatureCard
              icon={Users}
              title="Multi-Pengguna"
              desc="Sistem manajemen akses untuk penyuluh pertanian, petani, dan administrator dinas dengan peran berbeda."
              delay={0.4}
            />
            <FeatureCard
              icon={Shield}
              title="Data Terpercaya"
              desc="Informasi bersumber dari penelitian ilmiah, Balai Pengkajian Teknologi Pertanian, dan data historis dinas."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* ── Bento Grid ── */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Wide card */}
            <BentoCard className="md:col-span-2" delay={0}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-3">
                    <Globe className="w-3 h-3" /> Cakupan Wilayah
                  </div>
                  <h3 className="text-xl font-headline font-bold text-card-foreground">
                    Seluruh Kecamatan Aceh Utara
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mencakup 27 kecamatan dengan data lahan spesifik lokasi
                  </p>
                </div>
              </div>
              {/* Fake map placeholder */}
              <div className="relative h-40 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `radial-gradient(circle, #00450d 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                  }} />
                <motion.div
                  animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="flex flex-col items-center gap-2 text-primary"
                >
                  <MapPin className="w-10 h-10" />
                  <span className="text-xs font-semibold">Aceh Utara, Aceh</span>
                </motion.div>
                {/* Ping circles */}
                {[30, 55, 70].map((left, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-primary/40"
                    style={{ left: `${left}%`, top: `${20 + i * 25}%` }}
                    animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2.5, delay: i * 0.8, repeat: Infinity }}
                  />
                ))}
              </div>
            </BentoCard>

            {/* Tall card */}
            <BentoCard delay={0.15}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-4">
                <TrendingUp className="w-3 h-3" /> Produktivitas
              </div>
              <h3 className="text-xl font-headline font-bold text-card-foreground mb-2">
                Tingkatkan Hasil Panen
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Rekomendasi berbasis AI membantu petani memilih varietas yang tepat untuk kondisi lokal.
              </p>
              {/* Bar chart visual */}
              <div className="flex items-end gap-2 h-28">
                {[40, 60, 45, 80, 70, 95].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-primary to-primary/40"
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                <span>Jan</span><span>Mar</span><span>Mei</span>
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-headline font-black tracking-tight text-foreground">
              Data dalam Angka
            </h2>
            <p className="mt-3 text-muted-foreground">
              Mendukung produktivitas pertanian hortikultura di Aceh Utara
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard value={27} label="Kecamatan Terdaftar" delay={0} />
            <StatCard value={120} suffix="+" label="Varietas Terdata" delay={0.1} />
            <StatCard value={15000} suffix="+" label="Petani Terdampak" delay={0.2} />
            <StatCard value={98} suffix="%" label="Akurasi Rekomendasi" delay={0.3} />
          </div>
        </div>
      </section>

      {/* ── About / CTA ── */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden"
            style={{ background: "linear-gradient(135deg, #001a05 0%, #002e09 40%, #003d0b 100%)" }}
          >
            {/* Animated mesh glow blobs */}
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(74,222,128,0.18) 0%, transparent 70%)" }} />
            <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full blur-3xl pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(0,69,13,0.4) 0%, transparent 70%)" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 rounded-full blur-3xl pointer-events-none"
              style={{ background: "radial-gradient(ellipse, rgba(34,197,94,0.08) 0%, transparent 70%)" }} />

            {/* Subtle grid overlay */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(rgba(74,222,128,1) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,1) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }} />

            {/* Glowing top border */}
            <div className="absolute top-0 left-0 right-0 h-[1px]"
              style={{ background: "linear-gradient(90deg, transparent, rgba(74,222,128,0.6), rgba(134,239,172,0.8), rgba(74,222,128,0.6), transparent)" }} />

            <div className="relative grid md:grid-cols-2 gap-0 items-stretch">
              {/* Left — text panel */}
              <div className="p-10 md:p-14 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-widest mb-7 w-fit"
                  style={{ borderColor: "rgba(74,222,128,0.35)", background: "rgba(74,222,128,0.1)", color: "#86efac" }}
                >
                  <Leaf className="w-3 h-3" /> Tentang Platform
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-headline font-black tracking-tight mb-5 leading-tight"
                  style={{ color: "#f0fff4" }}
                >
                  Inovasi Digital untuk{" "}
                  <span style={{
                    background: "linear-gradient(135deg, #4ade80 0%, #86efac 50%, #bbf7d0 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>
                    Pertanian Hortikultura
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="leading-relaxed text-base"
                  style={{ color: "rgba(187,247,208,0.75)" }}
                >
                  SiVartas dikembangkan oleh Dinas Pertanian dan Tanaman Pangan Kabupaten Aceh Utara
                  sebagai upaya digitalisasi layanan pertanian. Platform ini menggabungkan data ilmiah,
                  kearifan lokal, dan teknologi modern untuk membantu petani membuat keputusan berbasis data.
                </motion.p>

                {/* Separator */}
                <div className="my-8 h-[1px]"
                  style={{ background: "linear-gradient(90deg, rgba(74,222,128,0.3), transparent)" }} />

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <Link
                    href="/predict"
                    className="group relative flex-1 py-3.5 rounded-xl font-headline font-bold text-sm text-center overflow-hidden transition-all duration-300"
                    style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#f0fff4", boxShadow: "0 4px 24px rgba(74,222,128,0.25)" }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Coba Gratis <ArrowRight className="w-4 h-4" />
                    </span>
                    {/* shimmer */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }}
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 py-3.5 rounded-xl font-headline font-bold text-sm text-center transition-all duration-300 hover:bg-white/10"
                    style={{ border: "1px solid rgba(74,222,128,0.3)", color: "#86efac", background: "rgba(74,222,128,0.05)" }}
                  >
                    Daftar Gratis
                  </Link>
                </motion.div>
              </div>

              {/* Vertical divider */}
              <div className="hidden md:block absolute left-1/2 top-12 bottom-12 w-[1px]"
                style={{ background: "linear-gradient(to bottom, transparent, rgba(74,222,128,0.2), rgba(74,222,128,0.3), rgba(74,222,128,0.2), transparent)" }} />

              {/* Right — feature list */}
              <div className="p-10 md:p-14 flex flex-col justify-center gap-4">
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "rgba(134,239,172,0.6)" }}
                >
                  Keunggulan Platform
                </motion.p>

                {[
                  { icon: Sprout, title: "Data Ilmiah Terpercaya", desc: "Varietas dari BPTP dan Kementan RI" },
                  { icon: Shield, title: "Keamanan Berlapis", desc: "Autentikasi dan enkripsi data pengguna" },
                  { icon: BarChart3, title: "Analitik Real-time", desc: "Laporan dan tren produksi terkini" },
                  { icon: MapPin, title: "Pemetaan GIS", desc: "Visualisasi lahan berbasis geospasial" },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    className="group flex items-start gap-4 p-4 rounded-xl transition-all duration-300 cursor-default"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.08)" }}
                    whileHover={{ backgroundColor: "rgba(74,222,128,0.07)", borderColor: "rgba(74,222,128,0.2)" } as never}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.2)" }}>
                      <Icon className="w-5 h-5" style={{ color: "#4ade80" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-headline font-bold text-sm mb-0.5" style={{ color: "#f0fff4" }}>{title}</div>
                      <div className="text-xs leading-relaxed" style={{ color: "rgba(187,247,208,0.6)" }}>{desc}</div>
                    </div>
                    <CheckCircle2 className="flex-shrink-0 w-4 h-4 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#4ade80" }} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Glowing bottom border */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px]"
              style={{ background: "linear-gradient(90deg, transparent, rgba(74,222,128,0.3), transparent)" }} />
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-headline font-black text-sm uppercase tracking-widest text-foreground">SiVartas</div>
              <div className="text-[10px] text-muted-foreground">Sistem Varietas Hortikultura</div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Dinas Pertanian dan Tanaman Pangan Kabupaten Aceh Utara.
            Hak cipta dilindungi.
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Masuk</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Daftar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
