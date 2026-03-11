"use client";

import { useProjects } from "@/hooks/useFirestore";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
    ArrowLeft,
    GitBranch,
    Users,
    ExternalLink,
    Calendar,
    Terminal,
    Image as ImageIcon,
    Clock,
    LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
    ideation: "bg-chart-2/10 border-chart-2/30 text-chart-2",
    design: "bg-chart-1/10 border-chart-1/30 text-chart-1",
    development: "bg-primary/10 border-primary/30 text-primary",
    review: "bg-warning/10 border-warning/30 text-warning",
    complete: "bg-success/10 border-success/30 text-success",
    published: "bg-primary/10 border-primary/30 text-primary",
    active: "bg-chart-2/10 border-chart-2/30 text-chart-2",
};

export default function ProjectDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const { data: projects, loading } = useProjects();

    // Find specific project
    const project = projects.find((p) => p.id === id);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Clock className="w-8 h-8 animate-spin text-primary" />
                <span className="text-xs font-mono text-primary uppercase tracking-widest animate-pulse">Loading...</span>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
                <Terminal className="w-12 h-12 text-destructive mb-2" />
                <h1 className="text-2xl font-black uppercase tracking-widest text-destructive">Project not found</h1>
                <p className="text-muted-foreground text-sm">This project doesn't exist or you don't have access to it.</p>
                <Link href="/projects" className="mt-4 px-6 py-3 hud-panel-sm bg-background border border-border/50 hover:bg-primary/10 hover:text-primary transition-colors font-mono text-xs font-bold uppercase tracking-widest">
                    Back to projects
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in relative z-10 pb-20">
            {/* Navigation Header */}
            <div className="flex flex-col sm:flex-row items-start gap-4 pb-4">
                <Link
                    href="/projects"
                    className="p-2 hud-panel-sm bg-background border border-border/40 hover:border-primary/50 hover:text-primary transition-colors text-muted-foreground"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-primary/80 uppercase tracking-widest">
                        <Terminal className="w-3.5 h-3.5" />
                        ID_{project.id.slice(0, 8)}
                    </div>
                    <div className="w-1 h-1 bg-border rounded-full" />
                    <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-widest border hud-panel-sm", statusColors[project.status] || statusColors.published)}>
                        {project.status}
                    </span>
                </div>
            </div>

            {/* Hero Section */}
            <div className="w-full aspect-video md:aspect-[21/9] max-h-[500px] hud-panel bg-card border border-border/40 relative overflow-hidden flex items-center justify-center glow-border group scanlines">
                {project.coverImage ? (
                    <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                ) : (
                    <div className="w-full h-full bg-background/50 flex flex-col items-center justify-center text-muted-foreground/30 pattern-grid-lg">
                        <ImageIcon className="w-12 h-12 mb-3" />
                        <span className="text-xs font-mono uppercase tracking-widest font-bold">No image</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                {/* Hero Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-10">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase mb-4 text-foreground drop-shadow-lg">
                        {project.name}
                    </h1>
                    <p className="text-lg sm:text-xl font-mono text-primary/90 max-w-3xl drop-shadow-md leading-relaxed">
                        {project.description}
                    </p>
                </div>
            </div>

            {/* Content Split Layout */}
            <div className="grid lg:grid-cols-3 gap-8 pt-4">
                {/* Main Story Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="hud-panel bg-card/40 border border-border/40 p-6 sm:p-8 sm:px-10 scanlines relative min-h-[500px]">
                        <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-r from-transparent to-primary/50" />

                        <div className="prose prose-invert prose-p:font-mono prose-p:text-sm prose-p:leading-loose prose-p:text-muted-foreground prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80 max-w-none">
                            {project.content ? (
                                <ReactMarkdown>
                                    {project.content}
                                </ReactMarkdown>
                            ) : (
                                <div className="text-center py-20 opacity-50">
                                    <Terminal className="w-12 h-12 mx-auto mb-4" />
                                    <p className="text-xs uppercase tracking-widest font-bold">No project log yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Endpoints */}
                    <div className="hud-corners bg-card/60 border border-border/40 p-6 scanlines relative group">
                        <h2 className="font-bold font-mono tracking-tight uppercase mb-5 flex items-center gap-2 pb-3 border-b border-border/40 text-primary">
                            <LinkIcon className="w-5 h-5" />
                            DEPLOYMENT ENDPOINTS
                        </h2>

                        <div className="space-y-3">
                            {project.liveUrl ? (
                                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 hud-panel-sm bg-primary border border-primary text-primary-foreground hover:brightness-110 transition-all group/link glow-border">
                                    <ExternalLink className="w-5 h-5" />
                                    <div className="flex-1">
                                        <div className="text-xs font-bold font-mono uppercase tracking-widest">Live app</div>
                                    </div>
                                    <ArrowLeft className="w-4 h-4 rotate-135 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                </a>
                            ) : (
                                <div className="p-4 hud-panel-sm bg-background border border-border/40 text-muted-foreground/50 text-xs font-mono uppercase tracking-widest text-center">
                                    NO SECURE UPLINK ESTABLISHED
                                </div>
                            )}

                            {project.githubUrl && (
                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 hud-panel-sm bg-card border border-border/40 hover:border-chart-1/50 hover:bg-chart-1/5 text-muted-foreground hover:text-chart-1 transition-colors group/git">
                                    <GitBranch className="w-5 h-5" />
                                    <div className="flex-1">
                                        <div className="text-xs font-bold font-mono uppercase tracking-widest">Code / repo</div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 opacity-50 group-hover/git:opacity-100 transition-opacity" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Personnel */}
                    <div className="hud-panel-alt bg-card/60 border border-border/40 p-6 scanlines relative group">
                        <h2 className="font-bold font-mono tracking-tight uppercase mb-5 flex items-center gap-2 pb-3 border-b border-border/40">
                            <Users className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            Team
                        </h2>
                        <div className="space-y-3 relative z-10">
                            {project.teamMembers.map((member, i) => (
                                <div key={i} className="flex items-center justify-between p-3 hud-panel-sm bg-background/50 border border-border/40 group/member hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 hud-corners bg-card flex items-center justify-center text-foreground font-black border border-border/50 text-xs shadow-inner">
                                            {member.name?.substring(0, 2).toUpperCase() || "??"}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold font-mono uppercase tracking-tight group-hover/member:text-primary transition-colors">
                                                {member.name || `USER_${member.uid.slice(0, 4)}`}
                                            </div>
                                            <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                                                ROLE: {member.role}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="hud-panel-sm bg-card/40 border border-border/40 p-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary" /> In progress</span>
                        <span>{project.createdAt}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
