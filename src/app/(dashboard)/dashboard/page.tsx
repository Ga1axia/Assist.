"use client";

import { useAuth } from "@/contexts/auth-context";
import { isAdmin } from "@/lib/roles";
import { useDashboardStats, useFeed, useProjects } from "@/hooks/useFirestore";
import {
    FolderKanban,
    Users,
    BookOpen,
    Activity,
    TrendingUp,
    Clock,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const typeEmoji: Record<string, string> = {
    milestone_update: "🚀",
    resource_upload: "📚",
    project_complete: "✅",
    member_join: "👋",
};

export default function DashboardPage() {
    const { profile } = useAuth();
    const { stats, loading: statsLoading } = useDashboardStats();
    const { data: feedItems, loading: feedLoading } = useFeed();
    const { data: projects, loading: projectsLoading } = useProjects();

    const userIsAdmin = isAdmin(profile?.role);
    const loading = statsLoading || feedLoading || projectsLoading;

    const recentActivity = feedItems.slice(0, 5);

    // Find projects with upcoming work
    const activeProjects = projects
        .filter((p) => p.status !== "complete")
        .slice(0, 3);

    const statCards = [
        {
            label: "SYS_PROJECTS_ACT",
            title: "Active Projects",
            value: loading ? "—" : String(stats.activeProjects),
            icon: <FolderKanban className="w-5 h-5" />,
        },
        {
            label: "SYS_PERSONNEL",
            title: "Team Members",
            value: loading ? "—" : String(stats.totalMembers),
            icon: <Users className="w-5 h-5" />,
        },
        {
            label: "SYS_DATA_BANKS",
            title: "Resources",
            value: loading ? "—" : String(stats.totalResources),
            icon: <BookOpen className="w-5 h-5" />,
        },
        {
            label: "SYS_TOTAL_DEPLOY",
            title: "Total Projects",
            value: loading ? "—" : String(stats.totalProjects),
            icon: <TrendingUp className="w-5 h-5" />,
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in relative z-10">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-5">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-primary/80 uppercase tracking-widest mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        CONNECTION ESTABLISHED
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">
                        SYSTEM WELCOME, <span className="gradient-text-cyber">{profile?.displayName?.split(" ")[0] || "OPERATIVE"}</span>
                    </h1>
                </div>
                <div className="hud-panel-sm bg-card/60 border border-border/50 px-4 py-2 scanlines">
                    <p className="relative z-10 text-xs text-muted-foreground font-mono uppercase tracking-wider">
                        <span className="text-primary mr-2">&gt;</span> STATUS: OPERATIONAL
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <div key={stat.label} className={cn("bg-card/60 border border-border/50 p-5 transition-all hover:border-primary/50 scanlines relative group", i % 2 === 0 ? 'hud-panel-sm' : 'hud-corners')}>
                        <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 rounded-bl-full group-hover:bg-primary/20 transition-colors pointer-events-none" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">{stat.label}</div>
                            <div className="text-primary/80">{stat.icon}</div>
                        </div>
                        <div className="relative z-10">
                            <div className="text-3xl font-black tracking-tight mb-1 group-hover:text-primary transition-colors">{stat.value}</div>
                            <div className="text-xs font-mono text-muted-foreground uppercase">{stat.title}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 hud-panel bg-card/60 border border-border/50 p-6 scanlines relative group">
                    <div className="absolute top-0 left-0 w-1 h-12 bg-primary/50 group-hover:bg-primary transition-colors" />

                    <div className="flex items-center justify-between mb-6 border-b border-border/40 pb-4 relative z-10">
                        <h2 className="text-lg font-bold font-mono tracking-tight uppercase flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            NETWORK ACTIVITY LOG
                        </h2>
                        <Link href="/feed" className="hud-panel-sm bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-[10px] font-mono uppercase tracking-widest hover:bg-primary/20 transition-all">Expand Log</Link>
                    </div>

                    <div className="relative z-10">
                        {feedLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                <span className="text-[10px] font-mono text-primary uppercase tracking-widest animate-pulse">Syncing...</span>
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="text-center py-12">
                                <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">No network activity detected.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-4 p-4 hud-panel-sm bg-background/40 border border-border/40 hover:border-primary/40 hover:bg-background/60 transition-colors">
                                        <div className="w-8 h-8 hud-corners bg-card flex items-center justify-center flex-shrink-0 text-lg border border-border/50">
                                            {typeEmoji[activity.type] || "📌"}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <p className="text-sm font-mono leading-relaxed">
                                                <span className="font-bold text-foreground uppercase">{activity.actorName}</span>{' '}
                                                <span className="text-muted-foreground">{activity.description}</span>
                                                {activity.targetName && <span className="text-primary font-bold uppercase ml-1">[{activity.targetName}]</span>}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="w-1 h-1 rounded-sm bg-primary/50" />
                                                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" /> {activity.createdAt}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Active Projects */}
                    <div className="hud-panel-alt bg-card/60 border border-border/50 p-6 scanlines relative group">
                        <div className="absolute top-0 right-0 w-1 h-12 bg-warning/50 group-hover:bg-warning transition-colors" />

                        <div className="flex items-center gap-2 mb-6 border-b border-border/40 pb-4 relative z-10">
                            <Clock className="w-5 h-5 text-warning" />
                            <h2 className="text-lg font-bold font-mono tracking-tight uppercase">ACTIVE PROTOCOLS</h2>
                        </div>

                        <div className="relative z-10">
                            {projectsLoading ? (
                                <div className="flex flex-col items-center justify-center py-8 gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin text-warning" />
                                </div>
                            ) : activeProjects.length === 0 ? (
                                <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase text-center py-8">NO ACTIVE PROTOCOLS.</p>
                            ) : (
                                <div className="space-y-3">
                                    {activeProjects.map((project) => (
                                        <Link key={project.id} href={`/projects/${project.id}`} className="group/item flex flex-col gap-2 p-3 hud-corners bg-background/40 hover:bg-accent/40 border border-border/40 hover:border-warning/40 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <CheckCircle2 className="w-4 h-4 text-warning/50 group-hover/item:text-warning transition-colors flex-shrink-0" />
                                                    <p className="text-sm font-bold font-mono tracking-tight uppercase truncate">{project.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">STATUS: {project.status}</p>
                                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 hud-panel-sm bg-warning/10 text-warning border border-warning/20">
                                                    {project.milestoneProgress}%
                                                </span>
                                            </div>
                                            {/* Progress Bar Mini */}
                                            <div className="h-1 w-full bg-border/50 mt-1 overflow-hidden">
                                                <div className="h-full bg-warning transition-all" style={{ width: `${project.milestoneProgress}%` }} />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions (Admin/Eboard) */}
                    {userIsAdmin && (
                        <div className="hud-corners bg-card/60 border border-primary/40 p-6 scanlines relative group glow-border">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-6 border-b border-primary/30 pb-4">
                                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                                    <h2 className="text-lg font-bold font-mono tracking-tight uppercase">ADMIN OVERRIDE</h2>
                                </div>
                                <div className="space-y-3">
                                    <Link href="/admin" className="flex items-center gap-4 p-3 hud-panel-sm bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 transition-colors">
                                        <div className="w-10 h-10 hud-corners bg-card flex items-center justify-center border border-primary/30 text-primary">
                                            <AlertTriangle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold font-mono text-sm tracking-tight uppercase text-primary">Command Center</p>
                                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">Manage system queues</p>
                                        </div>
                                    </Link>
                                    <Link href="/members" className="flex items-center gap-4 p-3 hud-panel-sm bg-warning/5 hover:bg-warning/10 border border-warning/20 hover:border-warning/40 transition-colors">
                                        <div className="w-10 h-10 hud-corners bg-card flex items-center justify-center border border-warning/30 text-warning">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold font-mono text-sm tracking-tight uppercase text-warning">Personnel Overview</p>
                                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">View operative metrics</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
