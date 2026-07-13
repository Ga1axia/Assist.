"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/useFirestore";
import Link from "next/link";
import {
    Plus,
    Search,
    ArrowUpRight,
    Users,
    Calendar,
    GitBranch,
    Loader2,
    FolderKanban,
    Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";

const statusColors: Record<string, string> = {
    ideation: "bg-white/5 border-[rgba(0,255,65,0.2)] text-white/70",
    design: "bg-[rgba(0,255,65,0.05)] border-[rgba(0,255,65,0.25)] text-white/80",
    development: "bg-[rgba(0,255,65,0.1)] border-[rgba(0,255,65,0.35)] text-[#00ff41]",
    review: "bg-[rgba(0,255,65,0.08)] border-[rgba(0,255,65,0.3)] text-white",
    complete: "bg-[rgba(0,255,65,0.15)] border-[#00ff41] text-[#00ff41]",
};

export default function ProjectsPage() {
    const { data: projects, loading } = useProjects();
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const statuses = ["all", "ideation", "design", "development", "review", "complete"];

    const filteredProjects = projects.filter((p) => {
        if (statusFilter !== "all" && p.status !== statusFilter) return false;
        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="space-y-6 animate-fade-in relative z-10">
            <PageHeader
                eyebrow="Projects"
                title="Active projects"
                description="Browse and contribute to projects across the eTower community."
                actions={
                    <Link href="/projects/new" className="etower-soft-btn etower-btn--primary px-5 py-2.5 text-xs flex items-center gap-2">
                        <Plus className="w-3.5 h-3.5" />
                        New project
                    </Link>
                }
            />

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00ff41]/60" />
                    <input
                        type="text"
                        placeholder="Search projects…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 etower-soft-card bg-transparent border border-[rgba(0,255,65,0.3)] focus:border-[#00ff41] text-sm transition-colors focus:outline-none"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scroll">
                    {statuses.map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "etower-soft-btn px-4 py-2.5 text-xs whitespace-nowrap",
                                statusFilter === status ? "etower-btn--primary" : "etower-soft-btn etower-soft-btn--ghost"
                            )}
                        >
                            {status === "all" ? "All" : status}
                        </button>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00ff41]" />
                    <span className="text-xs text-[#00ff41] tracking-wide">Loading projects…</span>
                </div>
            )}

            {!loading && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProjects.map((project) => (
                        <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="group block etower-soft-card border border-[rgba(0,255,65,0.25)] overflow-hidden transition-all hover:border-[#00ff41] flex flex-col h-full"
                        >
                            <div className="h-40 border-b border-[rgba(0,255,65,0.2)] relative overflow-hidden shrink-0 group-hover:border-[rgba(0,255,65,0.4)] transition-colors">
                                {project.coverImage ? (
                                    <img
                                        src={project.coverImage}
                                        alt={project.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center text-white/25">
                                        <ImageIcon className="w-8 h-8 mb-2" />
                                        <span className="text-[10px] tracking-wide">No cover image</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-transparent to-transparent" />

                                <div className="absolute top-3 left-3">
                                    <span
                                        className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 tracking-wide border",
                                            statusColors[project.status] || statusColors.ideation
                                        )}
                                    >
                                        {project.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <h3 className="font-bold text-lg leading-tight group-hover:text-[#00ff41] transition-colors truncate">
                                            {project.name}
                                        </h3>
                                    </div>
                                    <div className="w-8 h-8 border border-[rgba(0,255,65,0.25)] flex items-center justify-center group-hover:border-[#00ff41] group-hover:text-[#00ff41] transition-all flex-shrink-0">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <p className="text-xs text-white/50 line-clamp-2 mb-5 leading-relaxed flex-1">
                                    {project.description}
                                </p>

                                <div className="flex items-center justify-between text-[10px] text-white/40 tracking-wide pt-4 border-t border-[rgba(0,255,65,0.15)] mt-auto">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1.5">
                                            <Users className="w-3 h-3" />
                                            {project.teamMembers.length} members
                                        </span>
                                        {project.githubUrl && (
                                            <span className="flex items-center gap-1.5 text-[#00ff41]/70">
                                                <GitBranch className="w-3 h-3" />
                                                Repo
                                            </span>
                                        )}
                                    </div>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3" />
                                        {project.updatedAt}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {!loading && filteredProjects.length === 0 && (
                <div className="text-center py-20 etower-soft-card border border-[rgba(0,255,65,0.25)] max-w-2xl mx-auto">
                    <FolderKanban className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-xs text-white/45 tracking-wide">No projects match your search.</p>
                </div>
            )}
        </div>
    );
}
