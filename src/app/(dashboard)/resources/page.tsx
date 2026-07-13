"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useResources } from "@/hooks/useFirestore";
import { Search, Plus, FileText, Video, Link as LinkIcon, BookOpen, ChevronDown, Upload, X, Eye, Calendar, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";

const typeIcons: Record<string, React.ReactNode> = {
    guide: <FileText className="w-5 h-5" />,
    tutorial: <BookOpen className="w-5 h-5" />,
    video: <Video className="w-5 h-5" />,
    document: <FileText className="w-5 h-5" />,
    link: <LinkIcon className="w-5 h-5" />,
};

export default function ResourcesPage() {
    const { profile } = useAuth();
    const { data: resources, loading, createResource } = useResources(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [tierFilter, setTierFilter] = useState("all");
    const [phaseFilter, setPhaseFilter] = useState("all");
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newResource, setNewResource] = useState({ title: "", description: "", phase: "beginner", type: "guide", tier: "community", topics: "", fileUrl: "" });

    const filteredResources = resources.filter((r) => {
        if (tierFilter !== "all" && r.tier !== tierFilter) return false;
        if (phaseFilter !== "all" && r.phase !== phaseFilter) return false;
        if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const handleUpload = async () => {
        if (!newResource.title.trim()) return;
        await createResource({
            title: newResource.title,
            description: newResource.description,
            phase: newResource.phase,
            type: newResource.type,
            tier: newResource.tier,
            topics: newResource.topics ? newResource.topics.split(",").map((t) => t.trim()).filter(Boolean) : [],
            fileUrl: newResource.fileUrl,
            uploadedBy: profile?.displayName || "Unknown",
            uploadedById: profile?.uid || "",
        });
        setNewResource({ title: "", description: "", phase: "beginner", type: "guide", tier: "community", topics: "", fileUrl: "" });
        setShowUploadModal(false);
    };

    return (
        <div className="space-y-6 animate-fade-in relative z-10">
            <PageHeader
                eyebrow="Resources"
                title="Resource library"
                description="Guides, tutorials, and documents shared by members and the e-board."
                actions={
                    profile?.role !== "alumni" && profile?.residency !== "alumni" ? (
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="etower-soft-btn etower-btn--primary px-5 py-2.5 text-xs flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Upload resource
                        </button>
                    ) : undefined
                }
            />

            <div className="space-y-4">
                <div className="relative etower-soft-card border border-[rgba(0,255,65,0.3)] p-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00ff41]" />
                    <input
                        type="text"
                        placeholder="Search resources…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/35"
                    />
                </div>

                <div className="flex flex-wrap gap-4 items-center etower-soft-card border border-[rgba(0,255,65,0.2)] p-3">
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto custom-scroll pb-1 sm:pb-0">
                        {["all", "official", "community"].map((tier) => (
                            <button
                                key={tier}
                                onClick={() => setTierFilter(tier)}
                                className={cn(
                                    "etower-soft-btn px-4 py-1.5 text-[10px] capitalize whitespace-nowrap",
                                    tierFilter === tier ? "etower-btn--primary" : "etower-soft-btn etower-soft-btn--ghost"
                                )}
                            >
                                {tier === "all" ? "All" : tier === "official" ? "E-board verified" : "Community"}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-6 bg-[rgba(0,255,65,0.2)] hidden sm:block" />

                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto custom-scroll pb-1 sm:pb-0">
                        {["all", "beginner", "intermediate", "advanced"].map((phase) => (
                            <button
                                key={phase}
                                onClick={() => setPhaseFilter(phase)}
                                className={cn(
                                    "etower-soft-btn px-4 py-1.5 text-[10px] capitalize whitespace-nowrap",
                                    phaseFilter === phase ? "etower-btn--primary" : "etower-soft-btn etower-soft-btn--ghost"
                                )}
                            >
                                {phase === "all" ? "All levels" : phase}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00ff41]" />
                    <span className="text-xs text-[#00ff41] tracking-wide">Loading resources…</span>
                </div>
            )}

            {!loading && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredResources.map((resource) => (
                        <div
                            key={resource.id}
                            className={cn(
                                "group etower-soft-card border p-5 transition-all relative flex flex-col",
                                resource.tier === "official"
                                    ? "border-[rgba(0,255,65,0.45)] bg-[rgba(0,255,65,0.04)]"
                                    : "border-[rgba(0,255,65,0.25)]"
                            )}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className={cn(
                                        "w-12 h-12 flex items-center justify-center border",
                                        resource.tier === "official"
                                            ? "bg-[rgba(0,255,65,0.1)] border-[rgba(0,255,65,0.4)] text-[#00ff41]"
                                            : "bg-white/5 border-[rgba(0,255,65,0.2)] text-white/50"
                                    )}
                                >
                                    {typeIcons[resource.type] || typeIcons.guide}
                                </div>
                                <span
                                    className={cn(
                                        "text-[10px] px-3 py-1 font-bold tracking-wide border",
                                        resource.tier === "official"
                                            ? "bg-[#00ff41] border-[#00ff41] text-[#0a0a0a]"
                                            : "bg-white/5 border-[rgba(0,255,65,0.2)] text-white/50"
                                    )}
                                >
                                    {resource.tier === "official" ? "Verified" : "Community"}
                                </span>
                            </div>

                            <h3 className="font-bold text-lg mb-2 tracking-tight group-hover:text-[#00ff41] transition-colors line-clamp-1">
                                {resource.title}
                            </h3>
                            <p className="text-sm text-white/55 mb-4 line-clamp-2 leading-relaxed flex-1">
                                {resource.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-5 p-2 bg-white/5 border border-[rgba(0,255,65,0.15)]">
                                <span
                                    className={cn(
                                        "text-[9px] px-2 py-0.5 border font-bold tracking-wide",
                                        resource.phase === "beginner"
                                            ? "border-[rgba(0,255,65,0.3)] text-[#00ff41]"
                                            : resource.phase === "intermediate"
                                              ? "border-[rgba(0,255,65,0.25)] text-white/70"
                                              : "border-[rgba(0,255,65,0.2)] text-white/50"
                                    )}
                                >
                                    {resource.phase}
                                </span>
                                {resource.topics.slice(0, 3).map((topic) => (
                                    <span
                                        key={topic}
                                        className="text-[9px] px-2 py-0.5 border border-[rgba(0,255,65,0.15)] text-white/45 uppercase"
                                    >
                                        {topic}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-bold tracking-wide text-white/40 pt-3 border-t border-[rgba(0,255,65,0.15)]">
                                <span className="flex items-center gap-1.5">
                                    <Eye className="w-3.5 h-3.5" />
                                    {resource.views} views
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {resource.date}
                                </span>
                            </div>

                            {resource.fileUrl && (
                                <Link
                                    href={resource.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 etower-soft-btn etower-btn--primary w-full py-3 text-xs flex items-center justify-center gap-2"
                                >
                                    {resource.type === "link" ? <LinkIcon className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                    {resource.type === "link" ? "Open link" : "Download"}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredResources.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 etower-soft-card border border-[rgba(0,255,65,0.25)]">
                    <BookOpen className="w-16 h-16 text-white/20 mb-4" />
                    <p className="text-xs font-bold text-white/45 tracking-wide text-center max-w-sm leading-relaxed">
                        No resources found.
                    </p>
                </div>
            )}

            {showUploadModal && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowUploadModal(false)}
                >
                    <div
                        className="etower-soft-card border border-[rgba(0,255,65,0.4)] max-w-xl w-full p-6 animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(0,255,65,0.2)]">
                            <div>
                                <p className="etower-section-label mb-1">Share a resource</p>
                                <h3 className="font-black text-xl tracking-tight flex items-center gap-2 text-white">
                                    <Upload className="w-5 h-5 text-[#00ff41]" />
                                    Upload to library
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="p-2 border border-[rgba(0,255,65,0.25)] hover:border-[#00ff41] text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="p-4 border border-[rgba(0,255,65,0.2)] space-y-4">
                                <div>
                                    <label className="etower-section-label text-[10px] mb-1.5 block">
                                        Title <span className="text-[#00ff41]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newResource.title}
                                        onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                                        placeholder="e.g. Intro to React"
                                        className="w-full px-4 py-2.5 border border-[rgba(0,255,65,0.25)] bg-white/5 focus:border-[#00ff41] text-sm transition-colors focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="etower-section-label text-[10px] mb-1.5 block">Description</label>
                                    <textarea
                                        rows={3}
                                        value={newResource.description}
                                        onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                                        placeholder="Brief summary of the resource…"
                                        className="w-full px-4 py-2.5 border border-[rgba(0,255,65,0.25)] bg-white/5 focus:border-[#00ff41] text-sm transition-colors focus:outline-none resize-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-[rgba(0,255,65,0.2)]">
                                    <label className="etower-section-label text-[10px] mb-1.5 block">Difficulty</label>
                                    <select
                                        value={newResource.phase}
                                        onChange={(e) => setNewResource({ ...newResource, phase: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-[rgba(0,255,65,0.25)] bg-white/5 focus:border-[#00ff41] text-sm transition-colors focus:outline-none"
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                                <div className="p-4 border border-[rgba(0,255,65,0.2)]">
                                    <label className="etower-section-label text-[10px] mb-1.5 block">Type</label>
                                    <select
                                        value={newResource.type}
                                        onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-[rgba(0,255,65,0.25)] bg-white/5 focus:border-[#00ff41] text-sm transition-colors focus:outline-none"
                                    >
                                        <option value="guide">Guide</option>
                                        <option value="tutorial">Tutorial</option>
                                        <option value="video">Video</option>
                                        <option value="document">Document</option>
                                        <option value="link">External link</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 border border-[rgba(0,255,65,0.2)]">
                                <label className="etower-section-label text-[10px] mb-1.5 block">
                                    Tags <span className="opacity-50 normal-case">(comma-separated)</span>
                                </label>
                                <input
                                    type="text"
                                    value={newResource.topics}
                                    onChange={(e) => setNewResource({ ...newResource, topics: e.target.value })}
                                    placeholder="e.g. React, TypeScript"
                                    className="w-full px-4 py-2.5 border border-[rgba(0,255,65,0.25)] bg-white/5 focus:border-[#00ff41] text-sm transition-colors focus:outline-none"
                                />
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={!newResource.title.trim()}
                                className="w-full etower-soft-btn etower-btn--primary py-3.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Submit for review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
