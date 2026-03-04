"use client";

import { useAuth } from "@/contexts/auth-context";
import {
    User,
    Mail,
    Calendar,
    Trophy,
    FolderKanban,
    BookOpen,
    Star,
    Edit3,
    MessageCircle,
    Palette,
    Terminal,
    Target,
    Shield,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const { profile } = useAuth();
    const [standoutSkill, setStandoutSkill] = useState(profile?.standoutSkill || "");
    const [editing, setEditing] = useState(false);

    const engagementMetrics = [
        { label: "SYNC RATE", value: "92%", icon: <Calendar className="w-4 h-4" />, color: "text-chart-1", border: "border-chart-1/40", bg: "bg-chart-1/5" },
        { label: "MISSIONS", value: "3", icon: <FolderKanban className="w-4 h-4" />, color: "text-primary", border: "border-primary/40", bg: "bg-primary/5" },
        { label: "DATA UPL.", value: "7", icon: <BookOpen className="w-4 h-4" />, color: "text-chart-2", border: "border-chart-2/40", bg: "bg-chart-2/5" },
        { label: "PROPOSALS", value: "2", icon: <Target className="w-4 h-4" />, color: "text-chart-5", border: "border-chart-5/40", bg: "bg-chart-5/5" },
    ];

    const projectHistory = [
        { name: "WEATHER DASHBOARD", role: "DEVELOPER", status: "SECURED" },
        { name: "COMMUNITY PORTAL", role: "LEAD", status: "ACTIVE" },
        { name: "DATA VIZ TOOL", role: "DESIGNER", status: "PRE-DEV" },
    ];

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] animate-fade-in space-y-6 relative z-10 max-w-5xl mx-auto">
            {/* Header */}
            <div className="border-b border-border/50 pb-5">
                <div className="flex items-center gap-2 text-[10px] font-mono text-primary/80 uppercase tracking-widest mb-1.5">
                    <User className="w-3.5 h-3.5" />
                    SYSTEM_MODULE / USER_DATA
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase relative group inline-block">
                    OPERATIVE <span className="gradient-text-cyber">DOSSIER</span>
                </h1>
            </div>

            {/* Profile Card */}
            <div className="hud-panel bg-card/60 border border-primary/40 overflow-hidden relative scanlines">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none" />

                <div className="h-28 sm:h-36 bg-gradient-to-r from-background via-card to-background relative border-b border-border/50">
                    <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <div className="absolute -bottom-10 sm:-bottom-12 left-6 sm:left-8 z-10">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 hud-corners bg-background/80 backdrop-blur-md border border-primary text-primary flex items-center justify-center text-3xl sm:text-4xl font-black shadow-[0_0_15px_rgba(203,247,2,0.3)]">
                            {profile?.displayName?.[0]?.toUpperCase() || "U"}
                        </div>
                    </div>
                </div>

                <div className="pt-14 sm:pt-16 px-6 sm:px-8 pb-8 relative z-10">
                    <h2 className="text-2xl font-black uppercase tracking-tight">{profile?.displayName || "UNKNOWN OPERATIVE"}</h2>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest bg-background/50 border border-border/50 px-3 py-1">
                            <Mail className="w-3.5 h-3.5" />
                            {profile?.email}
                        </span>
                        <span className="text-[10px] items-center gap-1.5 font-mono font-bold px-3 py-1 border hud-panel-sm bg-primary border-primary text-primary-foreground uppercase tracking-widest shadow-[0_0_10px_rgba(203,247,2,0.3)]">
                            <Shield className="w-3 h-3 inline mr-1" />
                            CLR: {profile?.role}
                        </span>
                    </div>

                    {/* Standout Skill */}
                    <div className="mt-8 p-5 hud-panel-sm bg-background/40 border border-border/40 relative group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 group-hover:bg-primary transition-colors" />
                        <div className="flex items-center justify-between mb-3 pl-2">
                            <h3 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Star className="w-4 h-4 text-primary" />
                                PRIMARY DESIGNATION
                            </h3>
                            <button onClick={() => setEditing(!editing)} className="text-[10px] font-mono font-bold px-3 py-1 hud-panel-sm bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-1.5 uppercase">
                                <Terminal className="w-3 h-3" />
                                {editing ? "COMMIT" : "OVERRIDE"}
                            </button>
                        </div>
                        <div className="pl-2">
                            {editing ? (
                                <input
                                    type="text"
                                    value={standoutSkill}
                                    onChange={(e) => setStandoutSkill(e.target.value)}
                                    placeholder="ENTER DESIGNATION..."
                                    className="w-full px-4 py-2.5 hud-panel-sm bg-card border border-primary/50 text-sm font-mono uppercase focus:outline-none glow-border"
                                    autoFocus
                                />
                            ) : (
                                <p className="text-lg font-black font-mono tracking-tight uppercase text-foreground/90 glow-text-subtle">
                                    <span className="text-primary/50 mr-2">&gt;</span>
                                    {standoutSkill || "AWAITING INPUT"}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Engagement Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {engagementMetrics.map((metric) => (
                    <div key={metric.label} className={cn("hud-corners bg-card/60 p-5 text-center relative scanlines overflow-hidden group border", metric.border, metric.bg)}>
                        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none" style={{ background: `radial-gradient(circle, var(--${metric.color.split('-')[1]}) 0%, transparent 70%)`, opacity: 0.1 }} />
                        <div className={cn("w-10 h-10 hud-corners flex items-center justify-center mx-auto mb-3 border relative z-10", metric.border, "bg-background/80")}>
                            {metric.icon}
                        </div>
                        <div className={cn("text-3xl font-black tracking-tighter mb-1 relative z-10", metric.color.split(' ')[0])}>{metric.value}</div>
                        <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest relative z-10">{metric.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Project History */}
                <div className="lg:col-span-2 hud-panel-alt bg-card/60 border border-border/40 p-6 sm:p-8 scanlines relative">
                    <div className="absolute top-0 right-0 w-1 h-32 bg-gradient-to-b from-primary/50 to-transparent" />

                    <h2 className="text-lg font-bold uppercase tracking-tight mb-6 flex items-center gap-3 relative z-10 border-b border-border/40 pb-4">
                        <FolderKanban className="w-5 h-5 text-primary" />
                        MISSION LOGS
                    </h2>

                    <div className="space-y-4 relative z-10">
                        {projectHistory.map((project, i) => (
                            <div
                                key={i}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hud-panel-sm bg-background/50 border border-border/40 hover:border-primary/40 transition-colors group gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 hud-corners bg-card flex items-center justify-center text-muted-foreground group-hover:text-primary border border-border/50 text-sm font-black transition-colors">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold font-mono tracking-tight uppercase group-hover:text-primary transition-colors">{project.name}</p>
                                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">
                                            ROLE: <span className="text-foreground">{project.role}</span>
                                        </p>
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-[9px] font-mono font-bold px-3 py-1 border hud-panel-sm uppercase tracking-widest self-start sm:self-auto",
                                    project.status === "SECURED" ? "bg-success/10 border-success/30 text-success" :
                                        project.status === "ACTIVE" ? "bg-primary/10 border-primary/30 text-primary glow-border" :
                                            "bg-warning/10 border-warning/30 text-warning"
                                )}>
                                    {project.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="hud-corners bg-card/60 border border-border/40 p-6 sm:p-8 scanlines relative h-fit">
                    <h2 className="text-lg font-bold uppercase tracking-tight mb-6 flex items-center gap-3 relative z-10 border-b border-border/40 pb-4">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        COMMS PREFS
                    </h2>

                    <div className="space-y-4 relative z-10">
                        <label className="flex items-start justify-between p-4 hud-panel-sm bg-background/50 border border-border/40 hover:border-primary/40 transition-colors cursor-pointer group">
                            <div className="pr-4">
                                <p className="text-sm font-bold font-mono uppercase tracking-tight group-hover:text-primary transition-colors">STANDARD INTEL</p>
                                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">Receive updates via email protocol</p>
                            </div>
                            <div className="w-12 h-6 border border-primary hud-panel-sm bg-primary/20 relative cursor-pointer shrink-0 mt-1">
                                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-primary transition-all glow-border shadow-[0_0_8px_rgba(203,247,2,1)]" />
                            </div>
                        </label>

                        <label className="flex items-start justify-between p-4 hud-panel-sm bg-background/50 border border-border/40 hover:border-primary/40 transition-colors cursor-pointer group">
                            <div className="pr-4">
                                <p className="text-sm font-bold font-mono uppercase tracking-tight group-hover:text-primary transition-colors">PRIORITY ALERTS</p>
                                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">Receive alerts via secure WhatsApp line</p>
                            </div>
                            <div className="w-12 h-6 border border-border/50 hud-panel-sm bg-card relative cursor-pointer shrink-0 mt-1">
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-muted-foreground/40 transition-all" />
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
