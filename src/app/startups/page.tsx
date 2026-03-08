"use client";

import {
    Rocket,
    ExternalLink,
    Code2,
    Users,
    Calendar,
    Loader2,
    Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicNav } from "@/components/public-nav";
import { useStartups } from "@/hooks/useFirestore";

export default function StartupsGalleryPage() {
    const { data: startups, loading } = useStartups();

    return (
        <div className="min-h-screen relative overflow-hidden">
            <PublicNav />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16 animate-fade-in">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#006644]/50 border border-[#c7d28a]/40 text-[#c7d28a] px-4 py-1.5 text-xs font-mono tracking-widest uppercase mb-6 shadow-sm">
                        <Database className="w-3.5 h-3.5" />
                        The Generator Alumni Startups
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter uppercase text-[#c7d28a]">
                        Startup <span className="text-white/95">Gallery</span>
                    </h1>
                    <div className="mt-6 flex justify-center">
                        <div className="rounded-xl border border-[#006644]/50 bg-card/50 backdrop-blur-sm px-6 py-3">
                            <p className="relative z-10 text-foreground/85 text-sm font-mono tracking-wider">
                                <span className="text-[#c7d28a] font-bold">&gt;</span> Showcasing companies built by The Generator alumni.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-[#c7d28a]" />
                        <span className="text-xs font-mono text-[#c7d28a] tracking-widest uppercase animate-pulse">Loading Startups...</span>
                    </div>
                )}

                {!loading && startups.length === 0 && (
                    <div className="text-center py-20 rounded-2xl bg-card/50 border border-[#006644]/40 max-w-2xl mx-auto backdrop-blur-sm">
                        <Rocket className="w-14 h-14 text-[#c7d28a]/30 mx-auto mb-4 relative z-10" />
                        <p className="text-xs font-mono text-foreground/70 tracking-widest uppercase relative z-10">No startups found in archive.</p>
                    </div>
                )}

                {!loading && startups.length > 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {startups.map((startup, i) => (
                            <div key={startup.id} className={cn("group relative rounded-2xl bg-card/50 border border-[#006644]/40 overflow-hidden transition-all hover:border-[#c7d28a]/50 hover:bg-card/70 backdrop-blur-sm")}>
                                <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-t-[#c7d28a]/20 border-l-[20px] border-l-transparent group-hover:border-t-[#c7d28a]/40 transition-colors z-20" />
                                <div className="h-32 sm:h-40 bg-gradient-to-br from-[#006644]/30 to-transparent flex items-center justify-center border-b border-[#c7d28a]/20 relative z-10">
                                    <div className="w-14 h-14 rounded-xl bg-[#c7d28a]/20 border border-[#c7d28a]/40 flex items-center justify-center text-[#c7d28a] group-hover:scale-110 transition-transform">
                                        <Rocket className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col h-[calc(100%-8rem)] sm:h-[calc(100%-10rem)] relative z-10">
                                    <div className="text-[10px] font-mono text-[#c7d28a]/80 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        <Database className="w-3 h-3" />
                                        EST. {startup.foundedYear}
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 group-hover:text-[#c7d28a] transition-colors tracking-tight uppercase line-clamp-1 text-foreground">{startup.name}</h3>
                                    <p className="text-xs text-muted-foreground font-mono mb-4 flex-grow">{startup.description}</p>

                                    <div className="space-y-4 mt-auto">
                                        <div className="flex items-center text-[10px] font-mono text-muted-foreground uppercase tracking-widest border-t border-[#006644]/30 pt-3">
                                            <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> FOUNDERS: {startup.founders}</span>
                                        </div>
                                        {startup.website && (
                                            <a href={startup.website} target="_blank" rel="noopener noreferrer" className="generator-button-secondary flex items-center justify-center w-full gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest">
                                                <ExternalLink className="w-3 h-3" /> VISIT SITE
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
