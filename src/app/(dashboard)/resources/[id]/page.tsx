"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Eye, Calendar, ExternalLink, ThumbsUp, Download } from "lucide-react";

export default function ResourceDetailPage() {
    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">
            <Link
                href="/resources"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Resources
            </Link>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl font-bold">React Hooks Complete Guide</h1>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold uppercase tracking-wider">
                                    Official
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium capitalize">
                                    Intermediate
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> 124 views</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Mar 1, 2026</span>
                                <span>By John Smith</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        Comprehensive guide covering useState, useEffect, useContext, useReducer, useMemo, useCallback,
                        useRef, and custom hooks. Includes practical examples and best practices for building
                        performant React applications.
                    </p>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {["React", "Hooks", "JavaScript"].map((topic) => (
                            <span key={topic} className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                                {topic}
                            </span>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-border hover:bg-secondary transition-all">
                            <ThumbsUp className="w-4 h-4" />
                            Mark Helpful
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-border hover:bg-secondary transition-all">
                            <ExternalLink className="w-4 h-4" />
                            Open External
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Resources */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-semibold mb-4">Related Resources</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    {[
                        { title: "Advanced TypeScript Patterns", views: 156 },
                        { title: "Firebase Auth Setup Tutorial", views: 89 },
                    ].map((resource) => (
                        <div key={resource.title} className="p-3 rounded-xl hover:bg-accent transition-colors">
                            <p className="text-sm font-medium">{resource.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{resource.views} views</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
