"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Instagram } from "lucide-react";
import { ETOWER, ETOWER_LOGO_NAV } from "@/lib/demo-data";
import { useOptionalAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/residents", label: "Residents" },
  { href: "/alumni", label: "Alumni" },
  { href: "/our-story", label: "Our Story" },
  { href: "/startups", label: "Startups" },
  { href: "/#join", label: "Join eTower" },
  { href: "/#contact", label: "Contact" },
];

export function EtowerNav() {
  const pathname = usePathname();
  const { user } = useOptionalAuth();
  const isLanding = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isLanding) {
      setScrolled(true);
      return;
    }

    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  return (
    <header
      className={cn(
        "etower-nav z-[100] transition-all duration-300 ease-out",
        isLanding
          ? cn(
              "fixed top-0 left-0 right-0",
              scrolled
                ? "translate-y-0 opacity-100 pointer-events-auto"
                : "-translate-y-full opacity-0 pointer-events-none"
            )
          : "sticky top-0"
      )}
      aria-hidden={isLanding && !scrolled}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src={ETOWER_LOGO_NAV}
            alt="eTower"
            width={270}
            height={72}
            className="etower-nav__logo h-[4.5rem] w-auto object-contain"
            priority
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isPage = link.href.startsWith("/") && !link.href.includes("#");
            const active = isPage && pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "etower-nav__link text-sm font-medium px-3 py-2 transition-colors",
                  active && "etower-nav__link--active font-semibold"
                )}
                tabIndex={isLanding && !scrolled ? -1 : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href={ETOWER.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium etower-nav__link px-3 py-2 transition-colors"
            tabIndex={isLanding && !scrolled ? -1 : undefined}
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </a>
          {user ? (
            <Link
              href="/dashboard"
              className="etower-btn etower-btn--primary text-sm px-4 py-2"
              tabIndex={isLanding && !scrolled ? -1 : undefined}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="etower-btn etower-btn--primary text-sm px-4 py-2"
              tabIndex={isLanding && !scrolled ? -1 : undefined}
            >
              Member Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
