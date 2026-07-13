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
} from "lucide-react";
import { useState } from "react";
import { EtowerNav } from "@/components/etower-nav";
import { EtowerFooter } from "@/components/etower-footer";
import { FadeIn } from "@/components/fade-in";
import { useProjects } from "@/hooks/useFirestore";

export default function HallOfFamePage() {
    const { data: allProjects, loading } = useProjects();
    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    const projects = allProjects.filter((p) => p.status === "complete");
    const featuredProject = projects[0];
    const selectedProjectData = projects.find((p) => p.id === selectedProject);

    return (
        <div className="etower-page min-h-screen">
            <EtowerNav />

            <main className="pt-8 pb-0">
                <section className="py-16 px-4 sm:px-6 border-b border-[rgba(0,255,65,0.22)]">
                    <div className="max-w-6xl mx-auto">
                        <FadeIn>
                            <p className="etower-section-label mb-3">Project archive</p>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                                Hall of <span className="text-[#00ff41]">Fame</span>
                            </h1>
                            <p className="mt-4 text-white/60 max-w-2xl leading-relaxed">
                                Completed projects and successful deployments from the eTower community.
                            </p>
                        </FadeIn>

                        {loading && (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="w-8 h-8 animate-spin text-[#00ff41]" />
                                <span className="text-xs text-white/50">Loading projects…</span>
                            </div>
                        )}

                        {!loading && projects.length === 0 && (
                            <div className="mt-14 text-center py-16 rounded-2xl border border-[rgba(0,255,65,0.18)] bg-[rgba(20,32,51,0.88)]">
                                <Trophy className="w-14 h-14 text-white/20 mx-auto mb-4" />
                                <p className="text-sm text-white/50">No completed projects yet. Check back soon.</p>
                            </div>
                        )}

                        {!loading && featuredProject && (
                            <>
                                <FadeIn delay={80}>
                                    <button
                                        type="button"
                                        className="mt-14 w-full text-left rounded-2xl border border-[rgba(0,255,65,0.28)] bg-[rgba(20,32,51,0.92)] overflow-hidden hover:border-[#00ff41]/70 transition-colors shadow-[0_12px_36px_rgba(0,0,0,0.25)]"
                                        onClick={() => setSelectedProject(featuredProject.id)}
                                    >
                                        <div className="grid md:grid-cols-2 gap-0">
                                            <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[rgba(0,255,65,0.14)]">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-2 h-2 rounded-full bg-[#00ff41]" />
                                                    <span className="etower-section-label">Featured</span>
                                                </div>
                                                <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
                                                    {featuredProject.name}
                                                </h2>
                                                <p className="text-white/60 text-sm leading-relaxed mb-6">
                                                    {featuredProject.description}
                                                </p>
                                                <div className="flex flex-wrap gap-3 mt-auto">
                                                    <span className="etower-btn etower-btn--primary px-5 py-2.5 text-xs rounded-full">
                                                        View details
                                                    </span>
                                                    {featuredProject.liveUrl && (
                                                        <a
                                                            href={featuredProject.liveUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="etower-btn etower-btn--outline px-5 py-2.5 text-xs rounded-full"
                                                        >
                                                            <Play className="w-3.5 h-3.5" /> Live demo
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="hidden md:flex bg-gradient-to-br from-[rgba(0,255,65,0.12)] to-transparent items-center justify-center p-10">
                                                <div className="w-36 h-36 rounded-2xl bg-[rgba(0,255,65,0.12)] border border-[rgba(0,255,65,0.3)] flex items-center justify-center">
                                                    <Code2 className="w-14 h-14 text-[#00ff41]" />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </FadeIn>

                                <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {projects
                                        .filter((p) => p.id !== featuredProject.id)
                                        .map((project, i) => (
                                            <FadeIn key={project.id} delay={100 + i * 40}>
                                                <button
                                                    type="button"
                                                    className="group w-full text-left rounded-2xl border border-[rgba(0,255,65,0.16)] bg-[rgba(20,32,51,0.88)] overflow-hidden hover:border-[rgba(0,255,65,0.4)] transition-colors shadow-[0_10px_28px_rgba(0,0,0,0.2)]"
                                                    onClick={() => setSelectedProject(project.id)}
                                                >
                                                    <div className="h-32 sm:h-40 bg-gradient-to-br from-[rgba(0,255,65,0.1)] to-transparent flex items-center justify-center border-b border-[rgba(0,255,65,0.12)]">
                                                        <div className="w-14 h-14 rounded-2xl bg-[rgba(0,255,65,0.12)] border border-[rgba(0,255,65,0.25)] flex items-center justify-center text-[#00ff41] group-hover:scale-105 transition-transform">
                                                            <Code2 className="w-6 h-6" />
                                                        </div>
                                                    </div>
                                                    <div className="p-5">
                                                        <h3 className="font-semibold text-lg mb-2 group-hover:text-[#00ff41] transition-colors tracking-tight line-clamp-1">
                                                            {project.name}
                                                        </h3>
                                                        <p className="text-xs text-white/55 line-clamp-2 mb-4 leading-relaxed">
                                                            {project.description}
                                                        </p>
                                                        <div className="flex items-center justify-between text-[10px] text-white/45 border-t border-[rgba(0,255,65,0.12)] pt-3">
                                                            <span className="flex items-center gap-1.5">
                                                                <Users className="w-3 h-3" /> {project.teamMembers.length} members
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar className="w-3 h-3" /> {project.createdAt}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            </FadeIn>
                                        ))}
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </main>

            <EtowerFooter />

            {selectedProjectData && (
                <div
                    className="fixed inset-0 bg-[#0a1628]/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedProject(null)}
                >
                    <div
                        className="rounded-2xl bg-[rgba(20,32,51,0.96)] border border-[rgba(0,255,65,0.28)] max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-[rgba(20,32,51,0.96)] backdrop-blur-sm border-b border-[rgba(0,255,65,0.14)] p-5 flex items-start justify-between z-20">
                            <div className="min-w-0 pr-4">
                                <p className="etower-section-label mb-1">Project details</p>
                                <h2 className="font-bold text-xl sm:text-2xl truncate tracking-tight">
                                    {selectedProjectData.name}
                                </h2>
                                <p className="text-[11px] text-white/45 mt-1">
                                    {selectedProjectData.createdAt} · {selectedProjectData.teamMembers.length} members
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedProject(null)}
                                className="p-2 rounded-full border border-[rgba(0,255,65,0.22)] hover:border-[#00ff41] hover:text-[#00ff41] hover:bg-[rgba(0,255,65,0.08)] transition-colors flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="rounded-xl bg-[rgba(10,22,40,0.55)] border border-[rgba(0,255,65,0.14)] p-4">
                                <p className="etower-section-label mb-2 text-[10px]">Summary</p>
                                <p className="text-sm text-white/80 leading-relaxed">{selectedProjectData.description}</p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {selectedProjectData.liveUrl && (
                                    <a
                                        href={selectedProjectData.liveUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="etower-btn etower-btn--primary px-5 py-2.5 text-xs rounded-full"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" /> Live site
                                    </a>
                                )}
                                {selectedProjectData.githubUrl && (
                                    <a
                                        href={selectedProjectData.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="etower-btn etower-btn--outline px-5 py-2.5 text-xs rounded-full"
                                    >
                                        <GitBranch className="w-3.5 h-3.5" /> Source code
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
