"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProjects } from "@/hooks/useFirestore";
import Link from "next/link";
import {
    FolderKanban,
    Plus,
    Search,
    ArrowUpRight,
    Users,
    Calendar,
    GitBranch,
    Loader2,
    Terminal,
    Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
    ideation: "bg-chart-2/10 border-chart-2/30 text-chart-2",
    design: "bg-chart-1/10 border-chart-1/30 text-chart-1",
    development: "bg-primary/10 border-primary/30 text-primary",
    review: "bg-warning/10 border-warning/30 text-warning",
    complete: "bg-success/10 border-success/30 text-success",
};

export default function ProjectsPage() {
    const { profile } = useAuth();
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-border/50 pb-5">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-primary/80 uppercase tracking-widest mb-2">
                        <FolderKanban className="w-3.5 h-3.5" />
                        PROJECTS
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">
                        ACTIVE <span className="gradient-text-cyber text-transparent bg-clip-text">PROJECTS</span>
                    </h1>
                </div>
                <Link href="/projects/new" className="hud-panel-sm bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all glow-border-strong flex items-center gap-2 group">
                    <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" /> SUBMIT PROJECT
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                    <input type="text" placeholder="SEARCH PROJECTS..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 hud-panel-sm bg-card/60 border border-border/50 focus:border-primary/50 text-sm font-mono uppercase tracking-widest transition-colors focus:outline-none" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scroll">
                    {statuses.map((status) => (
                        <button key={status} onClick={() => setStatusFilter(status)} className={cn("px-4 py-3 hud-panel-sm text-xs font-mono font-bold uppercase tracking-widest transition-all border", statusFilter === status ? "bg-primary text-primary-foreground border-primary glow-border" : "bg-card/40 border-border/40 text-muted-foreground hover:bg-accent hover:border-border")}>
                            {status === "all" ? "ALL" : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-xs font-mono text-primary uppercase tracking-widest animate-pulse">Loading...</span>
                </div>
            )}

            {/* Grid */}
            {!loading && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProjects.map((project, i) => (
                        <Link key={project.id} href={`/projects/${project.id}`} className={cn("group block bg-card/60 border border-border/40 overflow-hidden card-hover transition-all hover:border-primary/50 scanlines relative flex flex-col h-full", i % 2 === 0 ? 'hud-panel-sm' : 'hud-corners')}>
                            <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 rounded-bl-[16px] group-hover:bg-primary/20 transition-colors pointer-events-none z-20" />

                            <div className="h-40 bg-card border-b border-border/40 relative overflow-hidden shrink-0 group-hover:border-primary/50 transition-colors">
                                {project.coverImage ? (
                                    <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full bg-background/50 flex flex-col items-center justify-center text-muted-foreground/30 pattern-grid-lg">
                                        <ImageIcon className="w-8 h-8 mb-2" />
                                        <span className="text-[10px] font-mono uppercase tracking-widest">NO IMAGE DATA</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-widest border hud-panel-sm", statusColors[project.status] || statusColors.ideation)}>{project.status}</span>
                                </div>
                            </div>

                            <div className="p-5 relative z-10 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <h3 className="font-bold text-lg leading-tight uppercase tracking-tight group-hover:text-primary transition-colors truncate">{project.name}</h3>
                                        <div className="text-[10px] font-mono text-primary/60 uppercase tracking-widest mt-0.5">ID_{project.id.slice(0, 8)}</div>
                                    </div>
                                    <div className="w-8 h-8 hud-panel-sm bg-background border border-border/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/50 group-hover:text-primary transition-all flex-shrink-0">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <p className="text-xs font-mono text-muted-foreground line-clamp-2 mb-5 leading-relaxed flex-1">{project.description}</p>

                                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest pt-4 border-t border-border/40 mt-auto">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {project.teamMembers.length} team members</span>
                                        {project.githubUrl && <span className="flex items-center gap-1.5"><GitBranch className="w-3 h-3 text-chart-1" /> REPO</span>}
                                    </div>
                                    <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {project.updatedAt}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {!loading && filteredProjects.length === 0 && (
                <div className="text-center py-20 hud-panel bg-card/40 border border-border/50 scanlines max-w-2xl mx-auto">
                    <Terminal className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4 relative z-10" />
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest relative z-10">NO PROJECTS FOUND MATCHING YOUR SEARCH.</p>
                </div>
            )}

        </div>
    );
}
