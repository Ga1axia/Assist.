"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import {
  HERO_STATS,
  HERO_GALLERY_BUSINESSES,
  type HeroGalleryBusiness,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type HeroBusinessGalleryProps = {
  flipActive?: boolean;
};

/**
 * Center 3×3 only (rows 2–4, cols 2–4):
 *  6  7  8
 * 11 12 13
 * 16 17 18
 *
 * Placement is intentionally asymmetric — not a cross or grid of words.
 */
const FLIPS: {
  index: number;
  delayMs: number;
  kind: "word" | "cta" | "stat" | "line";
  word?: string;
  line?: string;
  asHeading?: boolean;
  statIndex?: number;
}[] = [
  { index: 6, delayMs: 40, kind: "line", line: "Babson", asHeading: true },
  { index: 8, delayMs: 110, kind: "word", word: "Live" },
  { index: 12, delayMs: 180, kind: "word", word: "Learn" },
  { index: 13, delayMs: 250, kind: "cta" },
  { index: 16, delayMs: 320, kind: "stat", statIndex: 0 },
  { index: 18, delayMs: 390, kind: "word", word: "Launch" },
  { index: 17, delayMs: 460, kind: "stat", statIndex: 2 },
];

const OCCUPIED = new Set(FLIPS.map((f) => f.index));

function GalleryLogo({ biz }: { biz: HeroGalleryBusiness }) {
  const [logoFailed, setLogoFailed] = useState(false);

  if (logoFailed) {
    return <div className="hero-gallery__logo-fallback">{biz.fallbackInitials}</div>;
  }

  return (
    <Image
      src={biz.logo}
      alt={`${biz.name} logo`}
      width={220}
      height={88}
      className="hero-gallery__logo-img object-contain"
      unoptimized
      priority
      onError={() => setLogoFailed(true)}
    />
  );
}

function GalleryFace({ biz, priority }: { biz: HeroGalleryBusiness; priority?: boolean }) {
  return (
    <>
      <Image
        src={biz.image}
        alt=""
        fill
        sizes="20vw"
        className="hero-gallery__photo object-cover"
        unoptimized
        priority={priority}
      />
      <div className="hero-gallery__photo-scrim" aria-hidden />
      <div className="hero-gallery__logo-layer">
        <div className="hero-gallery__logo-wrap">
          <GalleryLogo biz={biz} />
        </div>
      </div>
    </>
  );
}

function PhotoCell({
  biz,
  style,
  priority,
}: {
  biz: HeroGalleryBusiness;
  style: CSSProperties;
  priority?: boolean;
}) {
  return (
    <div className="hero-gallery__cell group" style={style}>
      <GalleryFace biz={biz} priority={priority} />
      <div className="hero-gallery__name absolute bottom-0 left-0 right-0 px-2 py-2 bg-gradient-to-t from-black/55 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-white text-[10px] sm:text-xs font-semibold truncate">{biz.name}</p>
      </div>
    </div>
  );
}

function FlipTile({
  flipped,
  delayMs,
  className,
  style,
  front,
  back,
}: {
  flipped: boolean;
  delayMs: number;
  className?: string;
  style?: CSSProperties;
  front: ReactNode;
  back: ReactNode;
}) {
  return (
    <div
      className={cn("hero-flip", flipped && "hero-flip--flipped", className)}
      style={style}
    >
      <div
        className="hero-flip__inner"
        style={{ transitionDelay: flipped ? `${delayMs}ms` : "0ms" }}
      >
        <div className="hero-flip__face hero-flip__face--front">{front}</div>
        <div className="hero-flip__face hero-flip__face--back">{back}</div>
      </div>
    </div>
  );
}

function FlipBack({ flip }: { flip: (typeof FLIPS)[number] }) {
  if (flip.kind === "word" && flip.word) {
    return (
      <div className="hero-flip__glass hero-flip__glass--word">
        <p className="hero-flip__word">{flip.word}</p>
      </div>
    );
  }

  if (flip.kind === "line" && flip.line) {
    const Tag = flip.asHeading ? "h1" : "p";
    return (
      <div className="hero-flip__glass hero-flip__glass--line">
        <Tag className="hero-flip__line">{flip.line}</Tag>
      </div>
    );
  }

  if (flip.kind === "cta") {
    return (
      <div className="hero-flip__glass hero-flip__glass--cta">
        <Link href="/our-story" className="etower-btn etower-btn--primary hero-flip__cta-btn">
          Story
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const stat = HERO_STATS[flip.statIndex ?? 0];
  return (
    <div className="hero-flip__glass hero-flip__glass--stat">
      <strong>{stat.value}</strong>
      <span>{stat.label}</span>
    </div>
  );
}

export function HeroBusinessGallery({ flipActive = false }: HeroBusinessGalleryProps) {
  const fronts = HERO_GALLERY_BUSINESSES.slice(0, FLIPS.length);
  const mosaic = HERO_GALLERY_BUSINESSES.slice(FLIPS.length);
  let m = 0;

  const photoCells = Array.from({ length: 25 }, (_, i) => {
    if (OCCUPIED.has(i)) return null;
    const col = (i % 5) + 1;
    const row = Math.floor(i / 5) + 1;
    const biz = mosaic[m++ % mosaic.length];
    return (
      <PhotoCell
        key={`${biz.id}-${i}`}
        biz={biz}
        priority={i < 8}
        style={{ gridColumn: col, gridRow: row }}
      />
    );
  });

  return (
    <div className="hero-gallery">
      <p className="sr-only">
        eTower at Babson — live, learn, and launch with Boston&apos;s next entrepreneurs.
      </p>
      {photoCells}
      {FLIPS.map((flip, i) => {
        const col = (flip.index % 5) + 1;
        const row = Math.floor(flip.index / 5) + 1;
        return (
          <FlipTile
            key={flip.index}
            className={`hero-flip--${flip.kind}`}
            flipped={flipActive}
            delayMs={flip.delayMs}
            style={{ gridColumn: col, gridRow: row }}
            front={<GalleryFace biz={fronts[i]} priority={i < 3} />}
            back={<FlipBack flip={flip} />}
          />
        );
      })}
    </div>
  );
}
