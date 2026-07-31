"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Instagram, Menu, X } from "lucide-react";
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
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navVisible = !isLanding || scrolled || isMobile;
  const loginHref = user ? "/dashboard" : "/login";
  const loginLabel = user ? "Dashboard" : "Member Login";

  return (
    <header
      className={cn(
        "etower-nav z-[100] transition-all duration-300 ease-out",
        isLanding
          ? cn(
              "fixed top-0 left-0 right-0",
              navVisible
                ? "translate-y-0 opacity-100 pointer-events-auto"
                : "-translate-y-full opacity-0 pointer-events-none"
            )
          : "sticky top-0"
      )}
      aria-hidden={isLanding && !navVisible}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 lg:h-20 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMenuOpen(false)}>
          <Image
            src={ETOWER_LOGO_NAV}
            alt="eTower"
            width={270}
            height={72}
            className="etower-nav__logo h-9 sm:h-11 lg:h-[4.5rem] w-auto object-contain"
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
                tabIndex={isLanding && !navVisible ? -1 : undefined}
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
            tabIndex={isLanding && !navVisible ? -1 : undefined}
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </a>
          <Link
            href={loginHref}
            className="hidden sm:inline-flex etower-btn etower-btn--primary text-sm px-4 py-2"
            tabIndex={isLanding && !navVisible ? -1 : undefined}
          >
            {loginLabel}
          </Link>
          <button
            type="button"
            className="etower-nav__menu-btn lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="etower-mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
            tabIndex={isLanding && !navVisible ? -1 : undefined}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div
        id="etower-mobile-menu"
        className={cn("etower-nav__drawer lg:hidden", menuOpen && "etower-nav__drawer--open")}
        hidden={!menuOpen}
      >
        <nav className="etower-nav__drawer-nav">
          {NAV_LINKS.map((link) => {
            const isPage = link.href.startsWith("/") && !link.href.includes("#");
            const active = isPage && pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "etower-nav__drawer-link",
                  active && "etower-nav__drawer-link--active"
                )}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="etower-nav__drawer-actions">
          <a
            href={ETOWER.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="etower-btn etower-btn--outline w-full justify-center"
            onClick={() => setMenuOpen(false)}
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </a>
          <Link
            href={loginHref}
            className="etower-btn etower-btn--primary w-full justify-center"
            onClick={() => setMenuOpen(false)}
          >
            {loginLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
