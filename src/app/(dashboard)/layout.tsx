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
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="w-8 h-8 border-2 border-[#c7d28a] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-[#c7d28a] animate-pulse">Loading...</span>
            </div>
        );
    }

    if (profile?.status === "pending") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden p-6">
                <div className="relative z-10 rounded-2xl bg-card/60 border border-[#c7d28a]/40 backdrop-blur-sm p-8 sm:p-12 text-center max-w-lg mx-auto mt-20">
                    <Clock className="w-16 h-16 text-[#c7d28a] mb-6 mx-auto" />
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-[#c7d28a] mb-2">Application pending</h1>
                    <p className="text-sm text-foreground/80 mb-8 leading-relaxed">
                        Your profile has been submitted and is being reviewed by the E-Board. You'll get access once your application is approved.
                    </p>

                    <button
                        onClick={async () => {
                            setRefreshing(true);
                            await refreshProfile();
                            setRefreshing(false);
                        }}
                        disabled={refreshing}
                        className="generator-button px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Check status
                    </button>

                    <div className="mt-8 text-[10px] text-[#c7d28a]/80 border border-[#c7d28a]/30 bg-[#006644]/20 px-4 py-2 inline-block rounded-lg">
                        Your application is being reviewed
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden relative">

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

