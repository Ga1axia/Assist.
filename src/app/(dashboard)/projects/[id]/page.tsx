"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProjects, useMembers } from "@/hooks/useFirestore";
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
    CheckSquare,
    Square,
    Search,
    Plus,
    Trash2,
    Loader2,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TEAM_ROLES = ["lead", "developer", "designer", "member"] as const;

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
    const { profile } = useAuth();
    const { data: projects, loading, addProjectTask, updateProjectTask, removeProjectTask, updateProject } = useProjects();
    const { data: members, loading: membersLoading } = useMembers();
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [taskSubmitting, setTaskSubmitting] = useState(false);
    const [memberSearch, setMemberSearch] = useState("");
    const [teamUpdating, setTeamUpdating] = useState(false);

    const project = projects.find((p) => p.id === id);
    const isTeamMember = project && profile && project.teamMembers.some((m) => m.uid === profile.uid);
    const tasks = project?.tasks ?? [];

    const addedUids = useMemo(() => new Set(project?.teamMembers?.map((m) => m.uid) ?? []), [project?.teamMembers]);
    const nonAlumniMembers = useMemo(() => members.filter((m) => m.role !== "alumni"), [members]);
    const filteredMemberList = useMemo(
        () => {
            if (!memberSearch.trim()) return nonAlumniMembers;
            const q = memberSearch.toLowerCase().trim();
            return nonAlumniMembers.filter(
                (m) =>
                    m.name.toLowerCase().includes(q) ||
                    m.email.toLowerCase().includes(q)
            );
        },
        [nonAlumniMembers, memberSearch]
    );

    const addProjectMember = async (uid: string, name: string, role: string = "member") => {
        if (!project || addedUids.has(uid) || teamUpdating) return;
        setTeamUpdating(true);
        try {
            const next = [...project.teamMembers, { uid, role, name }];
            await updateProject(project.id, { teamMembers: next });
        } finally {
            setTeamUpdating(false);
        }
    };
    const removeProjectMember = async (uid: string) => {
        if (!project || teamUpdating) return;
        if (project.teamMembers.length <= 1) return;
        if (uid === profile?.uid && project.teamMembers.filter((m) => m.role === "lead").length <= 1) return;
        setTeamUpdating(true);
        try {
            const next = project.teamMembers.filter((m) => m.uid !== uid);
            await updateProject(project.id, { teamMembers: next });
        } finally {
            setTeamUpdating(false);
        }
    };
    const setProjectMemberRole = async (uid: string, role: string) => {
        if (!project || teamUpdating) return;
        setTeamUpdating(true);
        try {
            const next = project.teamMembers.map((m) => (m.uid === uid ? { ...m, role } : m));
            await updateProject(project.id, { teamMembers: next });
        } finally {
            setTeamUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Clock className="w-8 h-8 animate-spin text-primary" />
                <span className="text-xs font-mono text-primary uppercase tracking-widest animate-pulse">DECRYPTING ARCHIVE...</span>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
                <Terminal className="w-12 h-12 text-destructive mb-2" />
                <h1 className="text-2xl font-black uppercase tracking-widest text-destructive">DATA_CORRUPTION</h1>
                <p className="text-muted-foreground font-mono text-sm">The requested project file could not be located in the directory.</p>
                <Link href="/projects" className="mt-4 px-6 py-3 hud-panel-sm bg-background border border-border/50 hover:bg-primary/10 hover:text-primary transition-colors font-mono text-xs font-bold uppercase tracking-widest">
                    RETURN TO DIRECTORY
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
                        <span className="text-xs font-mono uppercase tracking-widest font-bold">MISSING VISUAL ASSET</span>
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
                                    <p className="text-xs uppercase tracking-widest font-bold">NO PROJECT LOG AVAILABLE.</p>
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
                                        <div className="text-xs font-bold font-mono uppercase tracking-widest">LIVE APP DEPLOYMENT</div>
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
                                        <div className="text-xs font-bold font-mono uppercase tracking-widest">SOURCE_CODE / REPO</div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 opacity-50 group-hover/git:opacity-100 transition-opacity" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Personnel — same tag UI as new project form / onboarding */}
                    <div className="hud-panel bg-card/60 border border-border/40 p-6 sm:p-8 scanlines relative">
                        <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-4 relative z-10">
                            <h2 className="font-bold text-lg font-mono tracking-tight uppercase flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" /> PROJECT CONTRIBUTORS
                            </h2>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                                {project.teamMembers.length} SELECTED
                            </span>
                        </div>
                        <div className="space-y-4 relative z-10">
                            {isTeamMember && (
                                <>
                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={memberSearch}
                                            onChange={(e) => setMemberSearch(e.target.value)}
                                            placeholder="Search by name or email..."
                                            className="w-full pl-10 pr-4 py-2.5 hud-panel-sm bg-background/50 border border-border/50 focus:border-primary/50 text-sm font-mono transition-colors focus:outline-none"
                                        />
                                    </div>

                                    {/* Selected pills — same as new project form */}
                                    {project.teamMembers.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {project.teamMembers.map((m) => (
                                                <div
                                                    key={m.uid}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-primary/20 border border-primary text-primary text-[10px] font-mono uppercase tracking-wider"
                                                >
                                                    <select
                                                        value={m.role}
                                                        onChange={(e) => setProjectMemberRole(m.uid, e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        disabled={teamUpdating}
                                                        className="bg-transparent border-none focus:outline-none cursor-pointer text-[10px] font-mono font-bold uppercase text-primary pr-0.5 min-w-0 disabled:opacity-70"
                                                    >
                                                        {TEAM_ROLES.map((r) => (
                                                            <option key={r} value={r}>{r}</option>
                                                        ))}
                                                    </select>
                                                    <span className="truncate max-w-[100px]">{m.name || m.uid.slice(0, 8)}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProjectMember(m.uid)}
                                                        disabled={
                                                            teamUpdating ||
                                                            project.teamMembers.length <= 1 ||
                                                            (m.uid === profile?.uid && project.teamMembers.filter((x) => x.role === "lead").length <= 1)
                                                        }
                                                        className="p-0.5 text-primary/80 hover:text-primary hover:bg-primary/20 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                                                        title="Remove from project"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Directory — clickable tags like new project form */}
                                    <div className="max-h-[40vh] overflow-y-auto space-y-4 pr-2 custom-scroll">
                                        {membersLoading ? (
                                            <div className="flex flex-col items-center justify-center py-8 gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Loading directory...</p>
                                            </div>
                                        ) : filteredMemberList.length === 0 ? (
                                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest py-4 text-center">
                                                {memberSearch.trim() ? "No matching members." : "No non-alumni members in directory."}
                                            </p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {filteredMemberList.map((mem) => {
                                                    const onTeam = addedUids.has(mem.id);
                                                    return (
                                                        <button
                                                            key={mem.id}
                                                            type="button"
                                                            onClick={() =>
                                                                onTeam
                                                                    ? removeProjectMember(mem.id)
                                                                    : addProjectMember(mem.id, mem.name)
                                                            }
                                                            disabled={teamUpdating || (onTeam && project.teamMembers.length <= 1) || (onTeam && mem.id === profile?.uid && project.teamMembers.filter((x) => x.role === "lead").length <= 1)}
                                                            className={cn(
                                                                "px-3 py-1.5 hud-panel-sm text-xs font-mono transition-all border",
                                                                onTeam
                                                                    ? "bg-primary/10 text-primary border-primary glow-border"
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
                                </>
                            )}
                            {!isTeamMember && (
                                <div className="flex flex-wrap gap-1.5">
                                    {project.teamMembers.map((m) => (
                                        <div
                                            key={m.uid}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-card/60 border border-border/50 text-muted-foreground text-[10px] font-mono uppercase tracking-wider"
                                        >
                                            <span className="text-primary/80">{m.role}</span>
                                            <span className="truncate max-w-[100px]">{m.name || m.uid.slice(0, 8)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tasks */}
                    <div className="hud-panel bg-card/60 border border-border/40 p-6 scanlines relative group">
                        <h2 className="font-bold font-mono tracking-tight uppercase mb-4 flex items-center gap-2 pb-3 border-b border-border/40">
                            <CheckSquare className="w-5 h-5 text-primary" />
                            TASKS
                            {tasks.length > 0 && (
                                <span className="text-[10px] font-mono text-muted-foreground font-normal">
                                    {tasks.filter((t) => t.completed).length}/{tasks.length}
                                </span>
                            )}
                        </h2>
                        <div className="space-y-3 relative z-10">
                            {tasks.length === 0 && !isTeamMember && (
                                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">No tasks yet.</p>
                            )}
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={cn(
                                        "flex items-center gap-3 p-3 hud-panel-sm bg-background/50 border border-border/40 group/task hover:border-primary/30 transition-colors",
                                        task.completed && "opacity-70"
                                    )}
                                >
                                    {isTeamMember ? (
                                        <button
                                            type="button"
                                            onClick={() => updateProjectTask(project.id, task.id, { completed: !task.completed })}
                                            className="shrink-0 text-primary hover:brightness-110 transition-opacity"
                                        >
                                            {task.completed ? <CheckSquare className="w-4 h-4 fill-primary" /> : <Square className="w-4 h-4" />}
                                        </button>
                                    ) : (
                                        <span className="shrink-0 text-muted-foreground">
                                            {task.completed ? <CheckSquare className="w-4 h-4 fill-primary/50" /> : <Square className="w-4 h-4 opacity-50" />}
                                        </span>
                                    )}
                                    <span className={cn("flex-1 text-sm font-mono uppercase tracking-tight", task.completed && "line-through text-muted-foreground")}>
                                        {task.title}
                                    </span>
                                    {isTeamMember && (
                                        <button
                                            type="button"
                                            onClick={() => removeProjectTask(project.id, task.id)}
                                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover/task:opacity-100"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {isTeamMember && (
                                <form
                                    className="flex gap-2"
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (!newTaskTitle.trim() || taskSubmitting) return;
                                        setTaskSubmitting(true);
                                        try {
                                            await addProjectTask(project.id, newTaskTitle);
                                            setNewTaskTitle("");
                                        } finally {
                                            setTaskSubmitting(false);
                                        }
                                    }}
                                >
                                    <input
                                        type="text"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="Add a task..."
                                        className="flex-1 px-3 py-2 hud-panel-sm bg-background/50 border border-border/50 focus:border-primary/50 text-xs font-mono uppercase tracking-wider focus:outline-none"
                                        disabled={taskSubmitting}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newTaskTitle.trim() || taskSubmitting}
                                        className="p-2 hud-panel-sm bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50 transition-all"
                                    >
                                        {taskSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="hud-panel-sm bg-card/40 border border-border/40 p-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary" /> INITIALIZED</span>
                        <span>{project.createdAt}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
