"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useEvents, useMembers, useOrgSettings, getAttendanceIdsForOccurrence, type EventRecurrence } from "@/hooks/useFirestore";
import { fiscalLabelFromOrgSettings } from "@/lib/org-fiscal";
import {
    CalendarDays,
    Clock,
    MapPin,
    Users,
    Plus,
    Star,
    Loader2,
    X,
    Hash,
    Globe,
    Sparkles,
    Search,
    ClipboardCheck,
    Pencil,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { canEditEvents } from "@/lib/roles";
import { EventTimeSchedule, addMinutesToHHMM } from "@/components/event-time-schedule";
import {
    eventSeriesHasUpcoming,
    eventSeriesFullyPast,
    getListDisplayOccurrence,
    getNextOccurrenceRow,
    sortKeyUpcomingSeries,
    sortKeyPastSeries,
    sortKeyAllSeries,
} from "@/lib/recurring-events";

function formatOccurrenceDisplay(isoYmd: string): string {
    const d = new Date(isoYmd + "T12:00:00");
    if (isNaN(d.getTime())) return isoYmd;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type HousingHostPickerMember = { id: string; name: string };

function HousingHostsPicker({
    value,
    onChange,
    members,
    disabled,
}: {
    value: string[];
    onChange: (uids: string[]) => void;
    members: HousingHostPickerMember[];
    disabled?: boolean;
}) {
    const remove = (uid: string) => onChange(value.filter((x) => x !== uid));
    const add = (uid: string) => {
        if (!uid || value.includes(uid)) return;
        onChange([...value, uid]);
    };
    const available = members.filter((m) => !value.includes(m.id));
    return (
        <div className="space-y-2">
            {value.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                    {value.map((id) => {
                        const m = members.find((x) => x.id === id);
                        return (
                            <li
                                key={id}
                                className="flex items-center gap-1.5 rounded border border-border/50 bg-background/60 px-2 py-1 text-xs text-foreground"
                            >
                                <span className="max-w-[160px] truncate">{m?.name ?? id}</span>
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => remove(id)}
                                    className="shrink-0 p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive disabled:opacity-50"
                                    aria-label={`Remove ${m?.name ?? "host"}`}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="text-xs text-white/45">No hosts assigned</p>
            )}
            <select
                key={value.join(",")}
                value=""
                disabled={disabled || available.length === 0}
                onChange={(e) => {
                    const uid = e.target.value;
                    if (uid) add(uid);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm transition-colors focus:outline-none disabled:opacity-50"
            >
                <option value="">{available.length === 0 ? "All eligible members are hosts" : "Add host…"}</option>
                {available.map((m) => (
                    <option key={m.id} value={m.id}>
                        {m.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

const typeColors: Record<string, string> = {
    workshop: "bg-chart-1/10 border-chart-1/30 text-chart-1",
    meeting: "bg-primary/10 border-primary/30 text-primary",
    social: "bg-chart-3/10 border-chart-3/30 text-chart-3",
    hackathon: "bg-chart-5/10 border-chart-5/30 text-chart-5",
    presentation: "bg-chart-2/10 border-chart-2/30 text-chart-2",
    info_session: "bg-chart-4/10 border-chart-4/30 text-chart-4",
    networking: "bg-accent border-accent/30 text-accent-foreground",
};

const defaultEvent = {
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    type: "meeting",
    tags: "",
    maxAttendees: "",
    featured: false,
    virtualLink: "",
    isVirtual: false,
    isRecurring: false,
    recurrenceWeeks: 4,
    /** Housing host uids (set by admin / VP Events). */
    housingHostUids: [] as string[],
};

export default function EventsPage() {
    const { profile, user } = useAuth();
    const { data: events, loading, createEvent, updateEvent, deleteEvent, rsvp, cancelRsvp, setEventOccurrenceAttendance } = useEvents();
    const { data: orgSettings } = useOrgSettings(!!user?.uid);
    const clubFiscalLabel = fiscalLabelFromOrgSettings(
        orgSettings
            ? { fiscalTerm: orgSettings.fiscalTerm, fiscalYearTwoDigit: orgSettings.fiscalYearTwoDigit }
            : null
    );
    const { data: members, loading: membersLoading } = useMembers();
    const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newEvent, setNewEvent] = useState(defaultEvent);
    /** `${eventId}:${occurrenceYmd}` so recurring series attendance is per session. */
    const [attendancePanelKey, setAttendancePanelKey] = useState<string | null>(null);
    const [attendanceSearch, setAttendanceSearch] = useState("");
    const [attendanceSaving, setAttendanceSaving] = useState(false);
    const [editingEvent, setEditingEvent] = useState<typeof events[0] | null>(null);
    const [editForm, setEditForm] = useState(defaultEvent);
    const [editStatus, setEditStatus] = useState<string>("upcoming");
    const [editSaving, setEditSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const userCanEditEvents = canEditEvents(profile?.role);

    const openEdit = (event: typeof events[0]) => {
        // Prefer stored startTime/endTime (HH:mm); fall back to parsing event.time for legacy events
        let startTime = (event as { startTime?: string }).startTime?.trim() || "";
        let endTime = (event as { endTime?: string }).endTime?.trim() || "";
        if (!startTime && event.time?.trim()) {
            const parts = event.time.split(/\s*[–\-—]\s*|\s+to\s+/i).map((p) => p.trim()).filter(Boolean);
            startTime = parts[0] || "";
            endTime = parts[1] || "";
            const to24 = (t: string) => {
                const match = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
                if (!match) return t;
                let h = parseInt(match[1], 10);
                const m = match[2];
                const ampm = (match[3] || "").toUpperCase();
                if (ampm === "PM" && h < 12) h += 12;
                if (ampm === "AM" && h === 12) h = 0;
                return `${String(h).padStart(2, "0")}:${m}`;
            };
            if (startTime && !/^\d{2}:/.test(startTime) && /^\d{1,2}:\d{2}$/.test(startTime)) startTime = startTime.replace(/^(\d):/, "0$1:");
            if (endTime && !/^\d{2}:/.test(endTime) && /^\d{1,2}:\d{2}$/.test(endTime)) endTime = endTime.replace(/^(\d):/, "0$1:");
            startTime = to24(startTime);
            endTime = endTime ? to24(endTime) : "";
        }
        if (startTime && !endTime) {
            endTime = addMinutesToHHMM(startTime, 60);
        }
        const dateStr = /^\d{4}-\d{2}-\d{2}$/.test(event.date)
            ? event.date
            : event.date
                ? (() => {
                    const d = new Date(event.date);
                    if (!isNaN(d.getTime())) {
                        const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
                        return `${y}-${m}-${day}`;
                    }
                    return "";
                })()
                : "";
        const isVirtual = event.location?.toLowerCase().startsWith("virtual:");
        const rec = event.recurrence;
        setEditForm({
            title: event.title,
            description: event.description,
            date: dateStr,
            startTime,
            endTime,
            location: isVirtual ? "" : (event.location || ""),
            type: event.type,
            tags: (event.tags || []).join(", "),
            maxAttendees: event.maxAttendees != null ? String(event.maxAttendees) : "",
            featured: event.featured,
            virtualLink: isVirtual ? (event.location || "").replace(/^virtual:\s*/i, "") : "",
            isVirtual: !!isVirtual,
            isRecurring: !!(rec && rec.interval === "weekly" && rec.count > 1),
            recurrenceWeeks: rec?.count ?? 4,
            housingHostUids: [...(event.housingHostUids ?? [])],
        });
        setEditStatus(event.status || "upcoming");
        setEditingEvent(events.find((e) => e.id === event.id) ?? event);
    };

    const nonAlumniMembers = useMemo(() => members.filter((m) => m.role !== "alumni"), [members]);
    const hostPickerMembers = useMemo(
        () =>
            [...members]
                .filter((m) => m.status !== "pending" && m.status !== "rejected")
                .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
        [members]
    );
    const attendanceFilteredMembers = useMemo(() => {
        if (!attendanceSearch.trim()) return nonAlumniMembers;
        const q = attendanceSearch.toLowerCase().trim();
        return nonAlumniMembers.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
    }, [nonAlumniMembers, attendanceSearch]);

    const filtered = useMemo(() => {
        let list = events.filter((e) => typeFilter === "all" || e.type === typeFilter);
        if (filter === "upcoming") {
            list = list.filter((e) => eventSeriesHasUpcoming(e));
        } else if (filter === "past") {
            list = list.filter((e) => eventSeriesFullyPast(e));
        }
        if (filter === "upcoming") {
            return [...list].sort((a, b) => {
                const ma = sortKeyUpcomingSeries(a);
                const mb = sortKeyUpcomingSeries(b);
                if (ma !== mb) return ma - mb;
                return a.title.localeCompare(b.title);
            });
        }
        if (filter === "past") {
            return [...list].sort((a, b) => {
                const ma = sortKeyPastSeries(a);
                const mb = sortKeyPastSeries(b);
                if (ma !== mb) return mb - ma;
                return a.title.localeCompare(b.title);
            });
        }
        return [...list].sort((a, b) => {
            const ma = sortKeyAllSeries(a);
            const mb = sortKeyAllSeries(b);
            if (ma !== mb) return ma - mb;
            return a.title.localeCompare(b.title);
        });
    }, [events, filter, typeFilter]);

    const featured = useMemo(() => events.find((e) => e.featured && eventSeriesHasUpcoming(e)) ?? null, [events]);

    const featuredNextOccurrence = useMemo(
        () => (featured ? getNextOccurrenceRow(featured) : null),
        [featured]
    );

    const handleCreate = async () => {
        if (!newEvent.title.trim() || !newEvent.date) return;
        setCreating(true);
        try {
            const startTime = newEvent.startTime?.trim() || "";
            const endTime = newEvent.endTime?.trim() || "";

            const locationStr = newEvent.isVirtual && newEvent.virtualLink
                ? `Virtual: ${newEvent.virtualLink}`
                : newEvent.location;

            const baseDate = new Date(newEvent.date);
            baseDate.setMinutes(baseDate.getMinutes() + baseDate.getTimezoneOffset());
            const year0 = baseDate.getFullYear();
            const month0 = String(baseDate.getMonth() + 1).padStart(2, "0");
            const day0 = String(baseDate.getDate()).padStart(2, "0");
            const formattedDate = `${year0}-${month0}-${day0}`;

            const recurrence: EventRecurrence | null =
                newEvent.isRecurring && newEvent.recurrenceWeeks >= 2
                    ? { interval: "weekly", count: newEvent.recurrenceWeeks }
                    : null;

                await createEvent({
                    title: newEvent.title,
                    description: newEvent.description,
                    date: formattedDate,
                time: startTime && endTime ? `${startTime} – ${endTime}` : startTime || "",
                startTime,
                endTime,
                    location: locationStr,
                    type: newEvent.type,
                    status: "upcoming",
                    maxAttendees: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees) : null,
                    tags: newEvent.tags.split(",").map((t) => t.trim()).filter(Boolean),
                    featured: newEvent.featured,
                    createdBy: profile?.uid || "",
                    housingHostUids: newEvent.housingHostUids,
                recurrence,
                });

            setNewEvent(defaultEvent);
            setShowCreate(false);
        } catch (err) {
            console.error("Create event error:", err);
        } finally {
            setCreating(false);
        }
    };

    const handleRsvp = async (eventId: string) => {
        if (!profile?.uid) return;
        const event = events.find((e) => e.id === eventId);
        if (!event) return;
        if (event.attendees.includes(profile.uid)) {
            await cancelRsvp(eventId, profile.uid);
        } else {
            await rsvp(eventId, profile.uid);
        }
    };

    const toggleAttendance = async (eventId: string, occurrenceYmd: string, userId: string) => {
        const event = events.find((e) => e.id === eventId);
        if (!event || attendanceSaving) return;
        const cur = getAttendanceIdsForOccurrence(event, occurrenceYmd);
        const next = cur.includes(userId) ? cur.filter((id) => id !== userId) : [...cur, userId];
        setAttendanceSaving(true);
        try {
            await setEventOccurrenceAttendance(eventId, occurrenceYmd, next);
        } finally {
            setAttendanceSaving(false);
        }
    };

    const update = (field: string, value: string | boolean | number) =>
        setNewEvent((prev) => ({ ...prev, [field]: value }));

    const updateEditForm = (field: string, value: string | boolean | number) =>
        setEditForm((prev) => ({ ...prev, [field]: value }));

    const handleEdit = async () => {
        if (!editingEvent || !editForm.title.trim() || !editForm.date) return;
        setEditSaving(true);
        try {
            const startTime = editForm.startTime?.trim() || "";
            const endTime = editForm.endTime?.trim() || "";
            const locationStr = editForm.isVirtual && editForm.virtualLink
                ? `Virtual: ${editForm.virtualLink}`
                : editForm.location;
            const recurrence: EventRecurrence | null =
                editForm.isRecurring && editForm.recurrenceWeeks >= 2
                    ? { interval: "weekly", count: editForm.recurrenceWeeks }
                    : null;

            await updateEvent(editingEvent.id, {
                title: editForm.title,
                description: editForm.description,
                date: editForm.date,
                time: startTime && endTime ? `${startTime} – ${endTime}` : startTime || "",
                startTime,
                endTime,
                location: locationStr,
                type: editForm.type,
                status: editStatus,
                maxAttendees: editForm.maxAttendees ? parseInt(editForm.maxAttendees) : null,
                tags: editForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
                featured: editForm.featured,
                recurrence,
                housingHostUids: editForm.housingHostUids,
            });
            setEditingEvent(null);
        } catch (err) {
            console.error("Edit event error:", err);
        } finally {
            setEditSaving(false);
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        const series = events.find((e) => e.id === eventId);
        const msg =
            series?.recurrence && series.recurrence.count > 1
                ? "Delete this entire recurring series? All future occurrences will be removed. This cannot be undone."
                : "Delete this event? This cannot be undone.";
        if (!confirm(msg)) return;
        setDeletingId(eventId);
        try {
            await deleteEvent(eventId);
            setEditingEvent(null);
        } catch (err) {
            console.error("Delete event error:", err);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] animate-fade-in space-y-6 relative z-10">
            <PageHeader
                eyebrow={`Events · Fiscal ${clubFiscalLabel}`}
                title="Event calendar"
                description="Upcoming workshops, meetings, and club gatherings."
                actions={
                    userCanEditEvents ? (
                        <button
                            onClick={() => setShowCreate(true)}
                            className="etower-soft-btn etower-soft-btn--primary"
                        >
                            <Plus className="w-3.5 h-3.5" /> Create event
                        </button>
                    ) : undefined
                }
            />

            {/* Featured Event */}
            {featured && filter !== "past" && (
                <div className="etower-soft-card p-6 sm:p-8 relative group border-[#00ff41]/30">
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(0,255,65,0.1)] border border-[#00ff41]/30 text-[#00ff41] text-[10px] font-semibold">
                        <Star className="w-3 h-3 fill-current" /> Featured
                    </div>

                    <div className="relative z-10 lg:w-3/4">
                        <span className={cn("inline-block text-[10px] font-semibold px-3 py-1 mb-4 rounded-full border border-[rgba(0,255,65,0.18)] capitalize", typeColors[featured.type] || typeColors.meeting)}>
                            {featured.type.replace("_", " ")}
                        </span>

                        <h2 className="text-2xl font-bold mb-3 tracking-tight">{featured.title}</h2>
                        <p className="text-sm text-white/55 mb-6 leading-relaxed">
                            {featured.description}
                        </p>

                        <div className="flex flex-wrap gap-5 mb-8 border-l-2 border-[#00ff41]/30 pl-4 py-1">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-white/45 flex items-center gap-1.5"><CalendarDays className="w-3 h-3 text-[#00ff41]/70" /> Date</span>
                                <span className="text-xs font-semibold tracking-wide">
                                    {featuredNextOccurrence ? formatOccurrenceDisplay(featuredNextOccurrence.occurrenceDate) : formatOccurrenceDisplay(featured.date)}
                                </span>
                                {featured.recurrence && featured.recurrence.count > 1 && (
                                    <span className="text-[10px] text-[#00ff41]/90">Weekly</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-white/45 flex items-center gap-1.5"><Clock className="w-3 h-3 text-amber-400/70" /> Time</span>
                                <span className="text-xs font-semibold tracking-wide">{featured.time}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-white/45 flex items-center gap-1.5"><MapPin className="w-3 h-3 text-chart-2/70" /> Location</span>
                                <span className="text-xs font-semibold tracking-wide">{featured.location}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-white/45 flex items-center gap-1.5"><Users className="w-3 h-3 text-chart-4/70" /> Capacity</span>
                                <span className="text-xs font-semibold tracking-wide">
                                    {featured.attendees.length}{featured.maxAttendees && `/${featured.maxAttendees}`} attending
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleRsvp(featured.id)}
                            className={cn(
                                "etower-soft-btn etower-soft-btn--primary",
                                profile?.uid && featured.attendees.includes(profile.uid) && "etower-soft-btn--ghost"
                            )}
                        >
                            {profile?.uid && featured.attendees.includes(profile.uid) ? "Cancel RSVP" : "Confirm RSVP"}
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex etower-soft-card p-1 gap-1">
                    {(["all", "upcoming", "past"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "etower-soft-btn capitalize text-xs py-1.5 px-4",
                                filter === f
                                    ? "etower-soft-btn--primary"
                                    : "etower-soft-btn--ghost border-transparent"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="h-6 w-px bg-[rgba(0,255,65,0.18)] mx-1 hidden sm:block" />
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scroll">
                    {["all", "workshop", "meeting", "social", "hackathon", "presentation", "info_session", "networking"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={cn(
                                "etower-soft-btn text-xs py-1.5 px-3 capitalize whitespace-nowrap",
                                typeFilter === t
                                    ? "etower-soft-btn--primary"
                                    : "etower-soft-btn--ghost"
                            )}
                        >
                            {t.replace("_", " ")}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00ff41]" />
                    <span className="text-sm text-white/55">Loading calendar…</span>
                </div>
            )}

            {/* Event Cards */}
            {!loading && (
                <div className="flex-1 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((event, i) => {
                        const isAttending = profile?.uid ? event.attendees.includes(profile.uid) : false;
                        const isFull = event.maxAttendees ? event.attendees.length >= event.maxAttendees : false;
                        const displayOcc = getListDisplayOccurrence(event, filter);
                        const attendanceKey = `${event.id}:${displayOcc.occurrenceDate}`;
                        const showExpired = eventSeriesFullyPast(event);
                        const showRsvp = eventSeriesHasUpcoming(event);
                        return (
                            <div key={event.id} className={cn("group etower-soft-card p-5 transition-all hover:border-[#00ff41]/50 relative flex flex-col", showExpired && "opacity-60 saturate-50")}>
                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-start justify-between gap-2 mb-4 relative z-10">
                                    <span className={cn("etower-section-label px-2.5 py-1 border rounded-xl", typeColors[event.type] || typeColors.meeting)}>
                                        {event.type.replace("_", " ")}
                                    </span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {showExpired && <span className="text-xs text-white/45">Past</span>}
                                        {userCanEditEvents && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); openEdit(event); }}
                                                className="p-1.5 rounded-xl border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                                                title="Edit event"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg mb-2 tracking-tight group-hover:text-primary transition-colors relative z-10 line-clamp-1">{event.title}</h3>
                                {event.recurrence && event.recurrence.count > 1 && (
                                    <p className="text-[10px] text-primary tracking-wide mb-2 relative z-10">Weekly</p>
                                )}
                                <p className="text-xs text-muted-foreground mb-5 line-clamp-2 leading-relaxed flex-1 relative z-10">{event.description}</p>

                                <div className="space-y-2.5 mb-5 relative z-10 bg-background/50 p-3 border border-border/40">
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground tracking-wide">
                                        <CalendarDays className="w-3.5 h-3.5 flex-shrink-0 text-primary/70" />
                                        <span className="truncate">{formatOccurrenceDisplay(displayOcc.occurrenceDate)}</span>
                                    </div>
                                    {event.time && (
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground tracking-wide">
                                            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-warning/70" />
                                            <span className="truncate">{event.time}</span>
                                        </div>
                                    )}
                                    {event.location && (
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground tracking-wide">
                                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-chart-2/70" />
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="flex items-center gap-1.5 text-xs text-white/45">
                                        <Users className="w-3.5 h-3.5 border border-border/50 p-0.5" />
                                        {event.attendees.length}{event.maxAttendees && `/${event.maxAttendees}`}
                                        {isFull && <span className="text-destructive font-bold ml-1 animate-pulse">Full</span>}
                                    </div>
                                    <div className="flex gap-1.5 flex-wrap justify-end">
                                        {event.tags.slice(0, 2).map((tag) => (
                                            <span key={tag} className="text-[10px] text-white/45 px-2 py-0.5 border border-border/50 bg-background">{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                {showRsvp && (
                                    <button
                                        onClick={() => handleRsvp(event.id)}
                                        disabled={isFull && !isAttending}
                                        className={cn(
                                            "w-full py-2.5 rounded-xl text-xs font-semibold transition-all relative z-10 border",
                                            isAttending
                                                ? "bg-background border-primary/50 text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                                                : isFull
                                                    ? "bg-muted border-muted-foreground/30 text-muted-foreground cursor-not-allowed"
                                                    : "bg-primary border-primary text-primary-foreground hover:brightness-110"
                                        )}
                                    >
                                        {isAttending ? "Cancel RSVP" : isFull ? "FULL" : "RSVP"}
                                    </button>
                                )}

                                {/* Admin / Events role: take non-alumni attendance */}
                                {userCanEditEvents && (
                                    <div className="mt-4 pt-4 border-t border-border/40 relative z-10">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAttendancePanelKey((prev) => (prev === attendanceKey ? null : attendanceKey));
                                                setAttendanceSearch("");
                                            }}
                                            className="flex items-center gap-2 etower-section-label text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <ClipboardCheck className="w-3.5 h-3.5" />
                                            Attendance ({getAttendanceIdsForOccurrence(event, displayOcc.occurrenceDate).length})
                                            {attendancePanelKey === attendanceKey ? " ▼" : " ▶"}
                                        </button>
                                        {attendancePanelKey === attendanceKey && (
                                            <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                                                <div className="relative">
                                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                                    <input
                                                        type="text"
                                                        value={attendanceSearch}
                                                        onChange={(e) => setAttendanceSearch(e.target.value)}
                                                        placeholder="Search non-alumni..."
                                                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-background/50 border border-border/50 focus:border-primary/50 text-xs focus:outline-none"
                                                    />
                                                </div>
                                                <div className="max-h-[24vh] overflow-y-auto pr-1 custom-scroll">
                                                    {membersLoading ? (
                                                        <div className="flex items-center justify-center py-4 gap-2">
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                                            <span className="text-[10px] uppercase">Loading...</span>
                                                        </div>
                                                    ) : attendanceFilteredMembers.length === 0 ? (
                                                        <p className="text-[10px] text-muted-foreground uppercase py-2 text-center">
                                                            {attendanceSearch.trim() ? "No matches." : "No non-alumni members."}
                                                        </p>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {attendanceFilteredMembers.map((mem) => {
                                                                const present = getAttendanceIdsForOccurrence(event, displayOcc.occurrenceDate).includes(mem.id);
                                                                return (
                                                                    <button
                                                                        key={mem.id}
                                                                        type="button"
                                                                        onClick={() => toggleAttendance(event.id, displayOcc.occurrenceDate, mem.id)}
                                                                        disabled={attendanceSaving}
                                                                        className={cn(
                                                                            "px-2.5 py-1 rounded-xl text-xs transition-all border",
                                                                            present
                                                                                ? "bg-primary/10 text-primary border-primary"
                                                                                : "bg-card/40 border-border/40 text-muted-foreground hover:bg-accent hover:border-border"
                                                                        )}
                                                                    >
                                                                        {mem.name}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-16 etower-soft-card">
                    <CalendarDays className="w-16 h-16 text-muted-foreground/30 mb-4 relative z-10" />
                    <p className="text-xs text-muted-foreground tracking-wide relative z-10">
                        {userCanEditEvents ? "No events found. Create one to get started." : "No events currently scheduled."}
                    </p>
                </div>
            )}

            {/* ── Create Event Modal ── */}
            {showCreate && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
                    <div className="etower-soft-card max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border-[#00ff41]/30 animate-fade-in custom-scroll" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-20" />

                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50 sticky top-0 bg-card/95 backdrop-blur-md z-30">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    <span className="text-xs text-primary tracking-wide">Events</span>
                                </div>
                                <h3 className="font-bold text-xl tracking-tight flex items-center gap-2">
                                    <CalendarDays className="w-5 h-5 text-primary" /> New event
                                </h3>
                            </div>
                            <button onClick={() => setShowCreate(false)} className="p-2 rounded-xl border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors bg-background/50"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="p-6 space-y-5 relative z-10">
                            <div className="p-4 bg-background/40 border border-border/50 space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="etower-section-label mb-1.5 block">Event title <span className="text-primary">*</span></label>
                                    <input type="text" value={newEvent.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Weekly meetup" className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm transition-colors focus:outline-none" />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="etower-section-label mb-1.5 block">Description</label>
                                    <textarea rows={3} value={newEvent.description} onChange={(e) => update("description", e.target.value)} placeholder="Add event details…" className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm transition-colors focus:outline-none resize-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-background/40 border border-border/50">
                                    <label className="etower-section-label mb-1.5 block flex items-center gap-1.5">
                                        <CalendarDays className="w-3.5 h-3.5" /> Date <span className="text-primary">*</span>
                                    </label>
                                    <input type="date" value={newEvent.date} onChange={(e) => update("date", e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm transition-colors focus:outline-none uppercase" />
                                </div>
                            </div>

                            <EventTimeSchedule
                                label="Schedule"
                                startTime={newEvent.startTime}
                                endTime={newEvent.endTime}
                                onChange={({ startTime, endTime }) =>
                                    setNewEvent((prev) => ({ ...prev, startTime, endTime }))
                                }
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Event Type & Max Attendees */}
                                <div className="p-4 bg-background/40 border border-border/50">
                                    <label className="etower-section-label mb-1.5 block">Type</label>
                                    <select value={newEvent.type} onChange={(e) => update("type", e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm transition-colors focus:outline-none">
                                        <option value="meeting">Meeting</option>
                                        <option value="workshop">Workshop</option>
                                        <option value="social">Social</option>
                                        <option value="hackathon">Hackathon</option>
                                        <option value="presentation">Presentation</option>
                                        <option value="info_session">Info Session</option>
                                        <option value="networking">Networking</option>
                                    </select>
                                </div>
                                <div className="p-4 bg-background/40 border border-border/50">
                                    <label className="etower-section-label mb-1.5 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Max capacity</label>
                                    <input type="number" min="1" value={newEvent.maxAttendees} onChange={(e) => update("maxAttendees", e.target.value)} placeholder="Unlimited" className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm transition-colors focus:outline-none" />
                                </div>
                            </div>

                            {userCanEditEvents && (
                                <div className="p-4 bg-background/40 border border-border/50">
                                    <label className="etower-section-label mb-1.5 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" /> Event hosts (housing)
                                    </label>
                                    <HousingHostsPicker
                                        value={newEvent.housingHostUids}
                                        onChange={(uids) => setNewEvent((p) => ({ ...p, housingHostUids: uids }))}
                                        members={hostPickerMembers}
                                        disabled={membersLoading}
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                                        Each listed host gets +4 for this event; −3 on a saved roll if that host is absent.
                                    </p>
                                </div>
                            )}

                            {/* Location / Virtual Toggle */}
                            <div className="p-4 bg-background/40 border border-border/50">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="etower-section-label flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location</label>
                                    <button
                                        type="button"
                                        onClick={() => update("isVirtual", !newEvent.isVirtual)}
                                        className={cn("flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1 rounded-xl tracking-wide transition-all border", newEvent.isVirtual ? "bg-primary/10 border-primary/50 text-primary" : "bg-card/40 border-border/40 text-muted-foreground hover:text-foreground")}
                                    >
                                        <Globe className="w-3 h-3" /> {newEvent.isVirtual ? "Virtual" : "PHYSICAL"}
                                    </button>
                                </div>
                                {newEvent.isVirtual ? (
                                    <input type="url" value={newEvent.virtualLink} onChange={(e) => update("virtualLink", e.target.value)} placeholder="https://zoom.us/..." className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm transition-colors focus:outline-none" />
                                ) : (
                                    <input type="text" value={newEvent.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. Olin 102" className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm transition-colors focus:outline-none" />
                                )}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="p-4 bg-background/40 border border-border/50">
                            <label className="etower-section-label mb-1.5 flex items-center gap-1.5">
                                <Hash className="w-3.5 h-3.5" /> Tags <span className="opacity-50">(CSV)</span>
                            </label>
                            <input type="text" value={newEvent.tags} onChange={(e) => update("tags", e.target.value)} placeholder="e.g. networking, workshop" className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm transition-colors focus:outline-none" />
                            {newEvent.tags && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {newEvent.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                                        <span key={tag} className="text-[10px] px-2 py-0.5 border border-primary/30 bg-primary/10 text-primary uppercase">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recurrence & Featured Toggles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Recurring Toggle */}
                            <div className="p-4 bg-background/40 border border-border/50">
                                <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4 text-primary" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-foreground tracking-wide">Recurring event</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">One record — repeats weekly.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => update("isRecurring", !newEvent.isRecurring)}
                                        className={cn("w-10 h-5 border transition-all relative rounded-xl", newEvent.isRecurring ? "bg-primary/20 border-primary" : "bg-background/50 border-border/50")}
                                    >
                                        <span className={cn("absolute top-[1px] w-4 h-4 bg-primary transition-all", newEvent.isRecurring ? "left-[18px] shadow-[0_0_8px_rgba(203,247,2,1)]" : "left-0.5 bg-muted-foreground")} />
                                    </button>
                                </div>

                                <div className={cn("transition-all duration-300 overflow-hidden", newEvent.isRecurring ? "max-h-20 opacity-100 mt-2" : "max-h-0 opacity-0")}>
                                    <label className="etower-section-label mb-1.5 flex items-center justify-between">
                                        <span>Recurrence Range (Weeks)</span>
                                        <span className="text-primary">{newEvent.recurrenceWeeks} WKS</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="2"
                                        max="16"
                                        value={newEvent.recurrenceWeeks}
                                        onChange={(e) => update("recurrenceWeeks", parseInt(e.target.value))}
                                        className="w-full accent-primary"
                                    />
                                </div>
                            </div>

                            {/* Featured Toggle */}
                            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 p-4 rounded-xl relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(203,247,2,0.2) 0%, transparent 70%)' }} />
                                <div className="flex items-center gap-3 relative z-10 w-full justify-between">
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-primary tracking-wide leading-tight">Featured event</p>
                                            <p className="text-[10px] text-muted-foreground uppercase leading-tight mt-0.5 whitespace-nowrap">Pin to the dashboard feed.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => update("featured", !newEvent.featured)}
                                        className={cn("w-10 h-5 border transition-all relative rounded-xl shrink-0", newEvent.featured ? "bg-primary/20 border-primary" : "bg-background/50 border-border/50")}
                                    >
                                        <span className={cn("absolute top-[1px] w-4 h-4 bg-primary transition-all", newEvent.featured ? "left-[18px] shadow-[0_0_8px_rgba(203,247,2,1)]" : "left-0.5 bg-muted-foreground")} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 pt-2 flex gap-3 relative z-10">
                            <button onClick={() => setShowCreate(false)} className="flex-[1] py-3 rounded-xl border border-border/50 text-muted-foreground text-xs font-semibold hover:bg-accent hover:text-foreground transition-all">Cancel</button>
                            <button
                                onClick={handleCreate}
                                disabled={creating || !newEvent.title.trim() || !newEvent.date}
                                className="flex-[2] etower-soft-btn etower-soft-btn--primary disabled:opacity-50"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                {creating ? "Creating…" : "Create event"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit Event Modal ── */}
            {editingEvent && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingEvent(null)}>
                    <div className="etower-soft-card max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border-[#00ff41]/30 animate-fade-in custom-scroll" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-20" />
                        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50 sticky top-0 bg-card/95 backdrop-blur-md z-30">
                            <h3 className="font-bold text-xl tracking-tight flex items-center gap-2">
                                <Pencil className="w-5 h-5 text-primary" /> Edit event
                            </h3>
                            <button onClick={() => setEditingEvent(null)} className="p-2 rounded-xl border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors bg-background/50"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-6 space-y-5 relative z-10">
                            <div className="p-4 bg-background/40 border border-border/50 space-y-4">
                                <div>
                                    <label className="etower-section-label mb-1.5 block">Event title <span className="text-primary">*</span></label>
                                    <input type="text" value={editForm.title} onChange={(e) => updateEditForm("title", e.target.value)} placeholder="e.g. Weekly meetup" className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm transition-colors focus:outline-none" />
                                </div>
                                <div>
                                    <label className="etower-section-label mb-1.5 block">Description</label>
                                    <textarea rows={3} value={editForm.description} onChange={(e) => updateEditForm("description", e.target.value)} placeholder="Enter details..." className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm transition-colors focus:outline-none resize-none" />
                                </div>
                            </div>
                            <div className="p-4 bg-background/40 border border-border/50">
                                <label className="etower-section-label mb-1.5 block">Date <span className="text-primary">*</span></label>
                                <input type="date" value={editForm.date} onChange={(e) => updateEditForm("date", e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm focus:outline-none" />
                            </div>
                            <EventTimeSchedule
                                label="Schedule"
                                startTime={editForm.startTime}
                                endTime={editForm.endTime}
                                onChange={({ startTime, endTime }) =>
                                    setEditForm((prev) => ({ ...prev, startTime, endTime }))
                                }
                            />
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/40 border border-border/40 text-xs text-white/45">
                                <Clock className="w-4 h-4 text-primary shrink-0" />
                                <span>Previously saved:</span>
                                <span className="text-foreground font-bold normal-case tracking-normal">{editingEvent.time || "—"}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-background/40 border border-border/50">
                                    <label className="etower-section-label mb-1.5 block">Type</label>
                                    <select value={editForm.type} onChange={(e) => updateEditForm("type", e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm focus:outline-none">
                                        <option value="meeting">Meeting</option>
                                        <option value="workshop">Workshop</option>
                                        <option value="social">Social</option>
                                        <option value="hackathon">Hackathon</option>
                                        <option value="presentation">Presentation</option>
                                        <option value="info_session">Info Session</option>
                                        <option value="networking">Networking</option>
                                    </select>
                                </div>
                                <div className="p-4 bg-background/40 border border-border/50">
                                    <label className="etower-section-label mb-1.5 block">Status</label>
                                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm focus:outline-none">
                                        <option value="upcoming">Upcoming</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="past">Past</option>
                                    </select>
                                </div>
                            </div>
                            <div className="p-4 bg-background/40 border border-border/50">
                                <label className="etower-section-label mb-1.5 block">Max capacity</label>
                                <input type="number" min="1" value={editForm.maxAttendees} onChange={(e) => updateEditForm("maxAttendees", e.target.value)} placeholder="Unlimited" className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm focus:outline-none" />
                            </div>
                            {userCanEditEvents && (
                                <div className="p-4 bg-background/40 border border-border/50">
                                    <label className="etower-section-label mb-1.5 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" /> Event hosts (housing)
                                    </label>
                                    <HousingHostsPicker
                                        value={editForm.housingHostUids}
                                        onChange={(uids) => setEditForm((p) => ({ ...p, housingHostUids: uids }))}
                                        members={hostPickerMembers}
                                        disabled={membersLoading}
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                                        +4 per listed host; −3 on a saved roll if that host is absent.
                                    </p>
                                </div>
                            )}
                            <div className="p-4 bg-background/40 border border-border/50">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="etower-section-label">Location</label>
                                    <button type="button" onClick={() => updateEditForm("isVirtual", !editForm.isVirtual)} className={cn("flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1 rounded-xl tracking-wide border", editForm.isVirtual ? "bg-primary/10 border-primary/50 text-primary" : "bg-card/40 border-border/40 text-muted-foreground")}>
                                        <Globe className="w-3 h-3" /> {editForm.isVirtual ? "Virtual" : "PHYSICAL"}
                                    </button>
                                </div>
                                {editForm.isVirtual ? (
                                    <input type="url" value={editForm.virtualLink} onChange={(e) => updateEditForm("virtualLink", e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm focus:outline-none" />
                                ) : (
                                    <input type="text" value={editForm.location} onChange={(e) => updateEditForm("location", e.target.value)} placeholder="e.g. Olin 102" className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm focus:outline-none" />
                                )}
                            </div>
                            <div className="p-4 bg-background/40 border border-border/50">
                                <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4 text-primary" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-foreground tracking-wide">Recurring event</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">One record — repeats weekly.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateEditForm("isRecurring", !editForm.isRecurring)}
                                        className={cn("w-10 h-5 border transition-all relative rounded-xl", editForm.isRecurring ? "bg-primary/20 border-primary" : "bg-background/50 border-border/50")}
                                    >
                                        <span className={cn("absolute top-[1px] w-4 h-4 bg-primary transition-all", editForm.isRecurring ? "left-[18px] shadow-[0_0_8px_rgba(203,247,2,1)]" : "left-0.5 bg-muted-foreground")} />
                                    </button>
                                </div>
                                <div className={cn("transition-all duration-300 overflow-hidden", editForm.isRecurring ? "max-h-20 opacity-100 mt-2" : "max-h-0 opacity-0")}>
                                    <label className="etower-section-label mb-1.5 flex items-center justify-between">
                                        <span>Sessions (Weeks)</span>
                                        <span className="text-primary">{editForm.recurrenceWeeks}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="2"
                                        max="16"
                                        value={editForm.recurrenceWeeks}
                                        onChange={(e) => updateEditForm("recurrenceWeeks", parseInt(e.target.value, 10))}
                                        className="w-full accent-primary"
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-background/40 border border-border/50">
                                <label className="etower-section-label mb-1.5 block">Tags (Csv)</label>
                                <input type="text" value={editForm.tags} onChange={(e) => updateEditForm("tags", e.target.value)} placeholder="e.g. networking, workshop" className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 focus:border-primary/50 text-sm focus:outline-none" />
                            </div>
                            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 p-4 rounded-xl">
                                <span className="text-[10px] font-semibold text-primary tracking-wide">Featured event</span>
                                <button type="button" onClick={() => updateEditForm("featured", !editForm.featured)} className={cn("w-10 h-5 border transition-all relative rounded-xl", editForm.featured ? "bg-primary/20 border-primary" : "bg-background/50 border-border/50")}>
                                    <span className={cn("absolute top-[1px] w-4 h-4 bg-primary transition-all", editForm.featured ? "left-[18px]" : "left-0.5 bg-muted-foreground")} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 pt-2 flex flex-wrap gap-3 relative z-10 items-center justify-between">
                            <button
                                type="button"
                                onClick={() => editingEvent && handleDeleteEvent(editingEvent.id)}
                                disabled={editSaving || deletingId === editingEvent?.id}
                                className="flex items-center gap-2 py-3 px-4 rounded-xl border border-destructive/50 text-destructive text-xs font-semibold hover:bg-destructive/10 transition-all disabled:opacity-50"
                            >
                                {deletingId === editingEvent?.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                {deletingId === editingEvent?.id ? "Deleting…" : "Delete event"}
                            </button>
                            <div className="flex gap-3">
                                <button onClick={() => setEditingEvent(null)} className="py-3 px-5 rounded-xl border border-border/50 text-muted-foreground text-xs font-semibold hover:bg-accent hover:text-foreground transition-all">Cancel</button>
                                <button onClick={handleEdit} disabled={editSaving || !editForm.title.trim() || !editForm.date} className="py-3 px-5 etower-soft-card bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all focus:outline-none disabled:opacity-50 flex items-center justify-center gap-2">
                                    {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {editSaving ? "Saving…" : "Save changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
