"use client";

import { usePathname } from "next/navigation";

export function BackgroundOverlay() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) return null;

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none bg-[#093b26]/60"
      aria-hidden
    />
  );
}
