"use client";

import { useAuth } from "@/contexts/auth-context";
import { isAdmin } from "@/lib/roles";
import { useFeed, useProjects, useEvents, useActionItems } from "@/hooks/useFirestore";
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
    const { profile, user } = useAuth();
    const { data: feedItems, loading: feedLoading } = useFeed();
    const { data: events, loading: eventsLoading } = useEvents();
    const { data: actionItems, loading: actionItemsLoading, completeActionItem } = useActionItems();

    const userIsAdmin = isAdmin(profile?.role);
    const loading = feedLoading || eventsLoading || actionItemsLoading;

    // Show more activity items since we have full height now
    const recentActivity = feedItems.slice(0, 8);

    // Active Action Items (Untruncated, we'll slice in render if needed, or just allow scroll)
    const activeDeadlines = actionItems.slice(0, 10);

    // Upcoming Events
    const upcomingEvents = events.slice(0, 4);

    // Generate Week Matrix (Current Week Mon-Sun)
    const today = new Date();
    // getDay() returns 0 for Sunday, 1 for Monday. Convert to 0 for Monday, 6 for Sunday.
    const currentDayOfWeek = (today.getDay() + 6) % 7;

    // Get the start of the week (Monday)
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
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#006644]/40 flex-shrink-0">
                <div>
                    <div className="flex items-center gap-2 text-[10px] text-[#c7d28a] mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#c7d28a] animate-pulse" />
                        You're signed in
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter leading-none text-foreground">
                        Welcome, <span className="text-[#c7d28a]">{profile?.displayName?.split(" ")[0] || "Member"}</span>
                    </h1>
                </div>
                <div className="rounded-xl bg-card/60 border border-[#006644]/40 px-4 py-2 hidden sm:block">
                    <p className="relative z-10 text-[10px] text-muted-foreground mb-0.5">
                        <span className="text-[#c7d28a] mr-2">·</span> Ready
                    </p>
                    <p className="relative z-10 text-[10px] text-muted-foreground">
                        <span className="text-[#c7d28a] mr-2">·</span> Role: {profile?.role}
                    </p>
                </div>
            </div>

            {/* 3-Column Grid that takes exactly the remaining height */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-0 flex-1">

                {/* ── LEFT COLUMN: Protocols & Directives ── */}
                <div className="flex flex-col gap-5 min-h-0 h-full">
                    {/* Active Projects / Deadlines */}
                    <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-card/60 border border-[#006644]/40 relative group">
                        <div className="absolute top-0 right-0 w-1 h-12 rounded-tr-2xl bg-[#c7d28a]/50 group-hover:bg-[#c7d28a] transition-colors" />

                        <div className="p-3 sm:p-4 border-b border-[#006644]/30 relative z-10 flex-shrink-0 flex items-center justify-between">
                            <h2 className="text-base font-bold font-mono tracking-tight uppercase flex items-center gap-2 text-[#c7d28a]">
                                <Clock className="w-4 h-4" />
                                Upcoming deadlines
                            </h2>
                            <Link href="/projects" className="generator-button-secondary text-[9px] py-1">View all</Link>
                        </div>

                        <div className="p-3 sm:p-4 flex-1 overflow-y-auto custom-scroll relative z-10">
                            {actionItemsLoading ? (
                                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[#c7d28a]" /></div>
                            ) : activeDeadlines.length === 0 ? (
                                <p className="text-[10px] text-muted-foreground text-center py-6">No tasks right now.</p>
                            ) : (
                                <div className="space-y-3">
                                    {activeDeadlines.map((item) => {
                                        const isCompleted = user?.uid ? item.completedBy.includes(user.uid) : false;

                                        return (
                                            <div key={item.id} className={cn("group/item flex flex-col gap-2 p-3 rounded-xl transition-colors border", isCompleted ? "bg-success/5 border-success/30" : "bg-[#093b26]/40 hover:bg-[#006644]/30 border-[#006644]/40 hover:border-[#c7d28a]/40")}>
                                                <div className="flex items-start justify-between min-w-0 gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn("text-xs font-bold font-mono tracking-tight uppercase truncate transition-colors", isCompleted ? "text-success" : "text-foreground group-hover/item:text-[#c7d28a]")}>
                                                            {item.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Clock className={cn("w-3 h-3", isCompleted ? "text-success/70" : "text-[#c7d28a]/70")} />
                                                            <p className={cn("text-[10px] font-mono uppercase tracking-widest truncate", isCompleted ? "text-success/70" : "text-muted-foreground")}>
                                                                Due: {new Date(item.deadline).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Completion Checkbox Area */}
                                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={async () => {
                                                                if (user?.uid) {
                                                                    await completeActionItem(item.id, user.uid, isCompleted);
                                                                }
                                                            }}
                                                            className={cn("w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer shadow-sm", isCompleted ? "bg-success text-success-foreground border-success" : "bg-card border-[#006644]/50 text-transparent hover:border-[#c7d28a] hover:bg-[#c7d28a]/10")}
                                                        >
                                                            <CheckCircle2 className={cn("w-4 h-4", isCompleted ? "text-inherit" : "hidden")} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="text-[10px] font-mono text-muted-foreground leading-relaxed line-clamp-2 mt-1 border-l-2 border-border/50 pl-2">
                                                    {item.description}
                                                </p>

                                                {item.type === "form" && item.link && (
                                                    <div className="mt-2 pt-2 border-t border-border/40 flex justify-between items-center">
                                                        <a
                                                            href={item.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="generator-button-secondary text-[9px] py-1.5 px-3 flex items-center gap-2"
                                                        >
                                                            Open task <Sparkles className="w-3 h-3" />
                                                        </a>
                                                        {isCompleted && (
                                                            <span className="text-[9px] font-mono text-success uppercase tracking-widest font-bold bg-success/10 px-2 py-1 border border-success/20">
                                                                Done
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-card/60 border border-[#006644]/40 relative group">
                        <div className="absolute top-0 right-0 w-1 h-12 rounded-tr-2xl bg-[#c7d28a]/50 group-hover:bg-[#c7d28a] transition-colors" />

                        <div className="p-3 sm:p-4 border-b border-[#006644]/30 relative z-10 flex-shrink-0 flex items-center justify-between">
                            <h2 className="text-base font-bold font-mono tracking-tight uppercase flex items-center gap-2 text-[#c7d28a]">
                                <Calendar className="w-4 h-4" />
                                Upcoming events
                            </h2>
                            <Link href="/events" className="generator-button-secondary text-[9px] py-1">View all</Link>
                        </div>

                        <div className="p-3 sm:p-4 flex-1 overflow-y-auto custom-scroll relative z-10">
                            {eventsLoading ? (
                                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[#c7d28a]" /></div>
                            ) : upcomingEvents.length === 0 ? (
                                <p className="text-[10px] text-muted-foreground text-center py-6">No upcoming events.</p>
                            ) : (
                                <div className="space-y-2.5">
                                    {upcomingEvents.map((event) => (
                                        <Link key={event.id} href={`/events`} className="group/item flex flex-col gap-1.5 p-2.5 rounded-xl bg-[#093b26]/40 hover:bg-[#006644]/30 border border-[#006644]/40 hover:border-[#c7d28a]/40 transition-colors">
                                            <p className="text-xs font-bold font-mono tracking-tight uppercase truncate text-foreground group-hover/item:text-[#c7d28a] transition-colors">
                                                {event.title}
                                            </p>
                                            <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#c7d28a]/70" /> {event.date}</span>
                                                {event.location && (
                                                    <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 text-[#c7d28a]/70" /> {event.location}</span>
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
                <div className="flex flex-col rounded-2xl bg-card/60 border border-[#006644]/40 relative group min-h-0 h-full">
                    <div className="absolute top-0 left-0 w-1 h-12 rounded-tl-2xl bg-[#c7d28a]/50 group-hover:bg-[#c7d28a] transition-colors" />

                    <div className="p-3 sm:p-4 border-b border-[#006644]/30 relative z-10 flex-shrink-0 flex items-center justify-between">
                        <h2 className="text-base font-bold font-mono tracking-tight uppercase flex items-center gap-2 text-[#c7d28a]">
                            <Activity className="w-4 h-4" />
                            Recent activity
                        </h2>
                        <Link href="/feed" className="generator-button-secondary text-[9px] py-1">See all</Link>
                    </div>

                    <div className="p-0 sm:p-2 flex-1 overflow-y-auto custom-scroll relative z-10">
                        {feedLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <Loader2 className="w-6 h-6 animate-spin text-[#c7d28a]" />
                                <span className="text-[10px] text-[#c7d28a] animate-pulse">Loading...</span>
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="text-center py-12">
                                <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-[10px] text-muted-foreground">No recent activity yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-0.5 px-2 pb-2 mt-2">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#093b26]/40 border border-[#006644]/40 hover:border-[#c7d28a]/40 hover:bg-[#093b26]/60 transition-colors">
                                        <div className="w-7 h-7 rounded-lg bg-card flex items-center justify-center flex-shrink-0 text-sm border border-[#006644]/50">
                                            {typeEmoji[activity.type] || "📌"}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <p className="text-xs font-mono leading-relaxed">
                                                <span className="font-bold text-foreground uppercase">{activity.actorName}</span>{' '}
                                                <span className="text-muted-foreground">{activity.description}</span>
                                                {activity.targetName && <span className="text-[#c7d28a] font-bold uppercase ml-1">[{activity.targetName}]</span>}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <div className="w-1 h-1 rounded-sm bg-[#c7d28a]/50" />
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
                    <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-card/60 border border-[#006644]/40 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#c7d28a]/5 to-transparent pointer-events-none" />

                        <div className="p-3 sm:p-4 border-b border-[#006644]/30 relative z-10 flex-shrink-0 flex items-center justify-between">
                            <h2 className="text-base font-bold font-mono tracking-tight uppercase flex items-center gap-2 text-[#c7d28a]">
                                <CalendarDays className="w-4 h-4" />
                                This week
                            </h2>
                            <span className="text-[9px] font-mono text-[#c7d28a] font-bold uppercase tracking-widest px-2 py-1 rounded-lg bg-[#c7d28a]/10 border border-[#c7d28a]/30">
                                {currentMonth}
                            </span>
                        </div>

                        <div className="p-3 sm:p-4 flex-1 relative z-10 flex flex-col justify-center">
                            <div className="grid grid-rows-7 gap-1 h-full py-1">
                                {weekDays.map((day, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-1.5 sm:py-2 text-xs font-mono transition-colors group/day",
                                            day.isToday
                                                ? "bg-[#c7d28a]/20 border border-[#c7d28a] text-[#c7d28a] font-bold rounded-xl"
                                                : "bg-[#093b26]/50 border border-[#006644]/40 hover:border-[#c7d28a]/50 rounded-xl"
                                        )}
                                    >
                                        <div className="flex items-center gap-1 shrink-0">
                                            <span className={cn("tracking-widest uppercase", day.isToday ? "text-[#c7d28a]" : "text-muted-foreground")}>
                                                {day.dayName.substring(0, 3)}-{day.dayNum}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 overflow-hidden justify-end">
                                            {/* Render blocks for events on this day if any */}
                                            {events.filter(e => {
                                                if (!e.date) return false;
                                                const [year, month, dNum] = e.date.split("-").map(Number);
                                                return dNum === day.dayNum &&
                                                    month - 1 === day.date.getMonth() &&
                                                    year === day.date.getFullYear();
                                            }).slice(0, 2).map((evt, idx) => (
                                                <div key={idx} className={cn("px-1.5 py-0.5 text-[8px] uppercase tracking-wider truncate border rounded", day.isToday ? "bg-[#c7d28a]/20 border-[#c7d28a]/50 text-[#c7d28a]" : "bg-[#006644]/20 border-[#006644]/40 text-[#c7d28a]")}>
                                                    {evt.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions (Admin/Eboard) - Only shows if admin and fits gracefully */}
                    {userIsAdmin && (
                        <div className="flex-shrink-0 rounded-2xl bg-card/60 border border-[#c7d28a]/40 p-3 sm:p-4 relative group">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3 border-b border-[#c7d28a]/30 pb-2">
                                    <Sparkles className="w-4 h-4 text-[#c7d28a] animate-pulse" />
                                    <h2 className="text-sm font-bold tracking-tight text-[#c7d28a]">Admin</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/admin" className="flex items-center gap-3 p-2.5 rounded-xl bg-[#c7d28a]/5 hover:bg-[#c7d28a]/10 border border-[#c7d28a]/20 hover:border-[#c7d28a]/40 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center border border-[#c7d28a]/40 text-[#c7d28a] flex-shrink-0">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-[10px] sm:text-xs tracking-tight text-[#c7d28a] truncate">Admin panel</p>
                                        </div>
                                    </Link>
                                    <Link href="/members" className="flex items-center gap-3 p-2.5 rounded-xl bg-[#c7d28a]/5 hover:bg-[#c7d28a]/10 border border-[#c7d28a]/20 hover:border-[#c7d28a]/40 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center border border-[#c7d28a]/40 text-[#c7d28a] flex-shrink-0">
                                            <Users className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold font-mono text-[10px] sm:text-xs tracking-tight uppercase text-[#c7d28a] truncate">Roster</p>
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
