"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { DEMO_MODE } from "@/lib/demo-mode";
import { Clock, RefreshCw } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, needsOnboarding, loading, profile, refreshProfile } = useAuth();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace("/login");
            return;
        }
        if (needsOnboarding) {
            router.replace("/onboarding");
        }
    }, [loading, user, needsOnboarding, router]);

    if (loading || !user) {
        return (
            <div className="etower-app flex flex-col items-center justify-center min-h-screen gap-4 relative">
                <div className="pointer-events-none fixed inset-0 bg-grid-brutalist opacity-70" />
                <div className="relative z-10 w-8 h-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin" />
                <span className="relative z-10 text-[10px] font-bold text-[#00ff41] uppercase tracking-widest animate-pulse">
                    Signing you in…
                </span>
            </div>
        );
    }

    if (profile?.status === "removed") {
        return (
            <div className="etower-app flex flex-col items-center justify-center min-h-screen relative overflow-hidden p-6">
                <div className="pointer-events-none fixed inset-0 bg-grid-brutalist opacity-70" />
                <div className="relative z-10 etower-card border-red-500/40 p-8 sm:p-12 text-center max-w-lg mx-auto">
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-red-400 mb-2">
                        Access revoked
                    </h1>
                    <p className="text-sm text-white/60 mb-2 leading-relaxed">
                        Your membership has been removed. You no longer have access to the eTower
                        management dashboard.
                    </p>
                </div>
            </div>
        );
    }

    if (profile?.status === "pending") {
        return (
            <div className="etower-app flex flex-col items-center justify-center min-h-screen relative overflow-hidden p-6">
                <div className="pointer-events-none fixed inset-0 bg-grid-brutalist opacity-70" />
                <div className="relative z-10 etower-card p-8 sm:p-12 text-center max-w-lg mx-auto">
                    <Clock className="w-14 h-14 text-[#00ff41] mb-6 mx-auto" />
                    <p className="etower-section-label mb-2">Application status</p>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2">
                        Pending review
                    </h1>
                    <p className="text-sm text-white/60 mb-8 leading-relaxed">
                        Your profile is awaiting approval from eTower leadership. You&apos;ll get
                        full dashboard access once you&apos;re verified.
                    </p>

                    <button
                        type="button"
                        onClick={async () => {
                            setRefreshing(true);
                            await refreshProfile();
                            setRefreshing(false);
                        }}
                        disabled={refreshing}
                        className="etower-btn etower-btn--primary px-6 py-3 text-xs mx-auto disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        Check status
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="etower-app flex h-screen overflow-hidden relative">
            <div className="pointer-events-none fixed inset-0 bg-grid-brutalist opacity-50 z-0" />

            <div className="relative z-20 flex h-full">
                <Sidebar />
            </div>

            <main className="flex-1 min-w-0 overflow-y-auto relative z-10">
                {DEMO_MODE ? (
                    <div className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 pt-14 lg:pt-4">
                        <div className="max-w-7xl mx-auto rounded-full border border-[rgba(0,255,65,0.25)] bg-[rgba(0,255,65,0.08)] px-4 py-2 text-center text-xs text-[#00ff41]/90">
                            Demo mode — Firebase is unlinked. Showing sample eTower portal data.
                        </div>
                    </div>
                ) : null}
                <div className={DEMO_MODE ? "max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-4" : "max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8"}>
                    {children}
                </div>
            </main>
        </div>
    );
}
