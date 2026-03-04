"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import {
    ArrowLeft,
    GitBranch,
    Users,
    ExternalLink,
    MessageSquare,
    CheckCircle2,
    Circle,
    Clock,
    Bug,
    AlertTriangle,
    Info,
    Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mockProject = {
    id: "1",
    name: "Weather Dashboard",
    description: "A real-time weather dashboard with interactive maps and forecasts for Babson campus.",
    status: "development",
    githubUrl: "https://github.com/code-club/weather-dashboard",
    teamMembers: [
        { uid: "1", role: "lead", name: "John Smith" },
        { uid: "2", role: "developer", name: "Sarah Chen" },
        { uid: "3", role: "designer", name: "Alex Johnson" },
    ],
    milestones: [
        { id: "m1", name: "Project Setup", status: "complete", dueDate: "Feb 15", assignees: ["John"] },
        { id: "m2", name: "UI Mockups", status: "complete", dueDate: "Feb 22", assignees: ["Alex"] },
        { id: "m3", name: "API Integration", status: "in_progress", dueDate: "Mar 5", assignees: ["Sarah"] },
        { id: "m4", name: "Testing & QA", status: "pending", dueDate: "Mar 12", assignees: ["John", "Sarah"] },
        { id: "m5", name: "Deployment", status: "pending", dueDate: "Mar 15", assignees: ["John"] },
    ],
    notes: [
        { id: "n1", author: "Sarah Chen", content: "API rate limiting from weather service — need to implement caching layer", type: "blocker", timestamp: "2 hours ago" },
        { id: "n2", author: "Alex Johnson", content: "Updated the color palette based on team feedback, looks much cleaner now", type: "update", timestamp: "Yesterday" },
        { id: "n3", author: "John Smith", content: "Sprint review scheduled for Thursday, 3pm in the maker space", type: "general", timestamp: "2 days ago" },
    ],
};

const statusIcons: Record<string, React.ReactNode> = {
    complete: <CheckCircle2 className="w-4 h-4 text-success" />,
    in_progress: <Clock className="w-4 h-4 text-primary" />,
    pending: <Circle className="w-4 h-4 text-muted-foreground" />,
};

const noteTypeIcons: Record<string, { icon: React.ReactNode; color: string; border: string }> = {
    blocker: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "text-destructive bg-destructive/10", border: "border-destructive/30" },
    bug: { icon: <Bug className="w-3.5 h-3.5" />, color: "text-warning bg-warning/10", border: "border-warning/30" },
    update: { icon: <Info className="w-3.5 h-3.5" />, color: "text-chart-1 bg-chart-1/10", border: "border-chart-1/30" },
    general: { icon: <MessageSquare className="w-3.5 h-3.5" />, color: "text-muted-foreground bg-secondary", border: "border-border/50" },
};

