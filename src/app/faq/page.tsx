"use client";

import { useState } from "react";
import { useFAQ } from "@/hooks/useFirestore";
import {
    HelpCircle,
    Search,
    ChevronDown,
    ChevronUp,
    MessageSquare,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicNav } from "@/components/public-nav";
import Link from "next/link";

export default function FAQPage() {
    const { data: faqs, loading } = useFAQ();
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filteredFAQs = faqs.filter((faq) => {
        if (searchQuery && !faq.question.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="min-h-screen relative overflow-hidden">
            <PublicNav />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-10 sm:mb-14 animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-[#c7d28a]/20 border-2 border-[#c7d28a]/40 flex items-center justify-center text-[#c7d28a] mx-auto mb-6 relative animate-float">
                        <HelpCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 text-[#c7d28a]">
                        COMMUNITY <span className="text-white/95">FAQ</span>
                    </h1>
                    <div className="rounded-xl border border-[#006644]/50 bg-card/50 backdrop-blur-sm px-6 py-3 mx-auto max-w-lg">
                        <p className="relative z-10 text-foreground/85 text-sm font-mono tracking-wider">
                            <span className="text-[#c7d28a] font-bold">&gt;</span> Querying knowledge base for common inquiries regarding The Generator operations.
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-6 sm:mb-8 max-w-2xl mx-auto animate-slide-up">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c7d28a]/70" />
                    <input type="text" placeholder="SEARCH FAQ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-card/60 border border-[#006644]/50 focus:border-[#c7d28a]/70 text-sm font-mono uppercase tracking-widest transition-colors focus:outline-none text-foreground" />
                    {searchQuery && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[10px] font-mono text-[#c7d28a] animate-pulse">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#c7d28a]" /> SEARCHING
                        </div>
                    )}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-[#c7d28a]" />
                        <span className="text-xs font-mono text-[#c7d28a] tracking-widest uppercase animate-pulse">Loading...</span>
                    </div>
                )}

                {/* FAQ Accordion */}
                {!loading && (
                    <div className="space-y-4 max-w-3xl mx-auto">
                        {filteredFAQs.map((faq, i) => (
                            <div key={faq.id} className={cn("rounded-xl bg-card/50 border border-[#006644]/40 overflow-hidden transition-all hover:border-[#c7d28a]/40 backdrop-blur-sm")}>
                                <button onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)} className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 relative z-10">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="text-[10px] font-mono text-[#c7d28a]/70 uppercase tracking-widest mt-1 sm:mt-0 flex-shrink-0">Q{i + 1}</div>
                                        <h3 className="font-bold text-sm uppercase tracking-tight leading-relaxed text-foreground">{faq.question}</h3>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-[#c7d28a]/20 flex items-center justify-center text-[#c7d28a] flex-shrink-0 border border-[#c7d28a]/40">
                                        {expandedId === faq.id ? (
                                            <ChevronUp className="w-4 h-4" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4" />
                                        )}
                                    </div>
                                </button>
                                {expandedId === faq.id && (
                                    <div className="px-4 sm:px-5 pb-5 sm:pb-6 relative z-10">
                                        <div className="pl-[88px] pr-4 pt-4 border-t border-[#006644]/30">
                                            <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                                                <span className="text-[#c7d28a] mr-2">&gt;</span>{faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredFAQs.length === 0 && (
                    <div className="text-center py-20 rounded-2xl bg-card/50 border border-[#006644]/40 max-w-2xl mx-auto backdrop-blur-sm">
                        <HelpCircle className="w-14 h-14 text-[#c7d28a]/30 mx-auto mb-4 relative z-10" />
                        <p className="text-xs font-mono text-foreground/70 tracking-widest uppercase relative z-10">NO ENTRIES FOUND MATCHING QUERY PARAMETERS.</p>
                    </div>
                )}

                {/* Ask a Question CTA */}
                <div className="mt-12 sm:mt-16 max-w-2xl mx-auto text-center p-8 rounded-2xl bg-[#006644]/20 border border-[#c7d28a]/40 backdrop-blur-sm relative">
                    <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-[#c7d28a]/50 to-transparent" />

                    <MessageSquare className="w-8 h-8 text-[#c7d28a] mx-auto mb-4 relative z-10" />
                    <h3 className="font-black text-xl sm:text-2xl mb-2 uppercase tracking-tight relative z-10 text-[#c7d28a]">Unresolved Query?</h3>
                    <p className="text-xs font-mono text-foreground/80 mb-6 uppercase tracking-wider relative z-10">Submit a direct inquiry to the E-Board.</p>

                    <Link href="/dashboard" className="generator-button inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold uppercase tracking-widest relative z-10">
                        Contact us
                    </Link>
                </div>
            </div>
        </div>
    );
}
