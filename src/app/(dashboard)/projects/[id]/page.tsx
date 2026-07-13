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
import { PageHeader } from "@/components/page-header";
import { DEMO_MODE } from "@/lib/demo-mode";

const TEAM_ROLES = ["lead", "developer", "designer", "member"] as const;

const statusColors: Record<string, string> = {
    ideation: "bg-chart-2/10 border-chart-2/30 text-chart-2",
    design: "bg-chart-1/10 border-chart-1/30 text-chart-1",
    development: "bg-primary/10 border-primary/30 text-primary",
    review: "bg-warning/10 border-warning/30 text-warning",
    complete: "bg-success/10 border-success/30 text-success",
    published: "bg-[#00ff41]/10 border-[#00ff41]/30 text-[#00ff41]",
    active: "bg-chart-2/10 border-chart-2/30 text-chart-2",
};

const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-[#0a1628] border border-[rgba(0,255,65,0.28)] focus:border-[#00ff41] text-sm transition-colors focus:outline-none";

export default function ProjectDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const { profile } = useAuth();
    const { data: projects, loading, addProjectTask, updateProjectTask, removeProjectTask, updateProject } =
        useProjects();
    const { data: members, loading: membersLoading } = useMembers();
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [taskSubmitting, setTaskSubmitting] = useState(false);
    const [memberSearch, setMemberSearch] = useState("");
    const [teamUpdating, setTeamUpdating] = useState(false);

    const project = projects.find((p) => p.id === id);
    const isTeamMember = project && profile && project.teamMembers.some((m) => m.uid === profile.uid);
    const tasks = project?.tasks ?? [];

    const addedUids = useMemo(
        () => new Set(project?.teamMembers?.map((m) => m.uid) ?? []),
        [project?.teamMembers]
    );
    const nonAlumniMembers = useMemo(() => members.filter((m) => m.role !== "alumni"), [members]);
    const filteredMemberList = useMemo(() => {
        if (!memberSearch.trim()) return nonAlumniMembers;
        const q = memberSearch.toLowerCase().trim();
        return nonAlumniMembers.filter(
            (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
        );
    }, [nonAlumniMembers, memberSearch]);

    const addProjectMember = async (uid: string, name: string, role: string = "member") => {
        if (!project || addedUids.has(uid) || teamUpdating) return;
        if (DEMO_MODE) return;
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
        if (DEMO_MODE) return;
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
        if (DEMO_MODE) return;
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
                <Clock className="w-8 h-8 animate-spin text-[#00ff41]" />
                <span className="text-sm text-white/55">Loading project…</span>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 etower-soft-card max-w-lg mx-auto p-8">
                <h1 className="text-2xl font-bold tracking-tight text-red-300">Project not found</h1>
                <p className="text-white/55 text-sm">This project could not be located in the directory.</p>
                <Link href="/projects" className="etower-soft-btn etower-soft-btn--ghost mt-2">
                    Back to projects
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in relative z-10 pb-20">
            <div className="flex items-start gap-3">
                <Link
                    href="/projects"
                    className="etower-soft-btn etower-soft-btn--ghost p-2.5 mt-1"
                    aria-label="Back to projects"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <PageHeader
                    className="flex-1 border-b-0 pb-0"
                    eyebrow="Projects"
                    title={project.name}
                    description={project.description}
                    actions={
                        <span
                            className={cn(
                                "text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize",
                                statusColors[project.status] || statusColors.published
                            )}
                        >
                            {project.status}
                        </span>
                    }
                />
            </div>

            <div className="w-full aspect-video md:aspect-[21/9] max-h-[500px] etower-soft-card relative overflow-hidden flex items-center justify-center group">
                {project.coverImage ? (
                    <img
                        src={project.coverImage}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                ) : (
                    <div className="w-full h-full bg-[#0a1628]/50 flex flex-col items-center justify-center text-white/25">
                        <ImageIcon className="w-12 h-12 mb-3" />
                        <span className="text-xs font-semibold">No cover image</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/20 to-transparent pointer-events-none" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6 pt-2">
                <div className="lg:col-span-2 space-y-6">
                    <div className="etower-soft-card p-6 sm:p-8 sm:px-10 min-h-[400px]">
                        <div className="prose prose-invert prose-p:text-sm prose-p:leading-relaxed prose-p:text-white/60 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#00ff41] prose-a:no-underline hover:prose-a:text-[#00ff41]/80 max-w-none">
                            {project.content ? (
                                <ReactMarkdown>{project.content}</ReactMarkdown>
                            ) : (
                                <div className="text-center py-20 opacity-50">
                                    <p className="text-sm text-white/50">No project story yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="etower-soft-card p-6">
                        <h2 className="font-semibold tracking-tight mb-4 flex items-center gap-2 pb-3 border-b border-[rgba(0,255,65,0.18)] text-[#00ff41]">
                            <LinkIcon className="w-5 h-5" />
                            Links
                        </h2>
                        <div className="space-y-3">
                            {project.liveUrl ? (
                                <a
                                    href={project.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="etower-soft-btn etower-soft-btn--primary w-full justify-between"
                                >
                                    <span className="flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        Live app
                                    </span>
                                    <ArrowLeft className="w-4 h-4 rotate-135" />
                                </a>
                            ) : (
                                <div className="p-4 rounded-xl border border-[rgba(0,255,65,0.15)] bg-[#0a1628]/50 text-white/40 text-xs text-center">
                                    No live URL yet
                                </div>
                            )}

                            {project.githubUrl && (
                                <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="etower-soft-btn etower-soft-btn--ghost w-full justify-between"
                                >
                                    <span className="flex items-center gap-2">
                                        <GitBranch className="w-4 h-4" />
                                        Source repo
                                    </span>
                                    <ExternalLink className="w-4 h-4 opacity-50" />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="etower-soft-card p-6">
                        <div className="flex items-center justify-between mb-4 border-b border-[rgba(0,255,65,0.18)] pb-4">
                            <h2 className="font-semibold tracking-tight flex items-center gap-2">
                                <Users className="w-5 h-5 text-[#00ff41]" /> Contributors
                            </h2>
                            <span className="text-xs text-white/45">{project.teamMembers.length}</span>
                        </div>
                        <div className="space-y-4">
                            {isTeamMember && (
                                <>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <input
                                            type="text"
                                            value={memberSearch}
                                            onChange={(e) => setMemberSearch(e.target.value)}
                                            placeholder="Search by name or email..."
                                            className={cn(inputClass, "pl-10")}
                                        />
                                    </div>

                                    {project.teamMembers.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {project.teamMembers.map((m) => (
                                                <div
                                                    key={m.uid}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00ff41]/15 border border-[#00ff41]/40 text-[#00ff41] text-xs"
                                                >
                                                    <select
                                                        value={m.role}
                                                        onChange={(e) => setProjectMemberRole(m.uid, e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        disabled={teamUpdating}
                                                        className="bg-transparent border-none focus:outline-none cursor-pointer text-xs font-semibold text-[#00ff41] pr-0.5 min-w-0 disabled:opacity-70"
                                                    >
                                                        {TEAM_ROLES.map((r) => (
                                                            <option key={r} value={r}>
                                                                {r}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <span className="truncate max-w-[100px]">
                                                        {m.name || m.uid.slice(0, 8)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProjectMember(m.uid)}
                                                        disabled={
                                                            teamUpdating ||
                                                            project.teamMembers.length <= 1 ||
                                                            (m.uid === profile?.uid &&
                                                                project.teamMembers.filter((x) => x.role === "lead")
                                                                    .length <= 1)
                                                        }
                                                        className="p-0.5 text-[#00ff41]/80 hover:text-[#00ff41] hover:bg-[#00ff41]/20 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                                                        title="Remove from project"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="max-h-[40vh] overflow-y-auto space-y-4 pr-2 custom-scroll">
                                        {membersLoading ? (
                                            <div className="flex flex-col items-center justify-center py-8 gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin text-[#00ff41]" />
                                                <p className="text-xs text-white/45">Loading directory…</p>
                                            </div>
                                        ) : filteredMemberList.length === 0 ? (
                                            <p className="text-xs text-white/45 py-4 text-center">
                                                {memberSearch.trim()
                                                    ? "No matching members."
                                                    : "No non-alumni members in directory."}
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
                                                            disabled={
                                                                teamUpdating ||
                                                                (onTeam && project.teamMembers.length <= 1) ||
                                                                (onTeam &&
                                                                    mem.id === profile?.uid &&
                                                                    project.teamMembers.filter((x) => x.role === "lead")
                                                                        .length <= 1)
                                                            }
                                                            className={cn(
                                                                "etower-soft-btn text-xs py-1.5 px-3",
                                                                onTeam
                                                                    ? "etower-soft-btn--primary"
                                                                    : "etower-soft-btn--ghost"
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
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0a1628]/60 border border-[rgba(0,255,65,0.2)] text-white/60 text-xs"
                                        >
                                            <span className="text-[#00ff41]/80">{m.role}</span>
                                            <span className="truncate max-w-[100px]">
                                                {m.name || m.uid.slice(0, 8)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="etower-soft-card p-6">
                        <h2 className="font-semibold tracking-tight mb-4 flex items-center gap-2 pb-3 border-b border-[rgba(0,255,65,0.18)]">
                            <CheckSquare className="w-5 h-5 text-[#00ff41]" />
                            Tasks
                            {tasks.length > 0 && (
                                <span className="text-xs text-white/45 font-normal">
                                    {tasks.filter((t) => t.completed).length}/{tasks.length}
                                </span>
                            )}
                        </h2>
                        <div className="space-y-3">
                            {tasks.length === 0 && !isTeamMember && (
                                <p className="text-xs text-white/45">No tasks yet.</p>
                            )}
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.15)] group/task hover:border-[#00ff41]/30 transition-colors",
                                        task.completed && "opacity-70"
                                    )}
                                >
                                    {isTeamMember ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (DEMO_MODE) return;
                                                void updateProjectTask(project.id, task.id, {
                                                    completed: !task.completed,
                                                });
                                            }}
                                            className="shrink-0 text-[#00ff41] hover:brightness-110"
                                        >
                                            {task.completed ? (
                                                <CheckSquare className="w-4 h-4 fill-[#00ff41]" />
                                            ) : (
                                                <Square className="w-4 h-4" />
                                            )}
                                        </button>
                                    ) : (
                                        <span className="shrink-0 text-white/40">
                                            {task.completed ? (
                                                <CheckSquare className="w-4 h-4 fill-[#00ff41]/50" />
                                            ) : (
                                                <Square className="w-4 h-4 opacity-50" />
                                            )}
                                        </span>
                                    )}
                                    <span
                                        className={cn(
                                            "flex-1 text-sm",
                                            task.completed && "line-through text-white/40"
                                        )}
                                    >
                                        {task.title}
                                    </span>
                                    {isTeamMember && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (DEMO_MODE) return;
                                                void removeProjectTask(project.id, task.id);
                                            }}
                                            className="p-1.5 text-white/40 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover/task:opacity-100 rounded-lg"
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
                                        if (DEMO_MODE) return;
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
                                        className={cn(inputClass, "flex-1")}
                                        disabled={taskSubmitting}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newTaskTitle.trim() || taskSubmitting}
                                        className="etower-soft-btn etower-soft-btn--primary p-2.5 disabled:opacity-50"
                                    >
                                        {taskSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Plus className="w-4 h-4" />
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="etower-soft-card p-4 flex items-center justify-between text-xs text-white/45">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-[#00ff41]" /> Created
                        </span>
                        <span>{project.createdAt}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
