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
    X,
    Loader2,
    Terminal,
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
    const { data: projects, loading, createProject } = useProjects();
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [newProject, setNewProject] = useState({ name: "", description: "", timeline: "" });

    const statuses = ["all", "ideation", "design", "development", "review", "complete"];

    const filteredProjects = projects.filter((p) => {
        if (statusFilter !== "all" && p.status !== statusFilter) return false;
        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const handleSubmit = async () => {
        if (!newProject.name.trim()) return;
        await createProject({
            name: newProject.name,
            description: newProject.description,
            teamMembers: [{ uid: profile?.uid || "", role: "lead", name: profile?.displayName || "" }],
        });
        setNewProject({ name: "", description: "", timeline: "" });
        setShowNewProjectModal(false);
    };

    return (
        <div className="space-y-6 animate-fade-in relative z-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-border/50 pb-5">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-primary/80 uppercase tracking-widest mb-2">
                        <FolderKanban className="w-3.5 h-3.5" />
                        SYSTEM_MODULE / PROJECTS
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">
                        ACTIVE <span className="gradient-text-cyber text-transparent bg-clip-text">PROTOCOLS</span>
                    </h1>
                </div>
                <button onClick={() => setShowNewProjectModal(true)} className="hud-panel-sm bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all glow-border-strong flex items-center gap-2 group">
                    <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" /> NEW PITCH
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                    <input type="text" placeholder="SEARCH PROTOCOL DIRECTORY..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 hud-panel-sm bg-card/60 border border-border/50 focus:border-primary/50 text-sm font-mono uppercase tracking-widest transition-colors focus:outline-none" />
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
                    <span className="text-xs font-mono text-primary uppercase tracking-widest animate-pulse">QUERYING DIRECTORY...</span>
                </div>
            )}

            {/* Grid */}
            {!loading && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProjects.map((project, i) => (
                        <Link key={project.id} href={`/projects/${project.id}`} className={cn("group block bg-card/60 border border-border/40 overflow-hidden card-hover transition-all hover:border-primary/50 scanlines relative", i % 2 === 0 ? 'hud-panel-sm' : 'hud-corners')}>
                            <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 rounded-bl-[16px] group-hover:bg-primary/20 transition-colors pointer-events-none" />

                            <div className="p-5 relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="text-[10px] font-mono text-primary/60 uppercase tracking-widest mb-1">ID_{project.id.slice(0, 8)}</div>
                                        <h3 className="font-bold text-lg leading-tight uppercase tracking-tight group-hover:text-primary transition-colors truncate">{project.name}</h3>
                                        <div className="mt-2.5">
                                            <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-widest border hud-panel-sm", statusColors[project.status] || statusColors.ideation)}>{project.status}</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 hud-panel-sm bg-background border border-border/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/50 group-hover:text-primary transition-all flex-shrink-0">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                </div>
                                <p className="text-xs font-mono text-muted-foreground line-clamp-2 mb-5 leading-relaxed">{project.description}</p>

                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest mb-1.5">
                                        <span className="text-muted-foreground">PROGRESS</span>
                                        <span className="text-primary font-bold">{project.milestoneProgress}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-border/50 overflow-hidden">
                                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${project.milestoneProgress}%` }} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest pt-4 border-t border-border/40">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {project.teamMembers.length} UNITS</span>
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
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest relative z-10">NO PROTOCOLS FOUND MATCHING CURRENT PARAMETERS.</p>
                </div>
            )}

            {/* New Project Modal */}
            {showNewProjectModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewProjectModal(false)}>
                    <div className="hud-panel bg-card border border-primary/40 max-w-lg w-full p-6 sm:p-8 scanlines noise relative glow-border animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-20" />

                        <div className="relative z-10 text-center mb-6 border-b border-border/50 pb-4">
                            <div className="w-12 h-12 hud-panel-sm bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mx-auto mb-3">
                                <Plus className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-xl uppercase tracking-tight">INITIALIZE NEW PROTOCOL</h3>
                            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mt-1">Submit proposal to E-Board for authorization.</p>
                        </div>

                        <div className="space-y-5 relative z-10">
                            <div>
                                <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">PROTOCOL DESIGNATION</label>
                                <input type="text" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} placeholder="e.g., NEURAL_NET_V2" className="w-full px-4 py-3 hud-panel-sm bg-background/50 border border-border/50 focus:border-primary/50 text-sm font-mono uppercase transition-colors focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">MISSION PARAMETERS & OBJECTIVES</label>
                                <textarea rows={4} value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="Log operational details here..." className="w-full px-4 py-3 hud-panel-sm bg-background/50 border border-border/50 focus:border-primary/50 text-sm font-mono transition-colors focus:outline-none resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowNewProjectModal(false)} className="flex-1 hud-panel-alt border border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent py-3 text-xs font-mono font-bold uppercase tracking-widest transition-all">
                                    ABORT
                                </button>
                                <button onClick={handleSubmit} className="flex-[2] bg-primary text-primary-foreground py-3 hud-panel text-xs font-mono font-bold uppercase tracking-widest hover:brightness-110 transition-all glow-border">
                                    TRANSMIT PROPOSAL
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
