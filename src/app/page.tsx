"use client";

import Link from "next/link";
import {
  Users,
  FolderKanban,
  BookOpen,
  MessageCircle,
  Trophy,
  ArrowRight,
  Sparkles,
  Terminal,
  Zap,
  Shield,
  ChevronRight,
} from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { useOptionalAuth } from "@/contexts/auth-context";

export default function LandingPage() {
  const { user } = useOptionalAuth();

  const features = [
    { icon: <Users className="w-5 h-5" />, title: "MEMBER_MGMT", subtitle: "Member Management", description: "Track attendance, manage roles, and monitor engagement metrics for all club members." },
    { icon: <FolderKanban className="w-5 h-5" />, title: "PROJECT_SYS", subtitle: "Project Ecosystem", description: "Dual-view dashboards for internal teams and external clients. Full milestone tracking." },
    { icon: <BookOpen className="w-5 h-5" />, title: "RESOURCE_LIB", subtitle: "Resource Library", description: "Curated guides and community resources with search, filters, and approval workflows." },
    { icon: <MessageCircle className="w-5 h-5" />, title: "WA_AUTOMATE", subtitle: "WhatsApp Automation", description: "Automated broadcasts, deadline alerts, and check-ins via WhatsApp Business API." },
    { icon: <Sparkles className="w-5 h-5" />, title: "AI_CASESTUDY", subtitle: "AI Case Studies", description: "Synthesize team reflections into professional case studies using AI." },
    { icon: <Trophy className="w-5 h-5" />, title: "HALL_OF_FAME", subtitle: "Hall of Fame", description: "Public portfolio showcasing completed projects with live demos and case studies." },
  ];

  const stats = [
    { label: "ACTIVE_USERS", value: "30+", unit: "members" },
    { label: "PROJECTS_SHIPPED", value: "12", unit: "deployed" },
    { label: "RESOURCES_DB", value: "50+", unit: "indexed" },
    { label: "PRIMARY_CLIENT", value: "SHF", unit: "Seven Hills" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Grid Background */}
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-60" />

      {/* Neon glow orbs */}
      <div className="pointer-events-none fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
        style={{ background: "radial-gradient(circle, #cbf702, transparent)" }}
      />
      <div className="pointer-events-none fixed bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-10"
        style={{ background: "radial-gradient(circle, #cbf702, transparent)" }}
      />

      <PublicNav />

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-10 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20">
        <div className="text-center">
          {/* System Status Badge */}
          <div className="inline-flex items-center gap-2.5 hud-panel-sm bg-card/80 border border-primary/30 text-primary px-4 py-2 text-xs font-mono tracking-wider mb-8 animate-fade-in animate-border-pulse">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="uppercase">Platform Online</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">Babson CODE</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] animate-slide-up">
            <span className="block text-foreground">BUILD. SHIP.</span>
            <span className="gradient-text-cyber animate-flicker">IMPACT.</span>
          </h1>

          {/* Subtitle in HUD panel */}
          <div className="mt-8 max-w-2xl mx-auto animate-slide-up">
            <div className="relative hud-panel bg-card/60 border border-border/50 px-6 py-4 scanlines">
              <p className="relative z-10 text-sm sm:text-base text-muted-foreground font-mono leading-relaxed">
                <span className="text-primary font-bold">&gt;</span> CODE OS is the management platform for our coding club — manage projects, resources, and member engagement all in one place.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="group relative w-full sm:w-auto hud-panel bg-primary text-primary-foreground px-8 py-3.5 text-sm font-bold uppercase tracking-wider hover:brightness-110 transition-all glow-border-strong flex items-center justify-center gap-3"
            >
              <Terminal className="w-4 h-4" />
              {user ? "ENTER DASHBOARD" : "GET STARTED"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link
              href="/hall-of-fame"
              className="w-full sm:w-auto hud-panel-alt border border-border/60 px-8 py-3.5 text-sm font-bold uppercase tracking-wider hover:border-primary/50 hover:bg-primary/5 transition-all text-center flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              VIEW PROJECTS
            </Link>
          </div>
        </div>

        {/* ═══ STATS BAR ═══ */}
        <div className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
          {stats.map((stat, i) => (
            <div key={stat.label} className={`relative hud-corners bg-card/70 border border-border/50 p-4 sm:p-5 text-center transition-all hover:border-primary/40 hover:bg-card/90 ${i % 2 === 0 ? 'hud-panel-sm' : 'hud-panel-alt'}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="text-[10px] font-mono text-primary/70 tracking-widest uppercase mb-1">{stat.label}</div>
              <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{stat.value}</div>
              <div className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase mt-0.5">{stat.unit}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES SECTION ═══ */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-primary tracking-widest uppercase mb-4">
            <span className="w-8 h-px bg-primary/50" />
            PLATFORM FEATURES
            <span className="w-8 h-px bg-primary/50" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
            Everything your club <span className="gradient-text-cyber">needs</span>
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base max-w-xl mx-auto font-mono">
            From governance to project delivery, CODE OS handles it all.
          </p>
        </div>

        {/* Feature Grid — asymmetric */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group relative bg-card/60 border border-border/40 p-5 sm:p-6 transition-all duration-300 hover:border-primary/50 hover:bg-card/90 scanlines overflow-hidden ${i % 3 === 0 ? 'hud-panel' : i % 3 === 1 ? 'hud-panel-alt' : 'hud-panel-sm'}`}
            >
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-t-primary/20 border-l-[24px] border-l-transparent group-hover:border-t-primary/50 transition-colors" />

              <div className="relative z-10">
                {/* Module ID */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 hud-panel-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    {f.icon}
                  </div>
                  <span className="text-[10px] font-mono text-primary/60 tracking-widest">{f.title}</span>
                </div>

                <h3 className="font-bold text-sm sm:text-base mb-1.5 tracking-tight">{f.subtitle}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{f.description}</p>

                {/* Module link indicator */}
                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-mono text-primary/50 uppercase tracking-wider group-hover:text-primary transition-colors">
                  <ChevronRight className="w-3 h-3" />
                  VIEW MODULE
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="relative hud-panel bg-card/70 border border-primary/20 p-8 sm:p-12 md:p-16 text-center overflow-hidden scanlines noise animate-border-pulse">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-primary tracking-widest uppercase mb-5">
              <Zap className="w-3.5 h-3.5" />
              AUTHORIZATION REQUIRED
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
              Ready to <span className="gradient-text-cyber">join</span>?
            </h2>
            <p className="text-muted-foreground mt-3 text-sm sm:text-base max-w-xl mx-auto font-mono">
              Sign in with your credentials to access the CODE OS dashboard.
            </p>

            <Link
              href={user ? "/dashboard" : "/login"}
              className="mt-8 inline-flex items-center gap-3 hud-panel bg-primary text-primary-foreground px-8 py-3.5 text-sm font-bold uppercase tracking-wider hover:brightness-110 transition-all glow-border-strong"
            >
              <Shield className="w-4 h-4" />
              {user ? "ENTER DASHBOARD" : "GET STARTED"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-border/40 mt-6 sm:mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono font-bold text-sm tracking-widest uppercase">
            CODE<span className="text-primary">_</span>OS
          </span>
          <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono text-muted-foreground uppercase tracking-wider">
            <Link href="/hall-of-fame" className="hover:text-primary transition-colors">Hall of Fame</Link>
            <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <Link href={user ? "/dashboard" : "/login"} className="hover:text-primary transition-colors">{user ? "Dashboard" : "Sign In"}</Link>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground tracking-wider">© {new Date().getFullYear()} BABSON CODE</p>
        </div>
      </footer>
    </div>
  );
}
