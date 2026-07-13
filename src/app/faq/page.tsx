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
import { EtowerNav } from "@/components/etower-nav";
import { EtowerFooter } from "@/components/etower-footer";
import { FadeIn } from "@/components/fade-in";
import { useOptionalAuth } from "@/contexts/auth-context";
import Link from "next/link";

export default function FAQPage() {
    const { user } = useOptionalAuth();
    const { data: faqs, loading } = useFAQ();
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filteredFAQs = faqs.filter((faq) => {
        if (searchQuery && !faq.question.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="etower-page min-h-screen">
            <EtowerNav />

            <main className="pt-8 pb-0">
                <section className="py-16 px-4 sm:px-6">
                    <div className="max-w-4xl mx-auto">
                        <FadeIn>
                            <div className="text-center mb-10 sm:mb-14">
                                <div className="w-14 h-14 rounded-2xl bg-[rgba(0,255,65,0.1)] border border-[rgba(0,255,65,0.28)] flex items-center justify-center text-[#00ff41] mx-auto mb-6">
                                    <HelpCircle className="w-7 h-7" />
                                </div>
                                <p className="etower-section-label mb-3">Help center</p>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                                    Community <span className="text-[#00ff41]">FAQ</span>
                                </h1>
                                <p className="text-white/60 max-w-xl mx-auto leading-relaxed">
                                    Answers to common questions about eTower, membership, and community programs.
                                </p>
                            </div>
                        </FadeIn>

                        <FadeIn delay={60}>
                            <div className="relative mb-8 max-w-2xl mx-auto">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00ff41]/70" />
                                <input
                                    type="text"
                                    placeholder="Search FAQ…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-full bg-[rgba(20,32,51,0.88)] border border-[rgba(0,255,65,0.22)] focus:border-[#00ff41]/70 text-sm transition-colors focus:outline-none"
                                />
                            </div>
                        </FadeIn>

                        {loading && (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="w-8 h-8 animate-spin text-[#00ff41]" />
                                <span className="text-xs text-white/50">Loading FAQ…</span>
                            </div>
                        )}

                        {!loading && (
                            <div className="space-y-3 max-w-3xl mx-auto">
                                {filteredFAQs.map((faq, i) => {
                                    const open = expandedId === faq.id;
                                    return (
                                        <FadeIn key={faq.id} delay={80 + i * 30}>
                                            <div
                                                className={cn(
                                                    "rounded-2xl border bg-[rgba(20,32,51,0.88)] overflow-hidden transition-colors shadow-[0_8px_24px_rgba(0,0,0,0.18)]",
                                                    open
                                                        ? "border-[rgba(0,255,65,0.35)]"
                                                        : "border-[rgba(0,255,65,0.16)] hover:border-[rgba(0,255,65,0.3)]"
                                                )}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedId(open ? null : faq.id)}
                                                    className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4"
                                                >
                                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                                        <span className="text-[10px] font-semibold text-[#00ff41]/80 mt-1 sm:mt-0 flex-shrink-0">
                                                            {String(i + 1).padStart(2, "0")}
                                                        </span>
                                                        <h3 className="font-semibold text-sm tracking-tight leading-relaxed text-white">
                                                            {faq.question}
                                                        </h3>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-[rgba(0,255,65,0.08)] flex items-center justify-center text-[#00ff41] flex-shrink-0 border border-[rgba(0,255,65,0.22)]">
                                                        {open ? (
                                                            <ChevronUp className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                </button>
                                                {open && (
                                                    <div className="px-4 sm:px-5 pb-5">
                                                        <div className="pl-10 sm:pl-12 pr-2 pt-3 border-t border-[rgba(0,255,65,0.12)]">
                                                            <p className="text-sm text-white/65 leading-relaxed">
                                                                {faq.answer}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </FadeIn>
                                    );
                                })}
                            </div>
                        )}

                        {!loading && filteredFAQs.length === 0 && (
                            <div className="text-center py-16 rounded-2xl border border-[rgba(0,255,65,0.16)] bg-[rgba(20,32,51,0.88)] max-w-2xl mx-auto">
                                <HelpCircle className="w-14 h-14 text-white/20 mx-auto mb-4" />
                                <p className="text-sm text-white/50">No FAQ entries match your search.</p>
                            </div>
                        )}

                        <FadeIn delay={120}>
                            <div className="mt-14 max-w-2xl mx-auto text-center p-8 rounded-2xl border border-[rgba(0,255,65,0.25)] bg-[rgba(20,32,51,0.92)] shadow-[0_12px_36px_rgba(0,0,0,0.22)]">
                                <MessageSquare className="w-8 h-8 text-[#00ff41] mx-auto mb-4" />
                                <h3 className="font-bold text-xl sm:text-2xl mb-2 tracking-tight">Still have a question?</h3>
                                <p className="text-sm text-white/55 mb-6 leading-relaxed">
                                    Reach out to the eTower team and we&apos;ll get back to you.
                                </p>
                                <Link
                                    href={user ? "/dashboard" : "/login"}
                                    className="etower-btn etower-btn--primary px-8 py-3 text-xs rounded-full inline-flex"
                                >
                                    Contact us
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>
            </main>

            <EtowerFooter />
        </div>
    );
}