export default function ProjectDetailPage() {
    const { profile } = useAuth();
    const [newNote, setNewNote] = useState("");
    const [noteType, setNoteType] = useState("general");

    const completedMilestones = mockProject.milestones.filter((m) => m.status === "complete").length;
    const progress = Math.round((completedMilestones / mockProject.milestones.length) * 100);

    return (
        <div className="space-y-6 animate-fade-in relative z-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start gap-4 pb-6 border-b border-border/50">
                <Link
                    href="/projects"
                    className="p-2 hud-panel-sm bg-background border border-border/40 hover:border-primary/50 hover:text-primary transition-colors text-muted-foreground mt-1"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-primary/80 uppercase tracking-widest mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        PROJECT OVERVIEW
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">
                            {mockProject.name}
                        </h1>
                        <span className="text-[10px] font-mono font-bold px-3 py-1 hud-panel-sm bg-primary/10 text-primary uppercase tracking-widest border border-primary/20">
                            STATUS: {mockProject.status}
                        </span>
                    </div>
                    <p className="text-muted-foreground text-sm font-mono mt-2 leading-relaxed max-w-2xl">{mockProject.description}</p>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    {mockProject.githubUrl && (
                        <a
                            href={mockProject.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 px-5 py-2.5 hud-panel-sm bg-background border border-border/50 text-xs font-mono font-bold uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-colors"
                        >
                            <GitBranch className="w-4 h-4" />
                            SOURCE CODE
                            <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-50" />
                        </a>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Milestone Timeline */}
                    <div className="hud-panel bg-card/60 border border-border/40 p-6 sm:p-8 scanlines relative">
                        <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-r from-transparent to-primary/50" />

                        <div className="flex items-center justify-between mb-6 border-b border-border/40 pb-4 relative z-10">
                            <h2 className="font-black text-xl tracking-tight uppercase">MISSION TRAJECTORY</h2>
                            <span className="text-xs font-mono font-bold text-primary tracking-widest px-3 py-1 bg-primary/10 border border-primary/20 hud-panel-sm">{progress}% COMPLETE</span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-border/50 overflow-hidden mb-8 relative z-10">
                            <div
                                className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(203,247,2,0.5)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Timeline */}
                        <div className="space-y-0 relative z-10">
                            {mockProject.milestones.map((milestone, i) => (
                                <div key={milestone.id} className="flex gap-4 group">
                                    {/* Timeline line */}
                                    <div className="flex flex-col items-center">
                                        <div className="mt-1 bg-background rounded-full p-0.5 relative z-10 group-hover:scale-110 transition-transform">
                                            {statusIcons[milestone.status]}
                                        </div>
                                        {i < mockProject.milestones.length - 1 && (
                                            <div className={cn(
                                                "w-0.5 flex-1 my-1 opacity-50",
                                                milestone.status === "complete" ? "bg-success shadow-[0_0_8px_rgba(var(--success),0.8)]" : "bg-border/60"
                                            )} />
                                        )}
                                    </div>
                                    {/* Content */}
                                    <div className="pb-6 flex-1 pt-0.5">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className={cn(
                                                    "text-sm font-bold font-mono uppercase tracking-tight transition-colors",
                                                    milestone.status === "complete" ? "text-muted-foreground/50 line-through" : "text-foreground group-hover:text-primary"
                                                )}>
                                                    {milestone.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {milestone.assignees.map((a) => (
                                                        <span key={a} className="text-[10px] font-mono px-2 py-0.5 hud-panel-sm bg-accent/50 text-muted-foreground uppercase border border-border/30">
                                                            @{a}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{milestone.dueDate}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Internal Notes */}
                    <div className="hud-panel-alt bg-card/60 border border-border/40 p-6 sm:p-8 relative scanlines">
                        <div className="absolute top-0 right-0 w-1 h-32 bg-gradient-to-b from-primary/50 to-transparent" />

                        <div className="flex items-center gap-2 mb-6 border-b border-border/40 pb-4 relative z-10">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            <h2 className="font-black text-xl tracking-tight uppercase">PROJECT LOGS</h2>
                        </div>

                        {/* Add note */}
                        <div className="mb-6 p-4 hud-corners bg-background/50 border border-border/50 relative z-10">
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 custom-scroll">
                                {(["general", "blocker", "bug", "update"] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setNoteType(type)}
                                        className={cn(
                                            "text-[10px] font-mono px-3 py-1.5 font-bold uppercase tracking-widest transition-all hud-panel-sm border whitespace-nowrap",
                                            noteType === type
                                                ? cn(noteTypeIcons[type].color, noteTypeIcons[type].border)
                                                : "bg-card/40 border-border/40 text-muted-foreground hover:bg-accent hover:border-border"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="APPEND LOG ENTRY..."
                                    className="flex-1 px-4 py-2.5 hud-panel-sm bg-background/60 border border-border/50 focus:border-primary/50 text-sm font-mono uppercase tracking-wide transition-colors focus:outline-none"
                                />
                                <button className="px-5 py-2.5 hud-panel-sm bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center glow-border group">
                                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Notes list */}
                        <div className="space-y-4 relative z-10">
                            {mockProject.notes.map((note) => (
                                <div key={note.id} className="p-4 hud-panel-sm bg-background/40 border border-border/40 hover:border-primary/30 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 hud-corners bg-card flex items-center justify-center text-foreground font-black border border-border/50 text-sm shrink-0">
                                            {note.author.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="text-xs font-bold font-mono uppercase">{note.author}</span>
                                                <span className={cn("text-[10px] font-mono px-2 py-0.5 font-bold uppercase tracking-widest border", noteTypeIcons[note.type].color, noteTypeIcons[note.type].border)}>
                                                    {note.type}
                                                </span>
                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{note.timestamp}</span>
                                            </div>
                                            <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                                                <span className="text-primary/50 mr-2">&gt;</span>
                                                {note.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Team Members */}
                    <div className="hud-corners bg-card/60 border border-border/40 p-6 scanlines relative group">
                        <div className="relative z-10">
                            <h2 className="font-bold font-mono tracking-tight uppercase mb-5 flex items-center gap-2 pb-3 border-b border-border/40">
                                <Users className="w-5 h-5 text-primary group-hover:text-primary transition-colors" />
                                ASSIGNED PERSONNEL ({mockProject.teamMembers.length})
                            </h2>
                            <div className="space-y-3">
                                {mockProject.teamMembers.map((member) => (
                                    <div key={member.uid} className="flex items-center gap-3 p-2 hover:bg-accent/40 transition-colors rounded">
                                        <div className="w-8 h-8 hud-corners bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                                            {member.name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold font-mono uppercase truncate tracking-tight">{member.name}</p>
                                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="hud-corners bg-card/60 border border-border/40 p-6 scanlines relative">
                        <div className="relative z-10">
                            <h2 className="font-bold font-mono tracking-tight uppercase mb-5 pb-3 border-b border-border/40">PROJECT METRICS</h2>
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">STATUS</span>
                                    <span className="text-sm font-bold font-mono uppercase tracking-tight text-primary">{mockProject.status}</span>
                                </div>
                                <div className="w-full h-px bg-border/40" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">MILESTONES SECURED</span>
                                    <span className="text-sm font-bold font-mono tracking-tight">{completedMilestones} / {mockProject.milestones.length}</span>
                                </div>
                                <div className="w-full h-px bg-border/40" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">LOG ENTRIES</span>
                                    <span className="text-sm font-bold font-mono tracking-tight">{mockProject.notes.length}</span>
                                </div>
                                <div className="w-full h-px bg-border/40" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">UNIT SIZE</span>
                                    <span className="text-sm font-bold font-mono tracking-tight">{mockProject.teamMembers.length} ACTIVE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
