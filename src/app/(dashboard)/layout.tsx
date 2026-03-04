"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { needsOnboarding, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && needsOnboarding) {
            router.replace("/onboarding");
        }
    }, [needsOnboarding, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background relative">
            {/* System Grid Background */}
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

