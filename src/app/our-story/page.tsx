"use client";

import { EtowerNav } from "@/components/etower-nav";
import { EtowerFooter } from "@/components/etower-footer";
import { FadeIn } from "@/components/fade-in";
import { STORY_MILESTONES } from "@/lib/demo-data";

export default function OurStoryPage() {
  return (
    <div className="etower-page min-h-screen">
      <EtowerNav />
      <main className="pt-8 pb-0">
        <section className="py-16 px-4 sm:px-6 border-b border-[rgba(90,173,74,0.22)]">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <p className="etower-section-label mb-3">Our Story</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A111F]">
                20+ years of fostering entrepreneurship
              </h1>
              <p className="mt-6 text-[rgba(10,17,31,0.6)] leading-relaxed">
                As the first and longest-running Living Learning Community at Babson College,
                eTower is celebrating over 20 years of fostering entrepreneurship and innovation.
                A community of students committed to becoming successful entrepreneurs.
              </p>
            </FadeIn>

            <div className="etower-timeline mt-14">
              {STORY_MILESTONES.map((m, i) => (
                <FadeIn key={m.num} delay={i * 100}>
                  <div className="etower-timeline__item">
                    <span className="text-xs font-bold text-[#3D8A35] uppercase tracking-widest">
                      {m.num}
                    </span>
                    <h2 className="mt-1 font-bold text-lg text-[#0A111F]">{m.title}</h2>
                    <p className="mt-2 text-sm text-[rgba(10,17,31,0.6)] leading-relaxed">{m.body}</p>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={400}>
              <div className="mt-14 etower-card p-8 text-center">
                <p className="text-sm text-[rgba(10,17,31,0.6)] leading-relaxed">
                  eTower sees itself as an example of what is possible when like-minded students
                  come together with the intention of growth — and is excited to see what else
                  is possible.
                </p>
                <a href="/#join" className="etower-btn etower-btn--primary mt-6 inline-flex text-sm px-8 py-3">
                  Join Our Community
                </a>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <EtowerFooter />
    </div>
  );
}
