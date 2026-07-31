"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EtowerNav } from "@/components/etower-nav";
import { EtowerFooter } from "@/components/etower-footer";
import { FadeIn } from "@/components/fade-in";
import { ALUMNI_SPOTLIGHT, IMPACT_METRICS } from "@/lib/demo-data";
import { useOptionalAuth } from "@/contexts/auth-context";

export default function AlumniPage() {
  const { user } = useOptionalAuth();

  return (
    <div className="etower-page min-h-screen">
      <EtowerNav />
      <main className="pt-8 pb-0">
        <section className="py-16 px-4 sm:px-6 border-b border-[rgba(90,173,74,0.22)]">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <p className="etower-section-label mb-3">Alumni</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A111F]">
                Alumni spotlight
              </h1>
              <p className="mt-4 text-[rgba(10,17,31,0.6)] max-w-2xl leading-relaxed">
                Generations of eTower founders have gone on to build companies, lead teams,
                and mentor the next class of residents.
              </p>
            </FadeIn>

            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              {IMPACT_METRICS.slice(0, 3).map((m, i) => (
                <FadeIn key={m.label} delay={i * 60}>
                  <div className="rounded-2xl bg-[#F3F6F4] border border-[rgba(90,173,74,0.22)] p-5 text-center">
                    <p className="text-2xl font-extrabold tracking-tight text-[#5AAD4A]">{m.value}</p>
                    <p className="mt-1 text-sm font-semibold text-[#0A111F]">{m.label}</p>
                    <p className="mt-1 text-xs text-[rgba(10,17,31,0.55)]">{m.description}</p>
                  </div>
                </FadeIn>
              ))}
            </div>

            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ALUMNI_SPOTLIGHT.map((a, i) => (
                <FadeIn key={a.name} delay={100 + i * 50}>
                  <article className="etower-card p-6 h-full">
                    <div className="w-12 h-12 rounded-full etower-gradient flex items-center justify-center font-bold text-sm text-white mb-4">
                      {a.initials}
                    </div>
                    <h2 className="font-bold text-[#0A111F]">{a.name}</h2>
                    <p className="mt-1 text-sm text-[#3D8A35] font-medium">
                      {a.role} · {a.company}
                    </p>
                    <p className="mt-2 text-xs text-[rgba(10,17,31,0.5)]">{a.era}</p>
                  </article>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={350}>
              <div className="mt-14 etower-card p-8 text-center">
                <p className="text-sm text-[rgba(10,17,31,0.6)] leading-relaxed max-w-xl mx-auto">
                  {user
                    ? "Browse the full member directory and reconnect with classmates in the Network."
                    : "Members can access the full alumni network after signing in."}
                </p>
                <Link
                  href={user ? "/network" : "/login"}
                  className="etower-btn etower-btn--primary mt-6 inline-flex text-sm px-8 py-3"
                >
                  {user ? "Open Network" : "Member Login"}
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
