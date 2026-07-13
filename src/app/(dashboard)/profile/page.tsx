"use client";

import { useAuth } from "@/contexts/auth-context";
import {
    Mail,
    Calendar,
    FolderKanban,
    BookOpen,
    Star,
    Edit3,
    MessageCircle,
    Target,
    Shield,
    X,
    Loader2,
    Search,
    Check,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SKILL_CATEGORIES } from "@/lib/skills";
import { getRoleLabel } from "@/lib/roles";
import { getResidencyLabel } from "@/lib/member-residency";
import { useProjects, useResources, useEvents, countMemberAttendanceOccurrences } from "@/hooks/useFirestore";
import { countMemberProjects, countMemberUploads, countMemberPitchProposals } from "@/lib/member-engagement";
import { PageHeader } from "@/components/page-header";

export default function ProfilePage() {
    const { profile, refreshProfile } = useAuth();
    const { data: allProjects } = useProjects();
    const { data: allResources } = useResources(false);
    const { data: events } = useEvents();
    const [standoutSkill, setStandoutSkill] = useState(profile?.standoutSkill || "");
    const [skills, setSkills] = useState<string[]>(profile?.skills || []);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [skillSearch, setSkillSearch] = useState("");
    const [linkedin, setLinkedin] = useState(profile?.linkedin || "");
    const [openToMentorship, setOpenToMentorship] = useState(profile?.openToMentorship || false);

    const isAlumni = profile?.role === "alumni" || profile?.residency === "alumni";

    useEffect(() => {
        if (profile) {
            setStandoutSkill(profile.standoutSkill || "");
            setSkills(profile.skills || []);
            setLinkedin(profile.linkedin || "");
            setOpenToMentorship(profile.openToMentorship || false);
        }
    }, [profile]);

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, "users", profile.uid), {
                standoutSkill,
                skills,
                ...(isAlumni ? { linkedin, openToMentorship } : {}),
            });
            await refreshProfile();
            setEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setSaving(false);
        }
    };

    const toggleSkill = (skill: string) => {
        if (skills.includes(skill)) {
            setSkills(skills.filter(s => s !== skill));
            if (standoutSkill === skill) {
                setStandoutSkill("");
            }
        } else {
            setSkills([...skills, skill]);
        }
    };

    const filteredSkillCategories = Object.entries(SKILL_CATEGORIES).reduce(
        (acc, [category, catSkills]) => {
            const filtered = skillSearch
                ? catSkills.filter((s) => s.toLowerCase().includes(skillSearch.toLowerCase()))
                : catSkills;
            if (filtered.length > 0) acc[category] = filtered;
            return acc;
        },
        {} as Record<string, string[]>
    );

    const uid = profile?.uid ?? null;
    const engagementCounts = useMemo(() => {
        if (!uid) {
            return { projects: 0, uploads: 0, pitches: 0, sessions: 0 };
        }
        return {
            projects: countMemberProjects(allProjects, uid),
            uploads: countMemberUploads(allResources, uid, profile?.displayName),
            pitches: countMemberPitchProposals(allProjects, uid),
            sessions: countMemberAttendanceOccurrences(events, uid),
        };
    }, [uid, profile?.displayName, allProjects, allResources, events]);

    const engagementMetrics = [
        {
            label: "Events attended",
            value: String(engagementCounts.sessions),
            icon: <Calendar className="w-4 h-4" />,
            color: "text-chart-1",
            border: "border-chart-1/40",
        },
        {
            label: "Team projects",
            value: String(engagementCounts.projects),
            icon: <FolderKanban className="w-4 h-4" />,
            color: "text-primary",
            border: "border-primary/40",
        },
        {
            label: "Resources shared",
            value: String(engagementCounts.uploads),
            icon: <BookOpen className="w-4 h-4" />,
            color: "text-chart-2",
            border: "border-chart-2/40",
        },
        {
            label: "Pitches in review",
            value: String(engagementCounts.pitches),
            icon: <Target className="w-4 h-4" />,
            color: "text-chart-5",
            border: "border-chart-5/40",
        },
    ];

    const projectHistory = (profile?.uid && allProjects
        ? allProjects.filter((p) => p.teamMembers?.some((m: { uid: string }) => m.uid === profile.uid))
        : []
    ).map((p) => {
        const status = p.status?.toLowerCase();
        const statusLabel =
            status === "complete"
                ? "Completed"
                : status === "active" || status === "published"
                  ? "In progress"
                  : "Draft / proposal";
        return {
            name: p.name,
            role: p.teamMembers?.find((m: { uid: string }) => m.uid === profile?.uid)?.role ?? "Member",
            status: statusLabel,
        };
    });

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] animate-fade-in space-y-6 relative z-10 max-w-5xl mx-auto">
            <PageHeader
                eyebrow="Your account"
                title="Your profile"
            />

            <div className="etower-soft-card overflow-hidden relative">
                <div className="h-28 sm:h-36 bg-gradient-to-r from-[#0a1628] via-[rgba(0,255,65,0.08)] to-[#0a1628] relative border-b border-[rgba(0,255,65,0.18)]">
                    <div className="absolute -bottom-10 sm:-bottom-12 left-6 sm:left-8 z-10">
                        {profile?.photoURL ? (
                            <img
                                src={profile.photoURL}
                                alt=""
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-[#0a1628] border border-[#00ff41]/50"
                            />
                        ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0a1628]/90 border border-[#00ff41]/50 text-[#00ff41] flex items-center justify-center text-3xl sm:text-4xl font-bold">
                                {profile?.displayName?.[0]?.toUpperCase() || "U"}
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-14 sm:pt-16 px-6 sm:px-8 pb-8 relative z-10">
                    <h2 className="text-2xl font-bold tracking-tight">{profile?.displayName || "Member"}</h2>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="text-xs text-white/55 flex items-center gap-1.5 bg-[#0a1628]/50 border border-[rgba(0,255,65,0.18)] px-3 py-1 rounded-full">
                            <Mail className="w-3.5 h-3.5" />
                            {profile?.email}
                        </span>
                        <span className="text-[10px] font-semibold px-3 py-1 rounded-full border bg-[#00ff41] border-[#00ff41] text-[#0a0a0a]">
                            <Shield className="w-3 h-3 inline mr-1" />
                            {getRoleLabel(profile?.role ?? "member", profile?.role)}
                        </span>
                        <span className="text-[10px] font-semibold px-3 py-1 rounded-full border border-[rgba(0,255,65,0.18)] text-white/55">
                            {getResidencyLabel(profile?.residency ?? "resident")}
                        </span>
                        {profile?.graduationYear && (
                            <span className="text-[10px] font-semibold px-3 py-1 rounded-full border border-[rgba(0,255,65,0.18)] text-white/55">
                                Class of {profile.graduationYear}
                            </span>
                        )}
                    </div>

                    <div className="mt-8 p-5 rounded-2xl bg-[#0a1628]/40 border border-[rgba(0,255,65,0.18)] relative">
                        <div className="flex items-center justify-between mb-4 border-b border-[rgba(0,255,65,0.18)] pb-3">
                            <h3 className="text-sm font-semibold text-white/80 tracking-tight">
                                Skills & strengths
                            </h3>
                            {editing ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setEditing(false);
                                            setSkills(profile?.skills || []);
                                            setStandoutSkill(profile?.standoutSkill || "");
                                            if (isAlumni) {
                                                setLinkedin(profile?.linkedin || "");
                                                setOpenToMentorship(profile?.openToMentorship || false);
                                            }
                                        }}
                                        className="etower-soft-btn etower-soft-btn--ghost text-xs py-1.5 px-3"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="etower-soft-btn etower-soft-btn--primary text-xs py-1.5 px-3"
                                    >
                                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save changes"}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="etower-soft-btn etower-soft-btn--ghost text-xs py-1.5 px-3"
                                >
                                    <Edit3 className="w-3 h-3" />
                                    Edit profile
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {editing && (
                                <div className="space-y-4 mb-6 p-3 rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.12)]">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00ff41]/50" />
                                        <input
                                            type="text"
                                            value={skillSearch}
                                            onChange={(e) => setSkillSearch(e.target.value)}
                                            placeholder="Search skills…"
                                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0a1628] border border-[rgba(0,255,65,0.18)] focus:border-[#00ff41]/50 text-xs transition-colors focus:outline-none"
                                        />
                                    </div>
                                    <div className="max-h-60 overflow-y-auto custom-scroll pr-2 space-y-4">
                                        {Object.entries(filteredSkillCategories).map(([category, catSkills]) => (
                                            <div key={category}>
                                                <p className="etower-section-label text-[10px] mb-2 border-b border-[rgba(0,255,65,0.12)] pb-1">
                                                    {category}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {catSkills.map((skill) => (
                                                        <button
                                                            key={skill}
                                                            onClick={() => toggleSkill(skill)}
                                                            className={cn(
                                                                "px-2 py-1 flex items-center gap-1.5 rounded-full text-[10px] font-semibold transition-all border",
                                                                skills.includes(skill)
                                                                    ? "bg-[rgba(0,255,65,0.1)] text-[#00ff41] border-[#00ff41]/50"
                                                                    : "bg-[#0a1628]/40 border-[rgba(0,255,65,0.18)] text-white/55 hover:border-[#00ff41]/40"
                                                            )}
                                                        >
                                                            {skills.includes(skill) && <Check className="w-3 h-3" />}
                                                            {skill}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {Object.keys(filteredSkillCategories).length === 0 && (
                                            <div className="text-center py-4 text-xs text-white/55">
                                                No skills found matching &ldquo;{skillSearch}&rdquo;
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {skills.length === 0 ? (
                                <p className="text-xs text-white/45 italic">No skills added yet.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <div
                                            key={skill}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 border text-xs font-semibold rounded-full transition-all",
                                                standoutSkill === skill
                                                    ? "bg-[rgba(0,255,65,0.1)] border-[#00ff41] text-[#00ff41]"
                                                    : "bg-[#0a1628]/80 border-[rgba(0,255,65,0.18)] text-white/80",
                                                editing && standoutSkill !== skill && "cursor-pointer hover:border-[#00ff41]/50"
                                            )}
                                            onClick={() => editing && setStandoutSkill(skill)}
                                            title={editing ? (standoutSkill === skill ? "Primary specialty" : "Click to set as primary specialty") : (standoutSkill === skill ? "Primary specialty" : "")}
                                        >
                                            {standoutSkill === skill && <Star className="w-3.5 h-3.5 fill-current" />}
                                            {skill}
                                            {editing && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleSkill(skill); }}
                                                    className="ml-1 text-white/45 hover:text-red-300 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {editing && skills.length > 0 && (
                                <p className="text-[11px] text-white/45 mt-2">
                                    Click a skill to set it as your <span className="text-[#00ff41] font-semibold">primary specialty</span>.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isAlumni && (
                <div className="etower-soft-card p-6 sm:p-8">
                    <h2 className="text-lg font-semibold tracking-tight mb-6 border-b border-[rgba(0,255,65,0.18)] pb-4 text-[#00ff41]">
                        Alumni settings
                    </h2>

                    <div className="space-y-6 max-w-2xl">
                        <div className="space-y-1.5">
                            <label className="etower-section-label text-[10px] ml-1 flex items-center gap-2">
                                LinkedIn URL
                                {editing && <span className="text-[8px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20">Editing</span>}
                            </label>
                            {editing ? (
                                <input
                                    type="url"
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                    placeholder="https://linkedin.com/in/..."
                                    className="w-full px-4 py-3 rounded-xl bg-[#0a1628]/60 border border-[rgba(0,255,65,0.18)] focus:border-[#00ff41]/50 text-sm transition-colors focus:outline-none"
                                />
                            ) : (
                                <p className="w-full px-4 py-3 rounded-xl bg-[#0a1628]/40 border border-[rgba(0,255,65,0.12)] text-sm overflow-hidden text-ellipsis">
                                    {linkedin || <span className="text-white/35 italic">Not provided</span>}
                                </p>
                            )}
                        </div>

                        <label className="flex items-start justify-between p-4 rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.18)] hover:border-[#00ff41]/40 transition-colors cursor-pointer group">
                            <div className="pr-4">
                                <p className={cn("text-sm font-semibold transition-colors", openToMentorship ? "text-[#00ff41]" : "text-white group-hover:text-[#00ff41]")}>
                                    Open to mentorship
                                </p>
                                <p className="text-[11px] text-white/45 mt-1">
                                    Allow active members to contact you for networking and guidance
                                </p>
                            </div>
                            <div
                                className={cn(
                                    "w-12 h-6 rounded-full border relative transition-all mt-1 flex-shrink-0",
                                    editing ? "cursor-pointer" : "cursor-not-allowed opacity-70",
                                    openToMentorship ? "bg-[rgba(0,255,65,0.2)] border-[#00ff41]" : "bg-[#0a1628] border-[rgba(0,255,65,0.18)]"
                                )}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (editing) setOpenToMentorship(!openToMentorship);
                                }}
                            >
                                <div className={cn(
                                    "absolute top-0.5 w-4 h-4 rounded-full transition-all",
                                    openToMentorship ? "right-0.5 bg-[#00ff41]" : "left-0.5 bg-white/30"
                                )} />
                            </div>
                        </label>

                        {!editing && (
                            <p className="text-[11px] text-white/45 mt-2">
                                In the skills section above, click Edit profile to change these settings.
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {engagementMetrics.map((metric) => (
                    <div key={metric.label} className={cn("etower-soft-card p-5 text-center relative overflow-hidden border", metric.border)}>
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 border bg-[#0a1628]/80", metric.border, metric.color)}>
                            {metric.icon}
                        </div>
                        <div className={cn("text-3xl font-bold tracking-tight mb-1", metric.color)}>{metric.value}</div>
                        <div className="text-[11px] text-white/55 text-center leading-snug px-1">
                            {metric.label}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 etower-soft-card p-6 sm:p-8">
                    <h2 className="text-lg font-semibold tracking-tight mb-6 flex items-center gap-3 border-b border-[rgba(0,255,65,0.18)] pb-4">
                        <FolderKanban className="w-5 h-5 text-[#00ff41]" />
                        Your projects
                    </h2>

                    <div className="space-y-4">
                        {projectHistory.length === 0 ? (
                            <p className="text-sm text-white/55 py-4 text-center border border-[rgba(0,255,65,0.12)] rounded-xl px-3">
                                When you join a project team, it will show up here.
                            </p>
                        ) : (
                        projectHistory.map((project, i) => (
                            <div
                                key={i}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.12)] hover:border-[#00ff41]/40 transition-colors group gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#0a1628] flex items-center justify-center text-white/45 group-hover:text-[#00ff41] border border-[rgba(0,255,65,0.18)] text-sm font-bold transition-colors">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold tracking-tight group-hover:text-[#00ff41] transition-colors">{project.name}</p>
                                        <p className="text-[11px] text-white/45 mt-1">
                                            Your role: <span className="text-white/80">{project.role}</span>
                                        </p>
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-[10px] font-semibold px-3 py-1 rounded-full border self-start sm:self-auto",
                                    project.status === "Completed" ? "bg-success/10 border-success/30 text-success" :
                                        project.status === "In progress" ? "bg-[rgba(0,255,65,0.1)] border-[#00ff41]/30 text-[#00ff41]" :
                                            "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                )}>
                                    {project.status}
                                </span>
                            </div>
                        ))
                        )}
                    </div>
                </div>

                <div className="etower-soft-card p-6 sm:p-8 h-fit">
                    <h2 className="text-lg font-semibold tracking-tight mb-6 flex items-center gap-3 border-b border-[rgba(0,255,65,0.18)] pb-4">
                        <MessageCircle className="w-5 h-5 text-[#00ff41]" />
                        Notifications
                    </h2>

                    <div className="space-y-4">
                        <label className="flex items-start justify-between p-4 rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.12)] hover:border-[#00ff41]/40 transition-colors cursor-pointer group">
                            <div className="pr-4">
                                <p className="text-sm font-semibold group-hover:text-[#00ff41] transition-colors">Email from the club</p>
                                <p className="text-[11px] text-white/45 mt-1 leading-relaxed">General updates and announcements (placeholder)</p>
                            </div>
                            <div className="w-12 h-6 rounded-full border border-[#00ff41] bg-[rgba(0,255,65,0.2)] relative cursor-pointer shrink-0 mt-1">
                                <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-[#00ff41]" />
                            </div>
                        </label>

                        <label className="flex items-start justify-between p-4 rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.12)] hover:border-[#00ff41]/40 transition-colors cursor-pointer group">
                            <div className="pr-4">
                                <p className="text-sm font-semibold group-hover:text-[#00ff41] transition-colors">WhatsApp alerts</p>
                                <p className="text-[11px] text-white/45 mt-1 leading-relaxed">Time-sensitive reminders on WhatsApp (placeholder)</p>
                            </div>
                            <div className="w-12 h-6 rounded-full border border-[rgba(0,255,65,0.18)] bg-[#0a1628] relative cursor-pointer shrink-0 mt-1">
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white/30" />
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
