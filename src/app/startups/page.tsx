"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { EtowerNav } from "@/components/etower-nav";
import { EtowerFooter } from "@/components/etower-footer";
import { FadeIn } from "@/components/fade-in";
import { FEATURED_STARTUPS, COMMUNITY_VENTURES } from "@/lib/demo-data";

export default function StartupsPage() {
  return (
    <div className="etower-page min-h-screen">
      <EtowerNav />
      <main className="pt-8 pb-0">
        <section className="py-16 px-4 sm:px-6 border-b border-[rgba(90,173,74,0.22)]">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <p className="etower-section-label mb-3">Featured startups</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A111F]">
                Ventures from our community
              </h1>
              <p className="mt-4 text-[rgba(10,17,31,0.6)] max-w-2xl leading-relaxed">
                Discover innovative companies founded by eTower residents and alumni.
              </p>
            </FadeIn>

            <div className="mt-14 grid md:grid-cols-3 gap-6">
              {FEATURED_STARTUPS.map((s, i) => (
                <FadeIn key={s.id} delay={i * 100}>
                  <article className="etower-startup-card p-8 flex flex-col h-full">
                    <div className="h-16 flex items-center mb-6">
                      <Image
                        src={s.logo}
                        alt={`${s.name} logo`}
                        width={140}
                        height={56}
                        className="max-h-14 w-auto object-contain"
                        unoptimized
                      />
                    </div>
                    <span className="etower-startup-badge mb-3 w-fit">{s.category}</span>
                    <h2 className="text-xl font-bold text-[#0A111F]">{s.name}</h2>
                    <p className="mt-3 text-sm text-[rgba(10,17,31,0.6)] flex-1 leading-relaxed">
                      {s.overview}
                    </p>
                    <p className="mt-5 text-sm border-t border-[rgba(90,173,74,0.22)] pt-5 text-[rgba(10,17,31,0.6)]">
                      <span className="font-semibold text-[#0A111F]">Founded by</span> {s.founder}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3D8A35]">
                      Visit
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 bg-[#F3F6F4]">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0A111F]">All community ventures</h2>
              <p className="mt-3 text-[rgba(10,17,31,0.6)]">
                Startups built by current and former eTower residents.
              </p>
            </FadeIn>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {COMMUNITY_VENTURES.map((biz, i) => (
                <FadeIn key={biz.id} delay={i * 40}>
                  <div className="etower-card p-5 text-center h-full">
                    <div className="h-14 flex items-center justify-center mb-3 rounded-xl bg-white border border-[rgba(90,173,74,0.18)] px-3">
                      <Image
                        src={biz.logo}
                        alt={biz.name}
                        width={100}
                        height={40}
                        className="max-h-10 w-auto object-contain"
                        unoptimized
                      />
                    </div>
                    <p className="text-sm font-semibold leading-snug text-[#0A111F]">{biz.name}</p>
                    <p className="mt-1 text-xs text-[rgba(10,17,31,0.5)]">{biz.category}</p>
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
