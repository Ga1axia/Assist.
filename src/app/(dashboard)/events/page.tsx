"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useEvents } from "@/hooks/useFirestore";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isAdmin } from "@/lib/roles";

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
};

export default function EventsPage() {
    const { profile } = useAuth();
    const { data: events, loading, createEvent, rsvp, cancelRsvp } = useEvents();
    const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newEvent, setNewEvent] = useState(defaultEvent);
    const userIsAdmin = isAdmin(profile?.role);

    const filtered = events
        .filter((e) => filter === "all" || e.status === filter || (filter === "upcoming" && e.status === "ongoing"))
        .filter((e) => typeFilter === "all" || e.type === typeFilter);

    const featured = events.find((e) => e.featured);

    const handleCreate = async () => {
        if (!newEvent.title.trim() || !newEvent.date) return;
        setCreating(true);
        try {
            const timeStr = newEvent.startTime
                ? newEvent.endTime
                    ? `${newEvent.startTime} – ${newEvent.endTime}`
                    : newEvent.startTime
                : "";

            const locationStr = newEvent.isVirtual && newEvent.virtualLink
                ? `Virtual: ${newEvent.virtualLink}`
                : newEvent.location;

            const baseDate = new Date(newEvent.date);
            // Must fix the timezone offset issue when parsing YYYY-MM-DD
            baseDate.setMinutes(baseDate.getMinutes() + baseDate.getTimezoneOffset());

            const weeksToGenerate = newEvent.isRecurring ? newEvent.recurrenceWeeks : 1;

            for (let i = 0; i < weeksToGenerate; i++) {
                const targetDate = new Date(baseDate);
                targetDate.setDate(targetDate.getDate() + (i * 7));

                // Format back to YYYY-MM-DD
                const year = targetDate.getFullYear();
                const month = String(targetDate.getMonth() + 1).padStart(2, '0');
                const day = String(targetDate.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;

                await createEvent({
                    title: newEvent.title,
                    description: newEvent.description,
                    date: formattedDate,
                    time: timeStr,
                    location: locationStr,
                    type: newEvent.type,
                    status: "upcoming",
                    maxAttendees: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees) : null,
                    tags: newEvent.tags.split(",").map((t) => t.trim()).filter(Boolean),
                    featured: newEvent.featured,
                    createdBy: profile?.uid || "",
                });
            }

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

    const update = (field: string, value: string | boolean | number) =>
        setNewEvent((prev) => ({ ...prev, [field]: value }));

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] animate-fade-in space-y-6 relative z-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-border/50">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-primary/80 uppercase tracking-widest mb-1.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        EVENTS
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">
                        OPERATIONAL <span className="gradient-text-cyber">CALENDAR</span>
                    </h1>
                </div>
                {userIsAdmin && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="hud-panel-sm bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all glow-border-strong flex items-center gap-2 group"
                    >
                        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" /> CREATE EVENT
                    </button>
                )}
            </div>

            {/* Featured Event */}
            {featured && filter !== "past" && (
                <div className="hud-panel-alt bg-card/60 border border-primary/40 p-6 sm:p-8 relative scanlines animate-border-pulse group">
                    <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-r from-transparent to-primary/50" />

                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-[10px] font-mono font-bold uppercase tracking-widest glow-border">
                        <Star className="w-3 h-3 fill-primary animate-pulse" /> FEATURED EVENT
                    </div>

                    <div className="relative z-10 lg:w-3/4">
                        <span className={cn("inline-block text-[10px] font-mono font-bold px-3 py-1 mb-4 uppercase tracking-widest border border-border/50", typeColors[featured.type] || typeColors.meeting)}>
                            TYPE: {featured.type.replace("_", " ")}
                        </span>

                        <h2 className="text-2xl font-black mb-3 uppercase tracking-tight">{featured.title}</h2>
                        <p className="text-sm font-mono text-muted-foreground mb-6 leading-relaxed">
                            <span className="text-primary mr-2">&gt;</span>{featured.description}
                        </p>

                        <div className="flex flex-wrap gap-5 mb-8 border-l-2 border-primary/30 pl-4 py-1">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><CalendarDays className="w-3 h-3 text-primary/70" /> T-MINUS D-DAY</span>
                                <span className="text-xs font-bold font-mono tracking-wide">{featured.date}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3 text-warning/70" /> CHRONO SYNC</span>
                                <span className="text-xs font-bold font-mono tracking-wide">{featured.time}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><MapPin className="w-3 h-3 text-chart-2/70" /> Location</span>
                                <span className="text-xs font-bold font-mono tracking-wide">{featured.location}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Users className="w-3 h-3 text-chart-4/70" /> Spots</span>
                                <span className="text-xs font-bold font-mono tracking-wide">
                                    {featured.attendees.length}{featured.maxAttendees && `/${featured.maxAttendees}`} people
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleRsvp(featured.id)}
                            className={cn(
                                "hud-panel bg-primary text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all glow-border shadow-[0_0_15px_rgba(203,247,2,0.3)]",
                                profile?.uid && featured.attendees.includes(profile.uid) && "bg-background text-primary border border-primary hover:bg-primary/10"
                            )}
                        >
                            {profile?.uid && featured.attendees.includes(profile.uid) ? "CANCEL RSVP" : "CONFIRM RSVP"}
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-card/40 border border-border/50 p-1">
                    {(["all", "upcoming", "past"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 text-[10px] font-mono font-bold transition-all uppercase tracking-widest",
                                filter === f
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="h-6 w-px bg-border/50 mx-1 hidden sm:block" />
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scroll">
                    {["all", "workshop", "meeting", "social", "hackathon", "presentation", "info_session", "networking"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={cn(
                                "px-3 py-1.5 hud-panel-sm text-[10px] font-mono font-bold transition-all uppercase tracking-widest border whitespace-nowrap",
                                typeFilter === t
                                    ? "bg-primary/10 border-primary/50 text-primary"
                                    : "bg-background/40 border-border/40 text-muted-foreground hover:text-foreground hover:bg-accent"
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
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-xs font-mono text-primary uppercase tracking-widest animate-pulse">QUERYING CALENDAR...</span>
                </div>
            )}

            {/* Event Cards */}
            {!loading && (
                <div className="flex-1 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((event, i) => {
                        const isAttending = profile?.uid ? event.attendees.includes(profile.uid) : false;
                        const isFull = event.maxAttendees ? event.attendees.length >= event.maxAttendees : false;
                        return (
                            <div key={event.id} className={cn("group bg-card/60 border border-border/40 p-5 transition-all hover:border-primary/50 scanlines relative flex flex-col", i % 2 === 0 ? 'hud-panel' : 'hud-corners', event.status === "past" && "opacity-60 saturate-50")}>
                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <span className={cn("text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 border hud-panel-sm", typeColors[event.type] || typeColors.meeting)}>
                                        {event.type.replace("_", " ")}
                                    </span>
                                    {event.status === "past" && <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">EXPIRED</span>}
                                </div>
                                <h3 className="font-bold text-lg mb-2 uppercase tracking-tight group-hover:text-primary transition-colors relative z-10 line-clamp-1">{event.title}</h3>
                                <p className="text-xs font-mono text-muted-foreground mb-5 line-clamp-2 leading-relaxed flex-1 relative z-10">{event.description}</p>

                                <div className="space-y-2.5 mb-5 relative z-10 bg-background/50 p-3 border border-border/40">
                                    <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                                        <CalendarDays className="w-3.5 h-3.5 flex-shrink-0 text-primary/70" />
                                        <span className="truncate">{event.date}</span>
                                    </div>
                                    {event.time && (
                                        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                                            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-warning/70" />
                                            <span className="truncate">{event.time}</span>
                                        </div>
                                    )}
                                    {event.location && (
                                        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-chart-2/70" />
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                                        <Users className="w-3.5 h-3.5 border border-border/50 p-0.5" />
                                        {event.attendees.length}{event.maxAttendees && `/${event.maxAttendees}`}
                                        {isFull && <span className="text-destructive font-bold ml-1 animate-pulse">Full</span>}
                                    </div>
                                    <div className="flex gap-1.5 flex-wrap justify-end">
                                        {event.tags.slice(0, 2).map((tag) => (
                                            <span key={tag} className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border border-border/50 bg-background">{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                {event.status === "upcoming" && (
                                    <button
                                        onClick={() => handleRsvp(event.id)}
                                        disabled={isFull && !isAttending}
                                        className={cn(
                                            "w-full py-2.5 hud-panel-sm text-xs font-mono font-bold uppercase tracking-widest transition-all glow-border relative z-10 border",
                                            isAttending
                                                ? "bg-background border-primary/50 text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                                                : isFull
                                                    ? "bg-muted border-muted-foreground/30 text-muted-foreground cursor-not-allowed"
                                                    : "bg-primary border-primary text-primary-foreground hover:brightness-110"
                                        )}
                                    >
                                        {isAttending ? "CANCEL RSVP" : isFull ? "FULL" : "RSVP"}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-16 hud-panel bg-card/40 border border-border/40 scanlines">
                    <CalendarDays className="w-16 h-16 text-muted-foreground/30 mb-4 relative z-10" />
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest relative z-10">
                        {userIsAdmin ? "NO EVENTS FOUND. CREATE ONE TO GET STARTED." : "NO EVENTS CURRENTLY SCHEDULED."}
                    </p>
                </div>
            )}

            {/* ── Create Event Modal ── */}
            {showCreate && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
                    <div className="hud-panel bg-card border border-primary/40 max-w-2xl w-full max-h-[90vh] overflow-y-auto scanlines noise relative glow-border animate-fade-in custom-scroll" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-20" />

                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50 sticky top-0 bg-card/95 backdrop-blur-md z-30">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] font-mono text-primary uppercase tracking-widest">E-Board only</span>
                                </div>
                                <h3 className="font-black text-xl uppercase tracking-tight flex items-center gap-2">
                                    <CalendarDays className="w-5 h-5 text-primary" /> NEW EVENT DETAILS
                                </h3>
                            </div>
                            <button onClick={() => setShowCreate(false)} className="p-2 hud-panel-sm border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors bg-background/50"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="p-6 space-y-5 relative z-10">
                            <div className="p-4 hud-corners bg-background/40 border border-border/50 space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">EVENT TITLE <span className="text-primary">*</span></label>
                                    <input type="text" value={newEvent.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. ALL HANDS MEETING" className="w-full px-4 py-2.5 hud-panel-sm bg-background/60 border border-border/50 focus:border-primary/50 text-sm font-mono uppercase transition-colors focus:outline-none" />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">MISSION BRIEF / DESC</label>
                                    <textarea rows={3} value={newEvent.description} onChange={(e) => update("description", e.target.value)} placeholder="Enter operational details..." className="w-full px-4 py-2.5 hud-panel-sm bg-background/60 border border-border/50 focus:border-primary/50 text-sm font-mono transition-colors focus:outline-none resize-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Date */}
                                <div className="p-4 hud-corners bg-background/40 border border-border/50">
                                    <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block flex items-center gap-1.5">
                                        <CalendarDays className="w-3.5 h-3.5" /> DEPLOYMENT DATE <span className="text-primary">*</span>
                                    </label>
                                    <input type="date" value={newEvent.date} onChange={(e) => update("date", e.target.value)} className="w-full px-4 py-2.5 hud-panel-sm bg-background/60 border border-border/50 focus:border-primary/50 text-sm font-mono transition-colors focus:outline-none uppercase" />
                                </div>

                                {/* Time Row */}
                                <div className="p-4 hud-corners bg-background/40 border border-border/50 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> T-START</label>
                                        <input type="time" value={newEvent.startTime} onChange={(e) => update("startTime", e.target.value)} className="w-full px-3 py-2.5 hud-panel-sm bg-background/60 border border-border/50 focus:border-primary/50 text-sm font-mono transition-colors focus:outline-none uppercase" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">T-END</label>
                                        <input type="time" value={newEvent.endTime} onChange={(e) => update("endTime", e.target.value)} className="w-full px-3 py-2.5 hud-panel-sm bg-background/60 border border-border/50 focus:border-primary/50 text-sm font-mono transition-colors focus:outline-none uppercase" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Event Type & Max Attendees */}
                                <div className="p-4 hud-corners bg-background/40 border border-border/50">
                                    <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">CLASSIFICATION</label>
                                    <select value={newEvent.type} onChange={(e) => update("type", e.target.value)} className="w-full px-4 py-2.5 hud-panel-sm bg-background/60 border border-border/50 focus:border-primary/50 text-sm font-mono uppercase transition-colors focus:outline-none">
                                        <option value="meeting">MEETING</option>
                                        <option value="workshop">WORKSHOP</option>
                                        <option value="social">SOCIAL</option>
                                        <option value="hackathon">HACKATHON</option>
                                        <option value="presentation">PRESENTATION</option>
                                        <option value="info_session">INFO SESSION</option>
                                        <option value="networking">NETWORKING</option>
                                    </select>
                                </div>
                                <div className="p-4 hud-corners bg-background/40 border border-border/50">
                                    <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Max attendees</label>
                                    <input type="number" min="1" value={newEvent.maxAttendees} onChange={(e) => update("maxAttendees", e.target.value)} placeholder="N/A (UNLIMITED)" className="w-full px-4 py-2.5 hud-panel-sm bg-background/60 border border-border/50 focus:border-primary/50 text-sm font-mono uppercase transition-colors focus:outline-none" />
                                </div>
                            </div>

                            {/* Location / Virtual Toggle */}
                            <div className="p-4 hud-corners bg-background/40 border border-border/50">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location</label>
                                    <button
                                        type="button"
                                        onClick={() => update("isVirtual", !newEvent.isVirtual)}
                                        className={cn("flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1 hud-panel-sm uppercase tracking-widest transition-all border", newEvent.isVirtual ? "bg-primary/10 border-primary/50 text-primary" : "bg-card/40 border-border/40 text-muted-foreground hover:text-foreground")}
                                    >
                                        <Globe className="w-3 h-3" /> {newEvent.isVirtual ? "REMOTE UPLINK" : "PHYSICAL"}
                                    </button>
                                </div>
                                {newEvent.isVirtual ? (
                                    <input type="url" value={newEvent.virtualLink} onChange={(e) => update("virtualLink", e.target.value)} placeholder="https://zoom.us/..." className="w-full px-4 py-2.5 hud-panel-sm bg-background/60 border border-border/50 focus:border-primary/50 text-sm font-mono transition-colors focus:outline-none" />
                                ) : (
                                    <input type="text" value={newEvent.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. OLIN 102" className="w-full px-4 py-2.5 hud-panel-sm bg-background/60 border border-border/50 focus:border-primary/50 text-sm font-mono uppercase transition-colors focus:outline-none" />
                                )}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="p-4 hud-corners bg-background/40 border border-border/50">
                            <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <Hash className="w-3.5 h-3.5" /> TAGS <span className="opacity-50">(CSV)</span>
                            </label>
                            <input type="text" value={newEvent.tags} onChange={(e) => update("tags", e.target.value)} placeholder="e.g. REACT, FRONTEND" className="w-full px-4 py-2.5 hud-panel-sm bg-background/60 border border-border/50 focus:border-primary/50 text-sm font-mono uppercase transition-colors focus:outline-none" />
                            {newEvent.tags && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {newEvent.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                                        <span key={tag} className="text-[9px] font-mono px-2 py-0.5 border border-primary/30 bg-primary/10 text-primary uppercase">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recurrence & Featured Toggles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Recurring Toggle */}
                            <div className="p-4 hud-corners bg-background/40 border border-border/50">
                                <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4 text-primary" />
                                        <div>
                                            <p className="text-[10px] font-mono font-bold text-foreground uppercase tracking-widest">RECURRING EVENT</p>
                                            <p className="text-[9px] font-mono text-muted-foreground uppercase">Duplicate weekly.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => update("isRecurring", !newEvent.isRecurring)}
                                        className={cn("w-10 h-5 border transition-all relative hud-panel-sm", newEvent.isRecurring ? "bg-primary/20 border-primary" : "bg-background/50 border-border/50")}
                                    >
                                        <span className={cn("absolute top-[1px] w-4 h-4 bg-primary transition-all", newEvent.isRecurring ? "left-[18px] glow-border shadow-[0_0_8px_rgba(203,247,2,1)]" : "left-0.5 bg-muted-foreground")} />
                                    </button>
                                </div>

                                <div className={cn("transition-all duration-300 overflow-hidden", newEvent.isRecurring ? "max-h-20 opacity-100 mt-2" : "max-h-0 opacity-0")}>
                                    <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center justify-between">
                                        <span>RECURRENCE RANGE (WEEKS)</span>
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
                            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 p-4 hud-panel-sm relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(203,247,2,0.2) 0%, transparent 70%)' }} />
                                <div className="flex items-center gap-3 relative z-10 w-full justify-between">
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                                        <div>
                                            <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest leading-tight">FEATURED EVENT</p>
                                            <p className="text-[9px] font-mono text-muted-foreground uppercase leading-tight mt-0.5 whitespace-nowrap">Pin to global dashboard feed.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => update("featured", !newEvent.featured)}
                                        className={cn("w-10 h-5 border transition-all relative hud-panel-sm shrink-0", newEvent.featured ? "bg-primary/20 border-primary" : "bg-background/50 border-border/50")}
                                    >
                                        <span className={cn("absolute top-[1px] w-4 h-4 bg-primary transition-all", newEvent.featured ? "left-[18px] glow-border shadow-[0_0_8px_rgba(203,247,2,1)]" : "left-0.5 bg-muted-foreground")} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 pt-2 flex gap-3 relative z-10">
                            <button onClick={() => setShowCreate(false)} className="flex-[1] py-3 hud-panel-sm border border-border/50 text-muted-foreground text-xs font-mono font-bold uppercase tracking-widest hover:bg-accent hover:text-foreground transition-all">CANCEL</button>
                            <button
                                onClick={handleCreate}
                                disabled={creating || !newEvent.title.trim() || !newEvent.date}
                                className="flex-[2] py-3 hud-panel bg-primary text-primary-foreground text-xs font-mono font-bold uppercase tracking-widest hover:brightness-110 transition-all glow-border focus:outline-none disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                {creating ? "INITIALIZING..." : "EXECUTE DEPLOYMENT"}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}
