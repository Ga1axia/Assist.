"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
    LayoutDashboard,
    FolderKanban,
    BookOpen,
    Activity,
    CalendarDays,
    Users2,
    HelpCircle,
    Trophy,
    Shield,
    User,
    LogOut,
    Menu,
    X,
    GraduationCap,
    Rocket,
    CalendarRange,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccessAdminCenter as checkExecAccess } from "@/lib/roles";
import { ETOWER_LOGO } from "@/lib/demo-data";
import { useState, useEffect } from "react";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    adminOnly?: boolean;
    eboardWorkspace?: boolean;
}

const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Projects", href: "/projects", icon: <FolderKanban className="w-4 h-4" /> },
    { label: "Resources", href: "/resources", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Feed", href: "/feed", icon: <Activity className="w-4 h-4" /> },
    { label: "Events", href: "/events", icon: <CalendarDays className="w-4 h-4" /> },
    {
        label: "E-Board",
        href: "/eboard",
        icon: <CalendarRange className="w-4 h-4" />,
        eboardWorkspace: true,
    },
    { label: "Members", href: "/members", icon: <Users2 className="w-4 h-4" /> },
    { label: "Alumni Network", href: "/network", icon: <GraduationCap className="w-4 h-4" /> },
    { label: "Profile", href: "/profile", icon: <User className="w-4 h-4" /> },
    { label: "Admin Tools", href: "/admin", icon: <Shield className="w-4 h-4" />, adminOnly: true },
];

const bottomItems: NavItem[] = [
    { label: "Hall of Fame", href: "/hall-of-fame", icon: <Trophy className="w-4 h-4" /> },
    { label: "Startups Gallery", href: "/startups", icon: <Rocket className="w-4 h-4" /> },
    { label: "Community FAQ", href: "/faq", icon: <HelpCircle className="w-4 h-4" /> },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { profile, signOut } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    const filteredNav = navItems.filter((item) => {
        if (item.adminOnly && !checkExecAccess(profile?.role)) return false;
        if (
            item.eboardWorkspace &&
            (!profile || profile.status === "pending" || profile.status === "rejected")
        )
            return false;
        return true;
    });

    const NavContent = () => (
        <div className="flex flex-col h-full bg-sidebar relative overflow-hidden border-r border-sidebar-border">
            <Link
                href="/"
                className="p-5 flex items-center gap-3 relative z-10 border-b border-sidebar-border hover:bg-sidebar-accent/60 transition-colors no-underline text-current"
            >
                <Image
                    src={ETOWER_LOGO}
                    alt="eTower"
                    width={collapsed ? 28 : 110}
                    height={28}
                    className={cn(
                        "object-contain shrink-0",
                        collapsed ? "h-7 w-7" : "h-7 w-auto"
                    )}
                />
                {!collapsed && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#00ff41]">
                        Portal
                    </span>
                )}
            </Link>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scroll relative z-10">
                {!collapsed && (
                    <div className="px-3 mb-3">
                        <p className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-widest">
                            Menu
                        </p>
                    </div>
                )}
                {filteredNav.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                "group flex items-center gap-3 px-3 py-2.5 text-xs font-semibold tracking-wide transition-all relative rounded-full border",
                                isActive
                                    ? "text-[#0a0a0a] bg-[#00ff41] border-[#00ff41] shadow-[0_6px_16px_rgba(0,255,65,0.2)]"
                                    : "text-sidebar-foreground border-transparent hover:border-[rgba(0,255,65,0.28)] hover:text-[#00ff41] hover:bg-sidebar-accent"
                            )}
                        >
                            <div className={cn("flex items-center justify-center", isActive ? "text-[#0a0a0a]" : "")}>
                                {item.icon}
                            </div>
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto border-t border-sidebar-border relative z-10 pb-10">
                <div className="px-3 py-3 space-y-1">
                    {!collapsed && (
                        <div className="px-3 mb-2 mt-1">
                            <p className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-widest">
                                Explore
                            </p>
                        </div>
                    )}
                    {bottomItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "group flex items-center gap-3 px-3 py-2.5 text-xs font-semibold tracking-wide transition-all relative rounded-full border",
                                    isActive
                                        ? "text-[#0a0a0a] bg-[#00ff41] border-[#00ff41] shadow-[0_6px_16px_rgba(0,255,65,0.2)]"
                                        : "text-sidebar-foreground border-transparent hover:border-[rgba(0,255,65,0.28)] hover:text-[#00ff41] hover:bg-sidebar-accent"
                                )}
                            >
                                <div className={cn("flex items-center justify-center", isActive ? "text-[#0a0a0a]" : "")}>
                                    {item.icon}
                                </div>
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </div>

                <div className="mx-3 mb-3 rounded-2xl border border-[rgba(0,255,65,0.16)] bg-[rgba(18,28,44,0.65)] p-3">
                    <div className="flex items-center gap-3 px-1 py-1.5 mb-2">
                        {profile?.photoURL ? (
                            <div className="w-9 h-9 rounded-full border border-[rgba(0,255,65,0.35)] p-0.5 bg-background flex-shrink-0 overflow-hidden">
                                <img src={profile.photoURL} alt="" className="w-full h-full object-cover rounded-full" />
                            </div>
                        ) : (
                            <div className="w-9 h-9 rounded-full border border-[rgba(0,255,65,0.35)] bg-[rgba(0,255,65,0.08)] flex items-center justify-center flex-shrink-0 text-[#00ff41]">
                                <User className="w-4 h-4" />
                            </div>
                        )}
                        {!collapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-foreground truncate">
                                    {profile?.displayName || "Member"}
                                </p>
                                <p className="text-[10px] font-medium text-[#00ff41]/90 truncate mt-0.5 capitalize">
                                    {profile?.role || "member"}
                                </p>
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-red-300/90 hover:text-red-200 hover:bg-red-500/10 border border-transparent hover:border-red-500/25 rounded-full transition-all"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        {!collapsed && <span>Sign out</span>}
                    </button>
                </div>
            </div>

            <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex items-center justify-center py-2.5 rounded-none bg-sidebar-accent/40 hover:bg-sidebar-accent border-t border-sidebar-border text-sidebar-foreground hover:text-[#00ff41] transition-colors absolute bottom-0 w-full z-20"
            >
                {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
        </div>
    );

    return (
        <>
            <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-3 left-3 z-50 p-2.5 rounded-full border border-[rgba(0,255,65,0.35)] bg-[#1a2332] text-[#00ff41] shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
            >
                <Menu className="w-5 h-5" />
            </button>

            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-[#0a1628]/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <div className="relative w-72 h-full shadow-2xl animate-slide-right overflow-hidden rounded-r-2xl">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full border border-red-500/35 bg-red-500/10 text-red-400 z-50"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <NavContent />
                    </div>
                </div>
            )}

            <aside
                className={cn(
                    "hidden lg:flex flex-col h-[100dvh] sticky top-0 transition-all duration-300",
                    collapsed ? "w-[72px]" : "w-64"
                )}
            >
                <NavContent />
            </aside>

            <style jsx global>{`
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: rgba(0, 255, 65, 0.25); }
                @keyframes slide-right {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-right { animation: slide-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </>
    );
}
