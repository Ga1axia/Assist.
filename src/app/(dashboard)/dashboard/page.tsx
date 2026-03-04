"use client";

import { useAuth } from "@/contexts/auth-context";
import { isAdmin } from "@/lib/roles";
import { useFeed, useProjects, useEvents } from "@/hooks/useFirestore";
import {
    Activity,
    Clock,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Calendar,
    MapPin,
    CalendarDays,
    Users,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const typeEmoji: Record<string, string> = {
    milestone_update: "🚀",
    resource_upload: "📚",
    project_complete: "✅",
    member_join: "👋",
    announcement: "📢",
};

export default function DashboardPage() {
    const { profile } = useAuth();
    const { data: feedItems, loading: feedLoading } = useFeed();
    const { data: projects, loading: projectsLoading } = useProjects();
    const { data: events, loading: eventsLoading } = useEvents();

    const userIsAdmin = isAdmin(profile?.role);
    const loading = feedLoading || projectsLoading || eventsLoading;

    // Show more activity items since we have full height now
    const recentActivity = feedItems.slice(0, 8);

    // Active Projects (treating as Deadlines)
    const activeProjects = projects
        .filter((p) => p.status !== "complete")
        .slice(0, 4);

    // Upcoming Events
    const upcomingEvents = events.slice(0, 4);

    // Generate Week Matrix (Current Week Sun-Sat)
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday

    // Get the start of the week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDayOfWeek);

    // Generate the 7 days
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return {
            date,
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
            dayNum: date.getDate(),
            isToday: date.toDateString() === today.toDateString()
        };
    });

    const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] animate-fade-in relative z-10 max-w-[1400px] mx-auto overflow-hidden text-sm">
            {/* Welcome Header - Compact */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50 flex-shrink-0">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-primary/80 uppercase tracking-widest mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        CONNECTION ESTABLISHED
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none">
                        WELCOME, <span className="gradient-text-cyber">{profile?.displayName?.split(" ")[0] || "MEMBER"}</span>
                    </h1>
                </div>
                <div className="hud-panel-sm bg-card/60 border border-border/50 px-4 py-2 scanlines hidden sm:block">
                    <p className="relative z-10 text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-0.5">
                        <span className="text-primary mr-2">&gt;</span> STATUS: OPERATIONAL
                    </p>
                    <p className="relative z-10 text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                        <span className="text-primary mr-2">&gt;</span> CLR: {profile?.role}
                    </p>
                </div>
            </div>

            {/* 3-Column Grid that takes exactly the remaining height */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-0 flex-1">

                {/* ── LEFT COLUMN: Protocols & Directives ── */}
                <div className="flex flex-col gap-5 min-h-0 h-full">
                    {/* Active Projects / Deadlines */}
                    <div className="flex-1 min-h-0 flex flex-col hud-corners bg-card/60 border border-border/50 scanlines relative group">
                        <div className="absolute top-0 right-0 w-1 h-12 bg-warning/50 group-hover:bg-warning transition-colors" />

                        <div className="p-3 sm:p-4 border-b border-border/40 relative z-10 flex-shrink-0 flex items-center justify-between">
                            <h2 className="text-base font-bold font-mono tracking-tight uppercase flex items-center gap-2">
                                <Clock className="w-4 h-4 text-warning" />
                                UPCOMING DEADLINES
                            </h2>
                            <Link href="/projects" className="text-[9px] font-mono text-muted-foreground hover:text-warning transition-colors bg-background/50 px-2 py-1 border border-border/40">VIEW ALL</Link>
                        </div>

                        <div className="p-3 sm:p-4 flex-1 overflow-y-auto custom-scroll relative z-10">
                            {projectsLoading ? (
                                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-warning" /></div>
                            ) : activeProjects.length === 0 ? (
                                <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase text-center py-6">NO ACTIVE DEADLINES.</p>
                            ) : (
                                <div className="space-y-2.5">
                                    {activeProjects.map((project) => (
                                        <Link key={project.id} href={`/projects/${project.id}`} className="group/item flex flex-col gap-1.5 p-2.5 hud-panel-sm bg-background/40 hover:bg-accent/40 border border-border/40 hover:border-warning/40 transition-colors">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-warning/50 group-hover/item:text-warning transition-colors flex-shrink-0" />
                                                <p className="text-xs font-bold font-mono tracking-tight uppercase truncate">{project.name}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-0.5">
                                                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">PENDING</p>
                                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-warning/10 text-warning border border-warning/20">
                                                    {project.milestoneProgress}%
                                                </span>
                                            </div>
                                            <div className="h-0.5 w-full bg-border/50 mt-1 overflow-hidden">
                                                <div className="h-full bg-warning transition-all glow-border" style={{ width: `${project.milestoneProgress}%` }} />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="flex-1 min-h-0 flex flex-col hud-panel-sm bg-card/60 border border-border/50 scanlines relative group">
                        <div className="absolute top-0 right-0 w-1 h-12 bg-chart-2/50 group-hover:bg-chart-2 transition-colors" />

                        <div className="p-3 sm:p-4 border-b border-border/40 relative z-10 flex-shrink-0 flex items-center justify-between">
                            <h2 className="text-base font-bold font-mono tracking-tight uppercase flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-chart-2" />
                                UPCOMING EVENTS
                            </h2>
                            <Link href="/events" className="text-[9px] font-mono text-muted-foreground hover:text-chart-2 transition-colors bg-background/50 px-2 py-1 border border-border/40">VIEW ALL</Link>
                        </div>

                        <div className="p-3 sm:p-4 flex-1 overflow-y-auto custom-scroll relative z-10">
                            {eventsLoading ? (
                                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-chart-2" /></div>
                            ) : upcomingEvents.length === 0 ? (
                                <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase text-center py-6">NO UPCOMING EVENTS.</p>
                            ) : (
                                <div className="space-y-2.5">
                                    {upcomingEvents.map((event) => (
                                        <Link key={event.id} href={`/events`} className="group/item flex flex-col gap-1.5 p-2.5 hud-corners bg-background/40 hover:bg-accent/40 border border-border/40 hover:border-chart-2/40 transition-colors">
                                            <p className="text-xs font-bold font-mono tracking-tight uppercase truncate text-foreground group-hover/item:text-chart-2 transition-colors">
                                                {event.title}
                                            </p>
                                            <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-chart-2/70" /> {event.date}</span>
                                                {event.location && (
                                                    <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 text-chart-2/70" /> {event.location}</span>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── MIDDLE COLUMN: Activity Feed ── */}
                <div className="flex flex-col hud-panel bg-card/60 border border-border/50 scanlines relative group min-h-0 h-full">
                    <div className="absolute top-0 left-0 w-1 h-12 bg-primary/50 group-hover:bg-primary transition-colors" />

                    <div className="p-3 sm:p-4 border-b border-border/40 relative z-10 flex-shrink-0 flex items-center justify-between">
                        <h2 className="text-base font-bold font-mono tracking-tight uppercase flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            NETWORK ACTIVITY LOG
                        </h2>
                        <Link href="/feed" className="hud-panel-sm bg-primary/10 text-primary border border-primary/20 px-2 py-1 text-[9px] font-mono uppercase tracking-widest hover:bg-primary/20 transition-all">EXPAND</Link>
                    </div>

                    <div className="p-0 sm:p-2 flex-1 overflow-y-auto custom-scroll relative z-10">
                        {feedLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                <span className="text-[10px] font-mono text-primary uppercase tracking-widest animate-pulse">Syncing...</span>
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="text-center py-12">
                                <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">No network activity detected.</p>
                            </div>
                        ) : (
                            <div className="space-y-0.5 px-2 pb-2 mt-2">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-3 hud-panel-sm bg-background/40 border border-border/40 hover:border-primary/40 hover:bg-background/60 transition-colors">
                                        <div className="w-7 h-7 hud-corners bg-card flex items-center justify-center flex-shrink-0 text-sm border border-border/50">
                                            {typeEmoji[activity.type] || "📌"}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <p className="text-xs font-mono leading-relaxed">
                                                <span className="font-bold text-foreground uppercase">{activity.actorName}</span>{' '}
                                                <span className="text-muted-foreground">{activity.description}</span>
                                                {activity.targetName && <span className="text-primary font-bold uppercase ml-1">[{activity.targetName}]</span>}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <div className="w-1 h-1 rounded-sm bg-primary/50" />
                                                <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-1.5">
                                                    <Clock className="w-2.5 h-2.5" /> {activity.createdAt}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT COLUMN: Week Matrix & Admin ── */}
                <div className="flex flex-col gap-5 min-h-0 h-full">
                    {/* Week Calendar Matrix */}
                    <div className="flex-1 min-h-0 flex flex-col hud-panel-alt bg-card/60 border border-border/50 scanlines relative group overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none" />

                        <div className="p-3 sm:p-4 border-b border-border/40 relative z-10 flex-shrink-0 flex items-center justify-between">
                            <h2 className="text-base font-bold font-mono tracking-tight uppercase flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-primary" />
                                WEEK MATRIX
                            </h2>
                            <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-widest px-2 py-1 bg-primary/10 border border-primary/20">
                                {currentMonth}
                            </span>
                        </div>

                        <div className="p-3 sm:p-4 flex-1 relative z-10 flex flex-col justify-center">
                            <div className="grid grid-rows-7 gap-1 h-full py-1">
                                {weekDays.map((day, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-2 text-xs font-mono transition-colors",
                                            day.isToday
                                                ? "bg-primary/20 border border-primary text-primary font-bold glow-border hud-corners shadow-[0_0_10px_rgba(203,247,2,0.2)]"
                                                : "bg-background/50 border border-border/40 hover:border-primary/50"
                                        )}
                                    >
                                        <span className={cn("tracking-widest uppercase", day.isToday ? "text-primary" : "text-muted-foreground")}>{day.dayName}</span>
                                        <span className="text-sm">{day.dayNum}</span>
                                        <div className="flex items-center gap-1">
                                            {/* Render dots for events on this day if any */}
                                            {events.filter(e => {
                                                // very basic primitive check
                                                return e.date && e.date.includes(day.dayNum.toString()) && e.date.includes(currentMonth.split(' ')[0].substring(0, 3));
                                            }).slice(0, 3).map((_, idx) => (
                                                <div key={idx} className={cn("w-1.5 h-1.5 rounded-full", day.isToday ? "bg-primary" : "bg-chart-2")} />
                                            ))}
                                            <span className={cn("text-[9px] opacity-0 group-hover:opacity-100 transition-opacity ml-2", day.isToday ? "text-primary" : "text-muted-foreground/50")}>[SECURE]</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions (Admin/Eboard) - Only shows if admin and fits gracefully */}
                    {userIsAdmin && (
                        <div className="flex-shrink-0 hud-corners bg-card/60 border border-primary/40 p-3 sm:p-4 scanlines relative group glow-border">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3 border-b border-primary/30 pb-2">
                                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                    <h2 className="text-sm font-bold font-mono tracking-tight uppercase">ADMINISTRATION</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/admin" className="flex items-center gap-3 p-2.5 hud-panel-sm bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 transition-colors">
                                        <div className="w-8 h-8 hud-corners bg-card flex items-center justify-center border border-primary/30 text-primary flex-shrink-0">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold font-mono text-[10px] sm:text-xs tracking-tight uppercase text-primary truncate">Command</p>
                                        </div>
                                    </Link>
                                    <Link href="/members" className="flex items-center gap-3 p-2.5 hud-panel-sm bg-warning/5 hover:bg-warning/10 border border-warning/20 hover:border-warning/40 transition-colors">
                                        <div className="w-8 h-8 hud-corners bg-card flex items-center justify-center border border-warning/30 text-warning flex-shrink-0">
                                            <Users className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold font-mono text-[10px] sm:text-xs tracking-tight uppercase text-warning truncate">Roster</p>
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
