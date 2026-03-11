"use client";

import {
    Trophy,
    ExternalLink,
    GitBranch,
    Code2,
    Users,
    Calendar,
    X,
    Play,
    Loader2,
    Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PublicNav } from "@/components/public-nav";
import { useProjects } from "@/hooks/useFirestore";

export default function HallOfFamePage() {
    const { data: allProjects, loading } = useProjects();
    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    // Only show completed projects on Hall of Fame
    const projects = allProjects.filter((p) => p.status === "complete");
    const featuredProject = projects[0]; // first completed project is featured
    const selectedProjectData = projects.find((p) => p.id === selectedProject);

    return (
        <div className="min-h-screen relative overflow-hidden">
            <PublicNav />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16 animate-fade-in">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#006644]/50 border border-[#c7d28a]/40 text-[#c7d28a] px-4 py-1.5 text-xs font-mono tracking-widest uppercase mb-6 shadow-sm">
                        <Database className="w-3.5 h-3.5" />
                        The Generator Project Archive
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter uppercase text-[#c7d28a]">
                        Hall Of <span className="text-white/95">Fame</span>
                    </h1>
                    <div className="mt-6 flex justify-center">
                        <div className="rounded-xl border border-[#006644]/50 bg-card/50 backdrop-blur-sm px-6 py-3">
                            <p className="relative z-10 text-foreground/85 text-sm font-mono tracking-wider">
                                <span className="text-[#c7d28a] font-bold">&gt;</span> Browse successful projects and completed work from the club.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-[#c7d28a]" />
                        <span className="text-xs font-mono text-[#c7d28a] tracking-widest uppercase animate-pulse">Loading Projects...</span>
                    </div>
                )}

                {!loading && projects.length === 0 && (
                    <div className="text-center py-20 rounded-2xl bg-card/50 border border-[#006644]/40 max-w-2xl mx-auto backdrop-blur-sm">
                        <Trophy className="w-14 h-14 text-[#c7d28a]/30 mx-auto mb-4 relative z-10" />
                        <p className="text-xs font-mono text-foreground/70 tracking-widest uppercase relative z-10">No completed projects found in archive. Pending deployments.</p>
                    </div>
                )}

                {!loading && featuredProject && (
                    <>
                        {/* Featured Project */}
                        <div className="mb-10 sm:mb-16 rounded-2xl bg-card/60 border border-[#c7d28a]/40 overflow-hidden cursor-pointer transition-all hover:border-[#c7d28a]/60 backdrop-blur-sm" onClick={() => setSelectedProject(featuredProject.id)}>
                            <div className="grid md:grid-cols-2 gap-0 relative z-10">
                                <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#006644]/30">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-[#c7d28a] animate-pulse" />
                                        <span className="text-[10px] font-mono text-[#c7d28a] uppercase tracking-widest">Featured</span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 tracking-tight uppercase text-foreground">{featuredProject.name}</h2>
                                    <p className="text-muted-foreground text-sm font-mono leading-relaxed mb-6">{featuredProject.description}</p>
                                    <div className="flex flex-wrap gap-3 mt-auto">
                                        <button className="generator-button px-5 py-2.5 text-xs font-bold uppercase tracking-widest">Extract Data</button>
                                        {featuredProject.liveUrl && (
                                            <a href={featuredProject.liveUrl} target="_blank" rel="noopener noreferrer" className="generator-button-secondary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest">
                                                <Play className="w-3.5 h-3.5" /> Execute
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="hidden md:flex bg-gradient-to-br from-[#006644]/30 to-transparent items-center justify-center p-10 relative overflow-hidden">
                                    <div className="w-40 h-40 rounded-2xl bg-[#c7d28a]/20 border-2 border-[#c7d28a]/40 flex items-center justify-center relative z-10 animate-float">
                                        <Code2 className="w-16 h-16 text-[#c7d28a]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {projects.filter((p) => p.id !== featuredProject.id).map((project, i) => (
                                <div key={project.id} className={cn("group relative rounded-2xl bg-card/50 border border-[#006644]/40 overflow-hidden cursor-pointer transition-all hover:border-[#c7d28a]/50 hover:bg-card/70 backdrop-blur-sm")} onClick={() => setSelectedProject(project.id)}>
                                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-t-[#c7d28a]/20 border-l-[20px] border-l-transparent group-hover:border-t-[#c7d28a]/40 transition-colors z-20" />
                                    <div className="h-32 sm:h-40 bg-gradient-to-br from-[#006644]/30 to-transparent flex items-center justify-center border-b border-[#c7d28a]/20 relative z-10">
                                        <div className="w-14 h-14 rounded-xl bg-[#c7d28a]/20 border border-[#c7d28a]/40 flex items-center justify-center text-[#c7d28a] group-hover:scale-110 transition-transform">
                                            <Code2 className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <div className="p-5 relative z-10">
                                        <div className="text-[10px] font-mono text-[#c7d28a]/80 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <Database className="w-3 h-3" />
                                            {project.id.slice(0, 8)}
                                        </div>
                                        <h3 className="font-bold text-lg mb-2 group-hover:text-[#c7d28a] transition-colors tracking-tight uppercase line-clamp-1 text-foreground">{project.name}</h3>
                                        <p className="text-xs text-muted-foreground font-mono line-clamp-2 mb-4">{project.description}</p>
                                        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest border-t border-[#006644]/30 pt-3">
                                            <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {project.teamMembers.length} members</span>
                                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {project.createdAt}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Case Study Modal */}
            {selectedProjectData && (
                <div className="fixed inset-0 bg-[#093b26]/90 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
                    <div className="rounded-2xl bg-card border border-[#c7d28a]/40 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-transparent via-[#c7d28a]/60 to-transparent z-20" />

                        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-[#006644]/40 p-5 flex items-start justify-between z-20">
                            <div className="min-w-0 pr-4">
                                <div className="text-[10px] font-mono text-[#c7d28a] uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#c7d28a] animate-pulse" />
                                    ARCHIVE DATA EXTRACTED
                                </div>
                                <h2 className="font-black text-xl sm:text-2xl truncate uppercase tracking-tight text-foreground">{selectedProjectData.name}</h2>
                                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">{selectedProjectData.createdAt} · {selectedProjectData.teamMembers.length} members</p>
                            </div>
                            <button onClick={() => setSelectedProject(null)} className="p-2 rounded-lg bg-[#006644]/50 border border-[#c7d28a]/40 hover:border-[#c7d28a] text-[#c7d28a] transition-colors flex-shrink-0">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 relative z-10 space-y-6">
                            <div className="rounded-xl bg-[#093b26]/50 border border-[#006644]/50 p-4">
                                <div className="text-[10px] font-mono text-[#c7d28a]/80 uppercase tracking-widest mb-2 border-b border-[#006644]/40 pb-1">MISSION SUMMARY</div>
                                <p className="text-sm text-foreground font-mono leading-relaxed">{selectedProjectData.description}</p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {selectedProjectData.liveUrl && (
                                    <a href={selectedProjectData.liveUrl} target="_blank" rel="noopener noreferrer" className="generator-button inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest">
                                        <ExternalLink className="w-3.5 h-3.5" /> EXECUTE LIVE
                                    </a>
                                )}
                                {selectedProjectData.githubUrl && (
                                    <a href={selectedProjectData.githubUrl} target="_blank" rel="noopener noreferrer" className="generator-button-secondary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest">
                                        <GitBranch className="w-3.5 h-3.5" /> SOURCE REPO
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
