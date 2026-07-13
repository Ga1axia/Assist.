"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { canAccessAdminCenter, getRoleLabel } from "@/lib/roles";
import { getResidencyLabel } from "@/lib/member-residency";
import { useFeed, useEvents, useActionItems, useOrgSettings } from "@/hooks/useFirestore";
import { fiscalLabelFromOrgSettings } from "@/lib/org-fiscal";
import type { EventOccurrenceRow } from "@/lib/recurring-events";
import { expandAllEventOccurrences, occurrenceEventLike } from "@/lib/recurring-events";
import {
    Activity,
    Clock,
    CheckCircle2,
    Loader2,
    Calendar,
    MapPin,
    CalendarDays,
    Users,
    X,
    Settings,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LinkifyText } from "@/components/linkify-text";
import { PageHeader } from "@/components/page-header";
import { parseEventDate, eventNotOccurredYet, getEventStartMs, formatEventTimePreview } from "@/lib/event-dates";

function formatOccurrenceDisplayShort(isoYmd: string): string {
    const d = new Date(isoYmd + "T12:00:00");
    if (isNaN(d.getTime())) return isoYmd;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

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
    const { data: orgSettings } = useOrgSettings(!!user?.uid);
    const clubFiscalLabel = fiscalLabelFromOrgSettings(
        orgSettings
            ? { fiscalTerm: orgSettings.fiscalTerm, fiscalYearTwoDigit: orgSettings.fiscalYearTwoDigit }
            : null
    );

    const userHasExecAccess = canAccessAdminCenter(profile?.role);
    const recentActivity = feedItems.slice(0, 8);
    const activeDeadlines = actionItems.slice(0, 10);

    const occurrenceRows = useMemo(() => expandAllEventOccurrences(events), [events]);

    const upcomingEvents = useMemo(() => {
        return occurrenceRows
            .filter((e) => eventNotOccurredYet(occurrenceEventLike(e)))
            .slice()
            .sort((a, b) => {
                const ma = getEventStartMs(occurrenceEventLike(a)) ?? Infinity;
                const mb = getEventStartMs(occurrenceEventLike(b)) ?? Infinity;
                if (ma !== mb) return ma - mb;
                return a.title.localeCompare(b.title);
            })
            .slice(0, 4);
    }, [occurrenceRows]);

    const [selectedWeekEvent, setSelectedWeekEvent] = useState<EventOccurrenceRow | null>(null);

    const today = new Date();
    const currentDayOfWeek = (today.getDay() + 6) % 7;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDayOfWeek);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return {
            date,
            dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
            dayNum: date.getDate(),
            isToday: date.toDateString() === today.toDateString(),
        };
    });

    const currentMonth = today.toLocaleString("default", { month: "long", year: "numeric" });
    const firstName = profile?.displayName?.split(" ")[0] || "Member";

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] animate-fade-in relative z-10 max-w-[1400px] mx-auto overflow-hidden text-sm">
            <PageHeader
                className="mb-4 pb-4 flex-shrink-0"
                eyebrow="Member portal"
                title={
                    <>
                        Welcome, <span className="text-[#00ff41]">{firstName}</span>
                    </>
                }
                description={`${getRoleLabel(profile?.role ?? "member", profile?.role)} · ${getResidencyLabel(profile?.residency ?? "resident")} · Fiscal ${clubFiscalLabel}`}
                actions={
                    userHasExecAccess ? (
                        <Link href="/admin" className="etower-soft-btn etower-soft-btn--ghost px-4 py-2 text-xs">
                            <Settings className="w-3.5 h-3.5" />
                            Admin
                        </Link>
                    ) : undefined
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-0 flex-1">
                {/* Left column */}
                <div className="flex flex-col gap-5 min-h-0 h-full">
                    {/* Upcoming deadlines */}
                    <div className="flex-1 min-h-0 flex flex-col etower-soft-card overflow-hidden">
                        <div className="p-4 border-b border-[rgba(0,255,65,0.14)] flex-shrink-0 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#00ff41]" />
                                <p className="etower-section-label">Upcoming deadlines</p>
                            </div>
                            <Link href="/projects" className="etower-soft-btn etower-soft-btn--ghost px-3 py-1.5 text-[10px]">
                                View all
                            </Link>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto custom-scroll">
                            {actionItemsLoading ? (
                                <div className="flex justify-center py-6">
                                    <Loader2 className="w-5 h-5 animate-spin text-[#00ff41]" />
                                </div>
                            ) : activeDeadlines.length === 0 ? (
                                <p className="text-xs text-white/45 text-center py-6">No upcoming deadlines.</p>
                            ) : (
                                <div className="space-y-3">
                                    {activeDeadlines.map((item) => {
                                        const isCompleted = user?.uid ? item.completedBy.includes(user.uid) : false;

                                        return (
                                            <div
                                                key={item.id}
                                                className={cn(
                                                    "flex flex-col gap-2 p-3 rounded-xl border transition-colors",
                                                    isCompleted
                                                        ? "border-[rgba(0,255,65,0.35)] bg-[rgba(0,255,65,0.06)]"
                                                        : "border-[rgba(0,255,65,0.12)] bg-[rgba(10,22,40,0.35)] hover:border-[rgba(0,255,65,0.28)]"
                                                )}
                                            >
                                                <div className="flex items-start justify-between min-w-0 gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p
                                                            className={cn(
                                                                "text-xs font-semibold truncate",
                                                                isCompleted ? "text-[#00ff41]" : "text-white"
                                                            )}
                                                        >
                                                            {item.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Clock className={cn("w-3 h-3", isCompleted ? "text-[#00ff41]/70" : "text-white/40")} />
                                                            <p className={cn("text-[10px] truncate", isCompleted ? "text-[#00ff41]/70" : "text-white/45")}>
                                                                Due {new Date(item.deadline).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={async () => {
                                                            if (user?.uid) {
                                                                await completeActionItem(item.id, user.uid, isCompleted);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "w-7 h-7 rounded-full flex items-center justify-center border transition-all cursor-pointer flex-shrink-0",
                                                            isCompleted
                                                                ? "bg-[#00ff41] text-[#0a0a0a] border-[#00ff41]"
                                                                : "bg-transparent border-[rgba(0,255,65,0.28)] hover:border-[#00ff41] hover:bg-[rgba(0,255,65,0.08)]"
                                                        )}
                                                    >
                                                        {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                                                    </button>
                                                </div>

                                                <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2 border-l-2 border-[rgba(0,255,65,0.2)] pl-2.5">
                                                    <LinkifyText className="inline">{item.description}</LinkifyText>
                                                </p>

                                                {item.type === "form" && item.link && (
                                                    <div className="mt-1 pt-2 border-t border-[rgba(0,255,65,0.12)] flex justify-between items-center">
                                                        <a
                                                            href={item.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="etower-soft-btn etower-soft-btn--primary px-3 py-1.5 text-[10px]"
                                                        >
                                                            Open form
                                                        </a>
                                                        {isCompleted && (
                                                            <span className="text-[10px] font-semibold text-[#00ff41]">
                                                                Completed
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

                    {/* Upcoming events */}
                    <div className="flex-1 min-h-0 flex flex-col etower-soft-card overflow-hidden">
                        <div className="p-4 border-b border-[rgba(0,255,65,0.14)] flex-shrink-0 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#00ff41]" />
                                <p className="etower-section-label">Upcoming events</p>
                            </div>
                            <Link href="/events" className="etower-soft-btn etower-soft-btn--ghost px-3 py-1.5 text-[10px]">
                                View all
                            </Link>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto custom-scroll">
                            {eventsLoading ? (
                                <div className="flex justify-center py-6">
                                    <Loader2 className="w-5 h-5 animate-spin text-[#00ff41]" />
                                </div>
                            ) : upcomingEvents.length === 0 ? (
                                <p className="text-xs text-white/45 text-center py-6">No upcoming events.</p>
                            ) : (
                                <div className="space-y-2.5">
                                    {upcomingEvents.map((event) => (
                                        <Link
                                            key={event.instanceKey}
                                            href="/events"
                                            className="group flex flex-col gap-1.5 p-3 rounded-xl border border-[rgba(0,255,65,0.12)] bg-[rgba(10,22,40,0.35)] hover:border-[rgba(0,255,65,0.3)] transition-colors"
                                        >
                                            <p className="text-xs font-semibold truncate text-white group-hover:text-[#00ff41] transition-colors">
                                                {event.title}
                                            </p>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-3 text-[10px] text-white/45">
                                                    <span className="flex items-center gap-1 shrink-0">
                                                        <Calendar className="w-3 h-3 text-[#00ff41]/70" />
                                                        {formatOccurrenceDisplayShort(event.occurrenceDate)}
                                                    </span>
                                                    <span className="flex items-center gap-1 shrink-0">
                                                        <Clock className="w-3 h-3 text-white/40" />
                                                        {formatEventTimePreview(occurrenceEventLike(event)) || "All day"}
                                                    </span>
                                                </div>
                                                {event.location && (
                                                    <span className="flex items-center gap-1 text-[10px] text-white/45 truncate">
                                                        <MapPin className="w-3 h-3 text-[#00ff41]/70 shrink-0" />
                                                        {event.location}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Middle column: activity feed */}
                <div className="flex flex-col etower-soft-card overflow-hidden min-h-0 h-full">
                    <div className="p-4 border-b border-[rgba(0,255,65,0.14)] flex-shrink-0 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#00ff41]" />
                            <p className="etower-section-label">Recent activity</p>
                        </div>
                        <Link href="/feed" className="etower-soft-btn etower-soft-btn--ghost px-3 py-1.5 text-[10px]">
                            View feed
                        </Link>
                    </div>

                    <div className="p-2 flex-1 overflow-y-auto custom-scroll">
                        {feedLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <Loader2 className="w-6 h-6 animate-spin text-[#00ff41]" />
                                <span className="text-[10px] text-white/45">Loading…</span>
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="text-center py-12">
                                <Activity className="w-10 h-10 text-white/20 mx-auto mb-3" />
                                <p className="text-xs text-white/45">No recent activity yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 px-2 pb-2">
                                {recentActivity.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start gap-3 p-3 rounded-xl border border-[rgba(0,255,65,0.12)] bg-[rgba(10,22,40,0.35)] hover:border-[rgba(0,255,65,0.28)] transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm border border-[rgba(0,255,65,0.2)] bg-[rgba(0,255,65,0.06)]">
                                            {typeEmoji[activity.type] || "📌"}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <p className="text-xs leading-relaxed">
                                                <span className="font-semibold text-white">{activity.actorName}</span>{" "}
                                                <span className="text-white/55">
                                                    <LinkifyText>{activity.description}</LinkifyText>
                                                </span>
                                                {activity.targetName && (
                                                    <span className="text-[#00ff41] font-semibold ml-1">{activity.targetName}</span>
                                                )}
                                            </p>
                                            <p className="text-[10px] text-white/40 mt-1.5 flex items-center gap-1.5">
                                                <Clock className="w-2.5 h-2.5" />
                                                {activity.createdAt}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-5 min-h-0 h-full">
                    {/* Week calendar */}
                    <div className="flex-1 min-h-0 flex flex-col etower-soft-card overflow-hidden">
                        <div className="p-4 border-b border-[rgba(0,255,65,0.14)] flex-shrink-0 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-[#00ff41]" />
                                <p className="etower-section-label">This week</p>
                            </div>
                            <span className="text-[10px] font-semibold text-[#00ff41] px-2.5 py-1 rounded-full border border-[rgba(0,255,65,0.25)] bg-[rgba(0,255,65,0.06)]">
                                {currentMonth}
                            </span>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-center">
                            <div className="grid grid-rows-7 gap-1.5 h-full py-1">
                                {weekDays.map((day, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-1.5 sm:py-2 text-xs rounded-xl transition-colors",
                                            day.isToday
                                                ? "bg-[rgba(0,255,65,0.12)] border border-[#00ff41]/70 font-semibold text-[#00ff41]"
                                                : "bg-[rgba(10,22,40,0.35)] border border-[rgba(0,255,65,0.12)] hover:border-[rgba(0,255,65,0.28)] text-white/70"
                                        )}
                                    >
                                        <span className="shrink-0 tracking-wide">
                                            {day.dayName.substring(0, 3)} {day.dayNum}
                                        </span>
                                        <div className="flex items-center gap-1.5 overflow-hidden justify-end">
                                            {occurrenceRows
                                                .filter((e) => eventNotOccurredYet(occurrenceEventLike(e)))
                                                .filter((e) => {
                                                    const d = parseEventDate(e.occurrenceDate);
                                                    if (!d) return false;
                                                    return (
                                                        d.getDate() === day.date.getDate() &&
                                                        d.getMonth() === day.date.getMonth() &&
                                                        d.getFullYear() === day.date.getFullYear()
                                                    );
                                                })
                                                .slice(0, 2)
                                                .map((evt) => {
                                                    const timeLabel = formatEventTimePreview(occurrenceEventLike(evt));
                                                    return (
                                                        <button
                                                            key={evt.instanceKey}
                                                            type="button"
                                                            onClick={() => setSelectedWeekEvent(evt)}
                                                            className={cn(
                                                                "px-2 py-1 min-w-0 text-left rounded-lg border leading-tight max-w-[92px] sm:max-w-[118px] flex flex-col gap-0.5 transition-colors",
                                                                day.isToday
                                                                    ? "bg-[rgba(0,255,65,0.15)] border-[rgba(0,255,65,0.35)] text-[#00ff41] hover:bg-[rgba(0,255,65,0.22)]"
                                                                    : "bg-[rgba(0,255,65,0.05)] border-[rgba(0,255,65,0.18)] text-white/80 hover:border-[rgba(0,255,65,0.35)]"
                                                            )}
                                                            title={`${evt.title}${timeLabel ? ` — ${timeLabel}` : evt.time ? ` — ${evt.time}` : ""}`}
                                                        >
                                                            <span className="text-[8px] tracking-wide truncate font-semibold">
                                                                {evt.title}
                                                            </span>
                                                            <span className="text-[7px] tracking-tight truncate opacity-70">
                                                                {timeLabel || "All day"}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Admin quick links */}
                    {userHasExecAccess && (
                        <div className="flex-shrink-0 etower-soft-card p-4">
                            <p className="etower-section-label mb-3">Administration</p>
                            <div className="grid grid-cols-2 gap-3">
                                <Link
                                    href="/admin"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(0,255,65,0.18)] bg-[rgba(10,22,40,0.35)] hover:border-[#00ff41]/70 hover:bg-[rgba(0,255,65,0.06)] transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center border border-[rgba(0,255,65,0.25)] bg-[rgba(0,255,65,0.08)] text-[#00ff41] flex-shrink-0">
                                        <Settings className="w-3.5 h-3.5" />
                                    </div>
                                    <p className="font-semibold text-xs text-[#00ff41] truncate">Admin center</p>
                                </Link>
                                <Link
                                    href="/members"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(0,255,65,0.18)] bg-[rgba(10,22,40,0.35)] hover:border-[#00ff41]/70 hover:bg-[rgba(0,255,65,0.06)] transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center border border-[rgba(0,255,65,0.25)] bg-[rgba(0,255,65,0.08)] text-[#00ff41] flex-shrink-0">
                                        <Users className="w-3.5 h-3.5" />
                                    </div>
                                    <p className="font-semibold text-xs text-white truncate">Members</p>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Week event detail modal */}
            {selectedWeekEvent && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={() => setSelectedWeekEvent(null)}
                >
                    <div
                        className="etower-soft-card max-w-md w-full p-6 animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4 border-b border-[rgba(0,255,65,0.14)] pb-3">
                            <h3 className="font-semibold text-lg tracking-tight text-white">{selectedWeekEvent.title}</h3>
                            <button
                                type="button"
                                onClick={() => setSelectedWeekEvent(null)}
                                className="p-1.5 rounded-full border border-[rgba(0,255,65,0.22)] text-white/50 hover:text-white hover:border-[#00ff41] hover:bg-[rgba(0,255,65,0.08)] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2 text-[11px] text-white/50">
                                <Calendar className="w-3.5 h-3.5 text-[#00ff41]/70" />
                                <span className="text-white font-semibold">
                                    {formatOccurrenceDisplayShort(selectedWeekEvent.occurrenceDate)}
                                </span>
                            </div>
                            {selectedWeekEvent.recurrence && selectedWeekEvent.recurrence.count > 1 && (
                                <p className="text-[10px] text-[#00ff41]/80">
                                    Part of weekly series · {selectedWeekEvent.recurrence.count} sessions
                                </p>
                            )}
                            <div className="flex items-center gap-2 text-[11px] text-white/50">
                                <Clock className="w-3.5 h-3.5 text-white/40" />
                                <span>Time:</span>
                                <span className="text-white font-semibold">{selectedWeekEvent.time || "Not set"}</span>
                            </div>
                            {selectedWeekEvent.location && (
                                <div className="flex items-center gap-2 text-[11px] text-white/50">
                                    <MapPin className="w-3.5 h-3.5 text-[#00ff41]/70" />
                                    <span className="text-white truncate">{selectedWeekEvent.location}</span>
                                </div>
                            )}
                            <div className="pt-2 border-t border-[rgba(0,255,65,0.12)]">
                                <p className="etower-section-label mb-1.5 text-[10px]">Description</p>
                                <p className="text-xs text-white/80 leading-relaxed max-h-32 overflow-y-auto custom-scroll">
                                    {selectedWeekEvent.description || "No description provided."}
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 pt-4 border-t border-[rgba(0,255,65,0.12)]">
                            <Link href="/events" className="etower-soft-btn etower-soft-btn--primary w-full py-2.5 text-xs">
                                View full calendar
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
