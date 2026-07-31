"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ETOWER_LOGO, INTRO_COLUMN_DIRECTIONS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const INTRO_SPEED = 1.5;
const COLUMN_COUNT = INTRO_COLUMN_DIRECTIONS.length;
const ENTER_MS = Math.round(900 * INTRO_SPEED);
const HOLD_MS = Math.round(1100 * INTRO_SPEED);
const STAGGER_MS = Math.round(55 * INTRO_SPEED);
const EXIT_MS = Math.round(1100 * INTRO_SPEED);
const FADE_MS = Math.round(400 * INTRO_SPEED);
const ENTER_DELAY_MS = Math.round(50 * INTRO_SPEED);

type EtowerColumnIntroProps = {
  onComplete: () => void;
};

function IntroGraphicStrip() {
  return (
    <div className="etower-intro__strip-inner flex h-full w-full items-center justify-center bg-[#14261A]">
      <div className="etower-intro__content flex flex-col items-center gap-4 sm:gap-6 px-4">
        <p className="etower-intro__welcome">Welcome to</p>
        <Image
          src={ETOWER_LOGO}
          alt="eTower"
          width={720}
          height={180}
          className="etower-intro__logo"
          priority
        />
        <p className="etower-intro__tagline text-center whitespace-nowrap">
          Entrepreneurs · Live · Learn · Launch
        </p>
      </div>
    </div>
  );
}

export function EtowerColumnIntro({ onComplete }: EtowerColumnIntroProps) {
  const [entered, setEntered] = useState(false);
  const [separating, setSeparating] = useState(false);
  const [fading, setFading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.body.classList.add("etower-intro-active");
    return () => document.body.classList.remove("etower-intro-active");
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      onComplete();
      setDone(true);
      return;
    }

    const enterTimer = setTimeout(() => setEntered(true), ENTER_DELAY_MS);
    const separateTimer = setTimeout(() => setSeparating(true), ENTER_MS + HOLD_MS);
    const fadeTimer = setTimeout(
      () => setFading(true),
      ENTER_MS + HOLD_MS + EXIT_MS + STAGGER_MS * (COLUMN_COUNT - 1)
    );
    const doneTimer = setTimeout(() => {
      setDone(true);
      onComplete();
    }, ENTER_MS + HOLD_MS + EXIT_MS + STAGGER_MS * (COLUMN_COUNT - 1) + FADE_MS);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(separateTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (done) return null;

  return (
    <div
      className={cn(
        "etower-intro fixed inset-0 z-[200] overflow-hidden pointer-events-none",
        entered && "etower-intro--entered",
        fading && "etower-intro--fading"
      )}
      style={
        {
          "--etower-exit-duration": `${EXIT_MS}ms`,
          "--etower-enter-duration": `${ENTER_MS}ms`,
          "--etower-fade-duration": `${FADE_MS}ms`,
        } as React.CSSProperties
      }
      aria-hidden={separating}
    >
      <div className="relative h-full w-full">
        {INTRO_COLUMN_DIRECTIONS.map((direction, i) => (
          <div
            key={i}
            className={cn(
              "etower-intro__col absolute top-0 bottom-0 overflow-hidden bg-[#14261A]",
              separating &&
                (direction === "up"
                  ? "etower-intro__col-exit-up"
                  : "etower-intro__col-exit-down")
            )}
            style={{
              left: `${i * 12.5}%`,
              width: "12.5%",
              animationDelay: separating ? `${i * STAGGER_MS}ms` : undefined,
            }}
          >
            <div
              className="absolute top-0 h-full"
              style={{
                width: `${COLUMN_COUNT * 100}%`,
                left: `${-i * 100}%`,
              }}
            >
              <IntroGraphicStrip />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
