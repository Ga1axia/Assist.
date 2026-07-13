"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { EtowerNav } from "@/components/etower-nav";
import { EtowerFooter } from "@/components/etower-footer";
import { FadeIn } from "@/components/fade-in";
import { FEATURED_STARTUPS, HERO_GALLERY_BUSINESSES } from "@/lib/demo-data";

export default function StartupsPage() {
  return (
    <div className="etower-page min-h-screen">
      <EtowerNav />
      <main className="pt-8 pb-0">
        <section className="py-16 px-4 sm:px-6 border-b border-[rgba(0,255,65,0.22)]">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <p className="etower-section-label mb-3">Featured startups</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                Ventures from our community
              </h1>
              <p className="mt-4 text-white/60 max-w-2xl leading-relaxed">
                Discover innovative companies founded by eTower residents and alumni.
              </p>
            </FadeIn>

            <div className="mt-14 grid md:grid-cols-3 gap-6">
              {FEATURED_STARTUPS.map((s, i) => (
                <FadeIn key={s.id} delay={i * 100}>
                  <article className="rounded-2xl border border-[rgba(0,255,65,0.18)] bg-[rgba(20,32,51,0.9)] p-8 flex flex-col h-full shadow-[0_12px_32px_rgba(0,0,0,0.22)] hover:border-[rgba(0,255,65,0.4)] transition-colors">
                    <div className="w-16 h-16 rounded-2xl etower-gradient flex items-center justify-center text-2xl font-bold mb-6">
                      {s.initial}
                    </div>
                    <span className="inline-flex w-fit mb-3 rounded-full border border-[rgba(0,255,65,0.28)] bg-[rgba(0,255,65,0.08)] px-3 py-1 text-[10px] font-semibold text-[#00ff41]">
                      {s.category}
                    </span>
                    <h2 className="text-xl font-bold">{s.name}</h2>
                    <p className="mt-3 text-sm text-white/60 flex-1 leading-relaxed">{s.overview}</p>
                    <p className="mt-5 text-sm border-t border-[rgba(0,255,65,0.14)] pt-5">
                      <span className="font-semibold">Founded by</span>{" "}
                      <span className="text-white/60">{s.founder}</span>
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00ff41]">
                      Visit
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <h2 className="text-2xl sm:text-3xl font-bold">All community ventures</h2>
              <p className="mt-3 text-white/60">Startups built by current and former eTower residents.</p>
            </FadeIn>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {HERO_GALLERY_BUSINESSES.map((biz, i) => (
                <FadeIn key={biz.id} delay={i * 30}>
                  <div className="rounded-2xl border border-[rgba(0,255,65,0.16)] bg-[rgba(20,32,51,0.88)] p-4 text-center shadow-[0_8px_22px_rgba(0,0,0,0.18)] hover:border-[rgba(0,255,65,0.35)] transition-colors">
                    <div className="h-12 flex items-center justify-center mb-3">
                      <Image
                        src={biz.logo}
                        alt={biz.name}
                        width={80}
                        height={32}
                        className="max-h-10 w-auto object-contain brightness-0 invert"
                        unoptimized
                      />
                    </div>
                    <p className="text-xs font-semibold leading-snug">{biz.name}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      </main>
      <EtowerFooter />
    </div>
  );
}
