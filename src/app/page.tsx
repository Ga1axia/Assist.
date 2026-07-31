"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Instagram,
  Users,
  Lightbulb,
  Network,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { EtowerColumnIntro } from "@/components/etower-column-intro";
import { EtowerNav } from "@/components/etower-nav";
import { EtowerFooter } from "@/components/etower-footer";
import { HeroBusinessGallery } from "@/components/hero-business-gallery";
import { EtowerOutletsSection } from "@/components/etower-outlets-section";
import { FadeIn } from "@/components/fade-in";
import { cn } from "@/lib/utils";
import {
  ETOWER,
  IMPACT_METRICS,
  FEATURED_STARTUPS,
  TESTIMONIALS,
  JOIN_PILLARS,
  SOCIAL_POSTS,
} from "@/lib/demo-data";

const PILLAR_ICONS = [Users, Lightbulb, Network, TrendingUp];
const MARQUEE_ITEMS = [
  "250+ Alumni Network",
  "$3B+ in Valuations",
  "100+ Startups Founded",
  "21 Active Residents",
  "Est. 2001",
  "Babson College",
];
const HERO_TEXT_DELAY_MS = 1600;

export default function LandingPage() {
  const [introDone, setIntroDone] = useState(false);
  const [heroTextVisible, setHeroTextVisible] = useState(false);
  const handleIntroComplete = useCallback(() => {
    setIntroDone(true);
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!introDone) return;
    const timer = window.setTimeout(() => setHeroTextVisible(true), HERO_TEXT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [introDone]);

  const featuredQuote = TESTIMONIALS[0];
  const gridQuotes = TESTIMONIALS.slice(1);

  return (
    <div className={cn("etower-page min-h-screen", introDone && "etower-page--ready")}>
      {!introDone && <EtowerColumnIntro onComplete={handleIntroComplete} />}

      <div className={cn("etower-page__main", introDone && "etower-page__main--visible")}>
        <EtowerNav />

        {/* Hero — gallery tiles flip to glassy content */}
        <section id="top" className="etower-hero-gallery-wrap relative scroll-mt-0">
          <HeroBusinessGallery flipActive={heroTextVisible} />
        </section>

        {/* Marquee */}
        <div className="etower-marquee" aria-hidden>
          <div className="etower-marquee__track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i}>
                <strong>·</strong> {item}
              </span>
            ))}
          </div>
        </div>

        {/* Our Impact */}
        <section id="impact" className="etower-impact py-24 px-4 sm:px-6 scroll-mt-20">
          <div className="relative max-w-6xl mx-auto">
            <FadeIn>
              <div className="text-center mb-16 max-w-3xl mx-auto">
                <p className="text-sm font-semibold uppercase tracking-widest etower-section-label mb-3">
                  Our Impact
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#14261A]">
                  Billions in value across industries
                </h2>
                <p className="mt-4 text-[rgba(20,38,26,0.62)] leading-relaxed">
                  eTower has built one of the most successful entrepreneurship communities in
                  Boston, with alumni creating lasting impact worldwide.
                </p>
              </div>
            </FadeIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {IMPACT_METRICS.map((m, i) => (
                <FadeIn key={m.label} delay={i * 80}>
                  <div className="etower-impact-card h-full">
                    <div className="etower-stat-value">{m.value}</div>
                    <h3 className="mt-4 font-bold text-[#14261A]">{m.label}</h3>
                    <p className="mt-2 text-sm text-[rgba(20,38,26,0.55)]">{m.description}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Startups */}
        <section className="py-24 px-4 sm:px-6 bg-[#F3F6F4]">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
                <div>
                  <p className="etower-section-label mb-3">Featured Startups</p>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#0A111F]">
                    Ventures from our community
                  </h2>
                  <p className="mt-3 text-[rgba(10,17,31,0.6)] max-w-xl leading-relaxed">
                    Real companies founded by eTower residents and alumni — building from Babson outward.
                  </p>
                </div>
                <Link
                  href="/startups"
                  className="etower-btn etower-btn--outline px-5 py-2.5 text-sm shrink-0"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-6">
              {FEATURED_STARTUPS.map((s, i) => (
                <FadeIn key={s.id} delay={i * 90}>
                  <article className="etower-startup-card p-7 flex flex-col h-full">
                    <div className="h-14 flex items-center mb-5">
                      <Image
                        src={s.logo}
                        alt={`${s.name} logo`}
                        width={120}
                        height={48}
                        className="max-h-12 w-auto object-contain"
                        unoptimized
                      />
                    </div>
                    <span className="etower-startup-badge mb-3 w-fit">{s.category}</span>
                    <h3 className="text-xl font-bold text-[#0A111F]">{s.name}</h3>
                    <p className="mt-3 text-sm text-[rgba(10,17,31,0.6)] flex-1 leading-relaxed">
                      {s.overview}
                    </p>
                    <p className="mt-5 text-sm border-t border-[rgba(90,173,74,0.22)] pt-4 text-[rgba(10,17,31,0.6)]">
                      <span className="font-semibold text-[#0A111F]">Founded by</span> {s.founder}
                    </p>
                    <Link
                      href="/startups"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3D8A35]"
                    >
                      Explore
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* eTower Outlets */}
        <EtowerOutletsSection />

        {/* Testimonials — light */}
        <section className="py-24 px-4 sm:px-6 border-t border-[rgba(90,173,74,0.22)]">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <div className="text-center mb-14">
                <p className="etower-section-label mb-3">What Our Community Says</p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0A111F]">
                  Hear from residents and alumni
                </h2>
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <blockquote className="etower-testimonial-featured mb-8 relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full etower-gradient flex items-center justify-center font-bold text-white">
                    {featuredQuote.initials}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-[#0A111F]">{featuredQuote.name}</p>
                    <p className="text-sm text-[rgba(10,17,31,0.6)]">{featuredQuote.role}</p>
                    <p className="text-sm text-[#3D8A35] font-medium">{featuredQuote.company}</p>
                  </div>
                </div>
                <p className="text-lg sm:text-xl leading-relaxed text-[rgba(10,17,31,0.8)] max-w-3xl relative z-10">
                  &ldquo;{featuredQuote.quote}&rdquo;
                </p>
              </blockquote>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-6">
              {gridQuotes.map((t, i) => (
                <FadeIn key={t.name} delay={150 + i * 80}>
                  <blockquote className="etower-card p-6 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-full etower-gradient flex items-center justify-center font-bold text-xs text-white">
                        {t.initials}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#0A111F]">{t.name}</p>
                        <p className="text-xs text-[rgba(10,17,31,0.6)]">{t.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-[rgba(10,17,31,0.6)] leading-relaxed line-clamp-4">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </blockquote>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Instagram */}
        <section className="py-24 px-4 sm:px-6 border-t border-[rgba(90,173,74,0.22)] bg-[#F3F6F4]">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <div className="text-center mb-14">
                <p className="etower-section-label mb-3">Follow Our Journey</p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0A111F]">
                  Stay connected on Instagram
                </h2>
              </div>
            </FadeIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SOCIAL_POSTS.map((post, i) => (
                <FadeIn key={i} delay={i * 70}>
                  <div className="etower-social-card etower-card relative">
                    <div className="etower-social-card__img relative">
                      <Image
                        src="/etowerlogo.png"
                        alt=""
                        width={48}
                        height={48}
                        className="opacity-40"
                      />
                      <div className="etower-social-card__overlay">
                        <p className="text-white text-xs line-clamp-2">{post.caption}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-[rgba(10,17,31,0.6)] line-clamp-2">{post.caption}</p>
                      <p className="mt-2 text-xs text-[rgba(10,17,31,0.4)]">
                        {post.likes} likes · {post.comments} comments
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={200}>
              <div className="text-center mt-10">
                <a
                  href={ETOWER.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 etower-btn etower-btn--primary px-8 py-3 text-sm"
                >
                  <Instagram className="w-4 h-4" />
                  Follow {ETOWER.instagram}
                </a>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Join */}
        <section id="join" className="py-24 px-4 sm:px-6 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
                {JOIN_PILLARS.map((pillar, i) => {
                  const Icon = PILLAR_ICONS[i];
                  return (
                    <div key={pillar.title} className="etower-card p-6 text-center group">
                      <div className="w-12 h-12 rounded-xl etower-gradient flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-white">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-[#0A111F]">{pillar.title}</h3>
                      <p className="mt-2 text-sm text-[rgba(10,17,31,0.6)]">{pillar.description}</p>
                    </div>
                  );
                })}
              </div>
            </FadeIn>

            <FadeIn delay={150}>
              <div className="etower-cta-banner">
                <div className="relative z-10">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                    Ready to Join eTower?
                  </h2>
                  <p className="mt-4 text-white/70 max-w-xl mx-auto">
                    Take the next step in your entrepreneurial journey. Applications are reviewed
                    on a rolling basis — early applications encouraged.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/login" className="etower-btn etower-btn--primary px-8 py-3.5 text-sm">
                      Member Login
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a href="#contact" className="etower-btn etower-btn--outline px-8 py-3.5 text-sm">
                      Learn More
                    </a>
                    <a
                      href={ETOWER.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="etower-btn etower-btn--outline px-8 py-3.5 text-sm"
                    >
                      Follow on Instagram
                    </a>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <EtowerFooter />
      </div>
    </div>
  );
}
