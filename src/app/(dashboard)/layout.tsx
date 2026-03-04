"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { Clock, RefreshCw } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { needsOnboarding, loading, profile, refreshProfile } = useAuth();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!loading && needsOnboarding) {
            router.replace("/onboarding");
        }
    }, [needsOnboarding, loading, router]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-mono text-primary uppercase tracking-widest animate-pulse">AUTHENTICATING...</span>
            </div>
        );
    }

    if (profile?.status === "pending") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden p-6">
                <div className="pointer-events-none fixed inset-0 grid-bg opacity-30 z-0" />
                <div className="relative z-10 hud-panel bg-card/40 border border-warning/40 scanlines p-8 sm:p-12 text-center max-w-lg mx-auto mt-20">
                    <Clock className="w-16 h-16 text-warning mb-6 mx-auto" />
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-warning mb-2">APPLICATION PENDING</h1>
                    <p className="text-sm font-mono text-muted-foreground mb-8 leading-relaxed">
                        Your profile has been formulated and is awaiting clearance from the E-Board. You will be granted access to the network once your application is verified.
                    </p>

                    <button
                        onClick={async () => {
                            setRefreshing(true);
                            await refreshProfile();
                            setRefreshing(false);
                        }}
                        disabled={refreshing}
                        className="hud-panel-sm bg-warning/10 border border-warning/30 text-warning px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest hover:bg-warning hover:text-warning-foreground transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        CHECK STATUS
                    </button>

                    <div className="mt-8 text-[10px] font-mono text-warning/80 uppercase tracking-widest border border-warning/20 bg-warning/5 px-4 py-2 inline-block">
                        CLEARANCE LEVEL: UNAUTHORIZED
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background relative">
            {/* Dashboard Grid Background */}
            <div className="pointer-events-none fixed inset-0 grid-bg opacity-30 z-0" />

            <div className="relative z-20 flex h-full">
                <Sidebar />
            </div>

            <main className="flex-1 min-w-0 overflow-y-auto relative z-10">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

