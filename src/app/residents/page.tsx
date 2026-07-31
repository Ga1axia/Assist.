"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EtowerNav } from "@/components/etower-nav";
import { EtowerFooter } from "@/components/etower-footer";
import { FadeIn } from "@/components/fade-in";
import { CURRENT_RESIDENTS } from "@/lib/demo-data";

export default function ResidentsPage() {
  return (
    <div className="etower-page min-h-screen">
      <EtowerNav />
      <main className="pt-8 pb-0">
        <section className="py-16 px-4 sm:px-6 border-b border-[rgba(90,173,74,0.22)]">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <p className="etower-section-label mb-3">Residents</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A111F]">
                Current eTower residents
              </h1>
              <p className="mt-4 text-[rgba(10,17,31,0.6)] max-w-2xl leading-relaxed">
                Meet the founders living and building together in Babson&apos;s premier
                entrepreneurial living community.
              </p>
            </FadeIn>

            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {CURRENT_RESIDENTS.map((r, i) => (
                <FadeIn key={r.name} delay={i * 50}>
                  <article className="etower-card p-6 h-full">
                    <div className="w-12 h-12 rounded-full etower-gradient flex items-center justify-center font-bold text-sm text-white mb-4">
                      {r.initials}
                    </div>
                    <h2 className="font-bold text-[#0A111F]">{r.name}</h2>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#3D8A35]">
                      {r.role} · Class of {r.year}
                    </p>
                    <p className="mt-3 text-sm text-[rgba(10,17,31,0.6)]">{r.focus}</p>
                  </article>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={300}>
              <div className="mt-14 text-center">
                <Link href="/#join" className="etower-btn etower-btn--primary px-8 py-3 text-sm inline-flex">
                  Join eTower
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <EtowerFooter />
    </div>
  );
}
