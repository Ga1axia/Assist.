"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Eye, Calendar, ExternalLink, ThumbsUp, Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function ResourceDetailPage() {
    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">
            <Link
                href="/resources"
                className="etower-soft-btn etower-soft-btn etower-soft-btn--ghost px-4 py-2 text-xs inline-flex"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to resources
            </Link>

            <PageHeader
                eyebrow="Resource library"
                title="React Hooks Complete Guide"
                description="Comprehensive guide covering useState, useEffect, useContext, useReducer, useMemo, useCallback, useRef, and custom hooks."
            />

            <div className="etower-soft-card overflow-hidden">
                <div className="p-6 border-b border-[rgba(0,255,65,0.25)]">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 border border-[rgba(0,255,65,0.35)] bg-[rgba(0,255,65,0.08)] flex items-center justify-center text-[#00ff41] shrink-0">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] px-2.5 py-1 border border-[rgba(0,255,65,0.35)] bg-[rgba(0,255,65,0.08)] text-[#00ff41] font-bold tracking-wide">
                                    Official
                                </span>
                                <span className="text-[10px] px-2.5 py-1 border border-warning/40 bg-warning/10 text-warning font-bold tracking-wide">
                                    Intermediate
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-white/55">
                                <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-[#00ff41]" /> 124 views</span>
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#00ff41]" /> Mar 1, 2026</span>
                                <span>By John Smith</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <p className="text-sm text-white/60 leading-relaxed mb-6">
                        Includes practical examples and best practices for building performant React applications.
                    </p>

                    <p className="etower-section-label mb-3">Topics</p>
                    <div className="flex flex-wrap gap-2 mb-8">
                        {["React", "Hooks", "JavaScript"].map((topic) => (
                            <span key={topic} className="text-xs px-3 py-1.5 border border-[rgba(0,255,65,0.25)] bg-[#121c2c] text-white/70 font-medium uppercase tracking-wide">
                                {topic}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button type="button" className="etower-soft-btn etower-btn--primary px-5 py-2.5 text-xs">
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>
                        <button type="button" className="etower-soft-btn etower-soft-btn etower-soft-btn--ghost px-5 py-2.5 text-xs">
                            <ThumbsUp className="w-4 h-4" />
                            Mark helpful
                        </button>
                        <button type="button" className="etower-soft-btn etower-soft-btn etower-soft-btn--ghost px-5 py-2.5 text-xs">
                            <ExternalLink className="w-4 h-4" />
                            Open external
                        </button>
                    </div>
                </div>
            </div>

            <div className="etower-soft-card p-6">
                <p className="etower-section-label mb-4">Related resources</p>
                <div className="grid sm:grid-cols-2 gap-3">
                    {[
                        { title: "Advanced TypeScript Patterns", views: 156 },
                        { title: "Firebase Auth Setup Tutorial", views: 89 },
                    ].map((resource) => (
                        <div key={resource.title} className="p-4 border border-[rgba(0,255,65,0.2)] bg-[#121c2c] hover:border-[#00ff41] transition-colors">
                            <p className="text-sm font-bold">{resource.title}</p>
                            <p className="text-xs text-white/55 mt-1">{resource.views} views</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
