"use client";

import Image from "next/image";
import { ArrowRight, Coffee, Megaphone, Shirt } from "lucide-react";
import { FadeIn } from "@/components/fade-in";
import { ETOWER_OUTLETS } from "@/lib/demo-data";

const CAFE_IMAGE = "/images/outlets/cafe.png";

export function EtowerOutletsSection() {
  const { sectionTitle, clothing, megaphone, cafe } = ETOWER_OUTLETS;

  return (
    <section id="outlets" className="etower-outlets-section py-24 px-4 sm:px-6 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <p className="etower-section-label mb-3">{sectionTitle}</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Spaces built for founders
            </h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          <FadeIn delay={0}>
            <article className="etower-outlet-card etower-outlet-card--soon h-full flex flex-col">
              <div className="etower-outlet-card__icon">
                <Shirt className="w-6 h-6" />
              </div>
              <p className="etower-outlet-card__status">{clothing.status}</p>
              <h3 className="mt-3 text-lg font-bold tracking-wide uppercase">
                {clothing.title}
              </h3>
              <p className="mt-3 text-sm text-white/60 flex-1">
                Official eTower apparel — launching soon for residents and alumni.
              </p>
            </article>
          </FadeIn>

          <FadeIn delay={80}>
            <article
              data-theme="megaphone"
              className="etower-outlet-card etower-outlet-card--megaphone h-full flex flex-col relative overflow-hidden"
            >
              <div className="bg-grid-megaphone absolute inset-0" aria-hidden />
              <div className="relative z-10 flex flex-col h-full">
                <div className="etower-outlet-card__icon bg-[#00ff41] text-[#0a0a0a]">
                  <Megaphone className="w-6 h-6" />
                </div>
                <h3 className="etower-outlet-card__megaphone-title mt-4 text-xl font-bold uppercase">
                  {megaphone.title}
                </h3>
                <p className="etower-outlet-card__megaphone-text mt-4 text-sm leading-relaxed flex-1">
                  {megaphone.description}
                </p>
                <a href={megaphone.href} className="etower-outlet-card__megaphone-btn mt-6 w-fit">
                  {megaphone.cta}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </article>
          </FadeIn>

          <FadeIn delay={160}>
            <article className="etower-outlet-card etower-outlet-card--cafe h-full flex flex-col relative min-h-[320px] overflow-hidden">
              <div className="relative z-10 flex flex-col h-full pr-[48%]">
                <div
                  className="etower-outlet-card__icon border-2 border-[#2d5f4c] bg-[#fffdf7] text-[#2d5f4c]"
                  style={{ borderRadius: 0 }}
                >
                  <Coffee className="w-6 h-6" />
                </div>
                <h3 className="etower-outlet-card__cafe-title mt-4 text-xl">{cafe.title}</h3>
                <p className="etower-outlet-card__cafe-text mt-4 text-sm leading-relaxed flex-1">
                  {cafe.description}
                </p>
                <a href={cafe.href} className="etower-outlet-card__cafe-btn mt-6 w-fit">
                  {cafe.cta}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              <Image
                src={CAFE_IMAGE}
                alt="Founder working with coffee at eTower café"
                width={240}
                height={240}
                className="etower-outlet-card__cafe-image"
              />
            </article>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
