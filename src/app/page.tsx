"use client";

import Link from "next/link";
import { ArrowRight, Lightbulb, Compass, Sparkles, Shield } from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { useOptionalAuth } from "@/contexts/auth-context";
import { useProjects } from "@/hooks/useFirestore";
import Image from "next/image";
import { DiagonalSplitSection } from "@/components/diagonal-split";

export default function LandingPage() {
  const { user } = useOptionalAuth();
  const { data: projects, loading: projectsLoading } = useProjects();
  const featuredProject = projects?.[0];

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      <PublicNav />

      {/* ═══ HERO SECTION: DIAGONAL VISUALIZER ═══ */}
      <section className="relative z-10 w-full">
        <DiagonalSplitSection />
      </section>

      {/* ═══ ABOUT SECTION ═══ */}
      <section id="about" className="relative z-10 max-w-4xl mx-auto px-6 py-20 sm:py-32">
        <div className="modern-panel p-8 sm:p-12 md:p-16 space-y-12 bg-card/60 backdrop-blur-md border-[#006644]/40">
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#c7d28a] tracking-tight font-oswald uppercase">
              About The Generator
            </h2>
            <p className="text-lg sm:text-xl text-foreground leading-relaxed text-balance">
              The Generator is Babson College's Interdisciplinary AI Lab and entrepreneurship hub. We empower students and associates through workshops, mentorship, and hands-on experiences to transform innovative ideas into successful ventures.
            </p>
          </div>

          <div className="w-full h-px bg-border/50" />

          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#c7d28a] tracking-tight font-oswald uppercase">
              Your Gateway to Entrepreneurship
            </h2>
            <p className="text-lg sm:text-xl text-foreground leading-relaxed text-balance">
              Whether you're a student builder, tech enthusiast, or aspiring entrepreneur, our events provide the perfect environment to learn, connect, and create. From weekly Builder's Days to intensive buildathons, we offer diverse opportunities to develop your skills and launch your ventures.
            </p>
            <p className="text-lg sm:text-xl text-foreground leading-relaxed text-balance mt-4">
              Stay connected with our vibrant community and never miss an opportunity to grow your entrepreneurial journey. Check out our upcoming events and join us in building the future together!
            </p>
          </div>
        </div>

        {/* Decorative bubbles for the content section */}
        <div className="absolute -left-12 top-1/2 w-32 h-32 rounded-full bg-primary/20 blur-2xl -z-10" />
        <div className="absolute -right-8 bottom-1/4 w-48 h-48 rounded-full bg-primary/10 blur-xl -z-10" />
      </section>

      {/* ═══ FEATURED PROJECT SECTION ═══ */}
      {featuredProject && !projectsLoading && (
        <section className="relative z-10 max-w-5xl mx-auto px-6 py-14 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-[#c7d28a] tracking-tight font-oswald uppercase">Featured Build</h2>
            <p className="text-[#c7d28a]/80 mt-4 text-xl font-lora italic">Spotlighting innovation from our community</p>
          </div>

          <Link href={`/projects/${featuredProject.id}`} className="group block text-left">
            <div className="modern-panel overflow-hidden relative group-hover:border-[#c7d28a]/50 transition-colors border-[#006644]/40">
              <div className="relative w-full h-64 sm:h-80 md:h-[450px] bg-muted/30">
                {featuredProject.coverImage ? (
                  <Image
                    src={featuredProject.coverImage}
                    alt={featuredProject.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                    <Compass className="w-16 h-16 text-primary/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-80" />

                <div className="absolute top-6 left-6">
                  <span className="generator-pill generator-pill-dark">
                    {featuredProject.status}
                  </span>
                </div>
              </div>

              <div className="p-8 sm:p-12 relative z-10 bg-card/50 backdrop-blur-sm">
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold font-oswald text-[#c7d28a] mb-4 uppercase tracking-wide">
                  {featuredProject.name}
                </h3>
                <p className="text-base sm:text-lg text-foreground mb-6 max-w-2xl line-clamp-2">
                  {featuredProject.description}
                </p>

                <div className="flex items-center gap-6 text-sm font-medium text-foreground/70">
                  <span className="generator-button generator-button-secondary inline-flex items-center gap-2">
                    Explore Project <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-border" />
                  <span>Team Size: {featuredProject.teamMembers?.length || 0}</span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ═══ CTA SECTION ═══ */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 sm:py-32">
        <div className="modern-panel p-10 sm:p-16 text-center relative overflow-hidden bg-[#006644]/20 backdrop-blur-sm border-[#c7d28a]/30 hover:border-[#c7d28a]/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#c7d28a]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#c7d28a]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold font-oswald text-[#c7d28a] mb-6 uppercase tracking-tight">
              Ready to create?
            </h2>
            <p className="text-xl text-foreground mb-10 max-w-xl mx-auto font-lora italic">
              Join The Generator platform to access the workshop dashboard, submit projects, and connect with fellow builders.
            </p>

            <Link
              href={user ? "/dashboard" : "/login"}
              className="generator-button px-10 py-4 text-lg inline-flex items-center gap-3"
            >
              <Shield className="w-5 h-5" />
              {user ? "Go to Dashboard" : "Sign In & Join"}
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-[#006644]/40 mt-10 bg-[#093b26]/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-32 h-8 sm:w-40 sm:h-9">
              <Image src="/images/logo.png" alt="The Generator" fill className="object-contain object-left" />
            </div>
          </Link>
          <span className="font-bold font-oswald text-xl tracking-wider uppercase text-[#c7d28a]">
            Babson College
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-[#c7d28a]/90 uppercase font-oswald tracking-widest">
            <Link href="/startups" className="generator-link">Startups</Link>
            <Link href="/hall-of-fame" className="generator-link">Hall of Fame</Link>
            <Link href="/faq" className="generator-link">FAQ</Link>
            <Link href={user ? "/dashboard" : "/login"} className="generator-link">{user ? "Dashboard" : "Sign In"}</Link>
          </div>
          <p className="text-sm font-oswald uppercase tracking-widest text-[#c7d28a]/60">© {new Date().getFullYear()} The Generator</p>
        </div>
      </footer>
    </div>
  );
}
