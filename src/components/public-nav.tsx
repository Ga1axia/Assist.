"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useOptionalAuth } from "@/contexts/auth-context";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";

const PAGES_WITH_NAV_ALWAYS_VISIBLE = ["/startups", "/faq", "/hall-of-fame"];

export function PublicNav() {
    const pathname = usePathname();
    const { user, profile, signOut } = useOptionalAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const alwaysShowNav = pathname ? PAGES_WITH_NAV_ALWAYS_VISIBLE.includes(pathname) : false;
    const navVisible = alwaysShowNav || isScrolled;

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`flex h-14 border-b border-[#006644]/30 fixed top-0 w-full z-[100] transition-all duration-500 ease-in-out ${navVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}`}
        >
            {/* Left: light color (#c7d28a) with logo filling full navbar height */}
            <div className="h-full bg-[#c7d28a] flex items-center shrink-0 pl-8 sm:pl-12">
                <Link href="/" className="h-full flex items-center">
                    <div className="relative h-full w-[200px] sm:w-[240px] ml-2 sm:ml-4 bg-[#006644]">
                        <Image
                            src="/images/logo.png"
                            alt="The Generator — Interdisciplinary AI Lab"
                            fill
                            className="object-contain object-left"
                            priority
                            sizes="240px"
                        />
                    </div>
                </Link>
            </div>

            {/* Right: darker color (#006644) with nav links */}
            <div className="flex-1 min-w-0 bg-[#006644] flex items-center justify-end gap-4 text-white/95 px-4 sm:px-6 relative z-10">
                    <Link href="/startups" className="text-sm font-oswald uppercase tracking-widest font-medium hover:text-[#c7d28a] transition-colors hidden sm:block">
                        Startups
                    </Link>
                    <Link href="/hall-of-fame" className="text-sm font-oswald uppercase tracking-widest font-medium hover:text-[#c7d28a] transition-colors hidden sm:block">
                        Projects
                    </Link>
                    <Link href="/faq" className="text-sm font-oswald uppercase tracking-widest font-medium hover:text-[#c7d28a] transition-colors hidden sm:block">
                        FAQ
                    </Link>

                    <div className="w-px h-6 bg-white/30 hidden sm:block mx-1"></div>

                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1.5 hover:bg-white/20 hover:border-white/30 transition-colors shadow-sm group"
                            >
                                {profile?.photoURL ? (
                                    <img src={profile.photoURL} alt="" className="w-6 h-6 rounded-full object-cover border border-white/30" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:border-[#c7d28a] transition-colors">
                                        <User className="w-3.5 h-3.5 text-white/80 group-hover:text-[#c7d28a]" />
                                    </div>
                                )}
                                <span className="text-xs font-medium hidden sm:inline max-w-[120px] truncate group-hover:text-[#c7d28a] transition-colors mt-0.5">
                                    {profile?.displayName || user.email?.split("@")[0] || "Member"}
                                </span>
                            </button>

                            {showDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                                    <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl bg-card border border-border/50 shadow-lg z-50 overflow-hidden backdrop-blur-md">
                                        <div className="relative z-10 p-2 space-y-1">
                                            <div className="px-3 py-2 border-b border-border/50 mb-2">
                                                <p className="text-xs text-foreground/60">Signed in as</p>
                                                <p className="text-sm font-bold text-foreground truncate">{profile?.email}</p>
                                            </div>
                                            <Link
                                                href="/dashboard"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors text-sm font-medium"
                                            >
                                                <LayoutDashboard className="w-4 h-4 text-primary" />
                                                Dashboard
                                            </Link>
                                            <button
                                                onClick={async () => { await signOut(); setShowDropdown(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors text-destructive text-sm font-medium"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/dashboard"
                            className="px-6 py-2 text-sm text-center font-oswald uppercase tracking-widest font-bold border-2 border-white/80 text-white hover:bg-white/10 transition-colors rounded"
                        >
                            Dashboard
                        </Link>
                    )}
            </div>
        </nav>
    );
}
