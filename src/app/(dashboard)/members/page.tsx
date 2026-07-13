"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { isAdmin, isPresident } from "@/lib/roles";
import { getRoleLabel, ALL_ROLES, LEADERSHIP_ROLES, isRoot } from "@/lib/roles";
import { ALL_RESIDENCY_OPTIONS, getResidencyLabel } from "@/lib/member-residency";
import type { ResidencyType } from "@/lib/member-residency";
import type { UserRole } from "@/contexts/auth-context";
import {
    useMembers,
    useEvents,
    useProjects,
    useResources,
    countMemberAttendanceOccurrences,
    type MemberItem,
} from "@/hooks/useFirestore";
import { countMemberProjects, countMemberUploads } from "@/lib/member-engagement";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    Users,
    Search,
    Star,
    Shield,
    Crown,
    User,
    ExternalLink,
    Loader2,
    Briefcase,
    X,
    Check,
    UserMinus,
    UserPlus,
    Handshake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { DEMO_MODE } from "@/lib/demo-mode";

const roleConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    president: { label: "President", color: "bg-destructive/10 border-destructive/50 text-destructive", icon: <Crown className="w-3.5 h-3.5" /> },
    "vice-president": { label: "Vice Pres", color: "bg-chart-2/10 border-chart-2/50 text-chart-2", icon: <Shield className="w-3.5 h-3.5" /> },
    "community-manager": { label: "Comm Mgr", color: "bg-chart-2/10 border-chart-2/50 text-chart-2", icon: <Shield className="w-3.5 h-3.5" /> },
    marketing: { label: "Marketing", color: "bg-primary/10 border-primary/50 text-primary", icon: <Star className="w-3.5 h-3.5" /> },
    events: { label: "Events", color: "bg-chart-3/10 border-chart-3/50 text-chart-3", icon: <Star className="w-3.5 h-3.5" /> },
    finance: { label: "Finance", color: "bg-chart-1/10 border-chart-1/50 text-chart-1", icon: <Briefcase className="w-3.5 h-3.5" /> },
    recruitment: { label: "Recruitment", color: "bg-chart-4/10 border-chart-4/50 text-chart-4", icon: <UserPlus className="w-3.5 h-3.5" /> },
    outreach: { label: "Outreach", color: "bg-primary/10 border-primary/45 text-primary", icon: <Handshake className="w-3.5 h-3.5" /> },
    "vp-events": { label: "VP Events", color: "bg-chart-3/10 border-chart-3/50 text-chart-3", icon: <Star className="w-3.5 h-3.5" /> },
    "vp-marketing": { label: "VP Marketing", color: "bg-primary/10 border-primary/50 text-primary", icon: <Star className="w-3.5 h-3.5" /> },
    "vp-prof-dev": { label: "VP Prof Dev", color: "bg-accent/10 border-accent/50 text-accent-foreground", icon: <Briefcase className="w-3.5 h-3.5" /> },
    "vp-finance": { label: "VP Finance", color: "bg-chart-1/10 border-chart-1/50 text-chart-1", icon: <Briefcase className="w-3.5 h-3.5" /> },
    "vp-recruitment": { label: "VP Recruit", color: "bg-chart-4/10 border-chart-4/50 text-chart-4", icon: <UserPlus className="w-3.5 h-3.5" /> },
    "vp-outreach": { label: "VP Outreach", color: "bg-primary/10 border-primary/45 text-primary", icon: <Handshake className="w-3.5 h-3.5" /> },
    member: { label: "Member", color: "bg-background border-border/50 text-muted-foreground", icon: <User className="w-3.5 h-3.5" /> },
    alumni: { label: "Alumni", color: "bg-chart-5/10 border-chart-5/50 text-chart-5", icon: <User className="w-3.5 h-3.5" /> },
};

const residencyBadgeClass: Record<ResidencyType, string> = {
    resident: "bg-chart-2/10 border-chart-2/40 text-chart-2",
    associate: "bg-primary/10 border-primary/40 text-primary",
    alumni: "bg-chart-5/10 border-chart-5/40 text-chart-5",
};

const FILTERS = [
    { key: "all", label: "All" },
    { key: "resident", label: "Resident" },
    { key: "associate", label: "Associates" },
    { key: "alumni", label: "Alumni" },
] as const;

export default function MembersPage() {
    const { profile } = useAuth();
    const { data: members, loading } = useMembers();
    const { data: events } = useEvents();
    const { data: allProjects } = useProjects();
    const { data: allResources } = useResources(false);
    const [search, setSearch] = useState("");

    /** Distinct event sessions (including each recurring occurrence) marked present. */
    const getAttendedCount = (memberId: string) => countMemberAttendanceOccurrences(events, memberId);
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);
    const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
    const [residencyUpdatingId, setResidencyUpdatingId] = useState<string | null>(null);

    const userIsAdmin = isAdmin(profile?.role);
    const userIsPresident = isPresident(profile?.role);

    const isAlumniMember = (m: MemberItem) => m.role === "alumni" || m.residency === "alumni";
    const isResidentsGroup = (m: MemberItem) =>
        m.residency === "resident" || isAdmin(m.role);

    const filtered = members
        .filter((m) => {
            if (roleFilter === "all") return true;
            if (roleFilter === "resident") return m.residency === "resident";
            if (roleFilter === "associate") return m.residency === "associate";
            if (roleFilter === "alumni") return isAlumniMember(m);
            return m.role === roleFilter;
        })
        .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.standoutSkill.toLowerCase().includes(search.toLowerCase()));

    const roleCounts = {
        total: members.length,
        residents: members.filter(isResidentsGroup).length,
        associates: members.filter((m) => m.residency === "associate").length,
        alumni: members.filter(isAlumniMember).length,
    };

    const rosterEngagement = useMemo(() => {
        const m = new Map<string, { projects: number; uploads: number }>();
        for (const member of members) {
            m.set(member.id, {
                projects: countMemberProjects(allProjects, member.id),
                uploads: countMemberUploads(allResources, member.id, member.name),
            });
        }
        return m;
    }, [members, allProjects, allResources]);

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] animate-fade-in space-y-6 relative z-10">
            <PageHeader
                eyebrow="Member directory"
                title="Club directory"
                description={`${roleCounts.total} registered member${roleCounts.total !== 1 ? "s" : ""}`}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Residents", value: roleCounts.residents, color: "text-chart-2" },
                    { label: "Associates", value: roleCounts.associates, color: "text-primary" },
                    { label: "Members", value: roleCounts.total, color: "text-chart-4" },
                    { label: "Alumni", value: roleCounts.alumni, color: "text-chart-5" },
                ].map((stat) => (
                    <div key={stat.label} className="etower-soft-card p-5 text-center">
                        <div className={cn("text-3xl font-bold tracking-tight mb-1", stat.color)}>{stat.value}</div>
                        <div className="text-xs text-white/55">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 etower-soft-card p-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00ff41]/80" />
                    <input
                        type="text"
                        placeholder="Search by name or skill…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/35"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto custom-scroll pb-1 sm:pb-0 etower-soft-card p-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setRoleFilter(f.key)}
                            className={cn(
                                "etower-soft-btn whitespace-nowrap text-xs",
                                roleFilter === f.key
                                    ? "etower-soft-btn--primary"
                                    : "etower-soft-btn--ghost"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00ff41]" />
                    <span className="text-sm text-white/55">Loading members…</span>
                </div>
            )}

            {!loading && (
                <div className="flex-1 grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((member) => {
                        const rc = roleConfig[member.role] || roleConfig.member;
                        const isHighCommand = LEADERSHIP_ROLES.includes(member.role as UserRole);
                        const eng = rosterEngagement.get(member.id);

                        return (
                            <div
                                key={member.id}
                                onClick={() => setSelectedMember(member)}
                                className={cn(
                                    "group etower-soft-card p-5 transition-all hover:border-[#00ff41]/40 relative flex flex-col cursor-pointer",
                                    isHighCommand && "border-[#00ff41]/35 bg-[rgba(0,255,65,0.04)]"
                                )}
                            >
                                <div className="flex items-start gap-4 mb-4 relative z-10">
                                    {member.photoURL ? (
                                        <img
                                            src={member.photoURL}
                                            alt=""
                                            className={cn(
                                                "w-14 h-14 rounded-xl object-cover border",
                                                isHighCommand ? "border-[#00ff41]/50" : "border-[rgba(0,255,65,0.18)]"
                                            )}
                                        />
                                    ) : (
                                        <div
                                            className={cn(
                                                "w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl border",
                                                isHighCommand
                                                    ? "bg-[rgba(0,255,65,0.12)] border-[#00ff41]/50 text-[#00ff41]"
                                                    : "bg-[#0a1628] border-[rgba(0,255,65,0.18)] text-white/55"
                                            )}
                                        >
                                            {member.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                                            <h3 className="font-semibold tracking-tight truncate group-hover:text-[#00ff41] transition-colors">
                                                {member.name}
                                            </h3>
                                            <span className="text-[11px] text-white/55 shrink-0">{member.standoutSkill}</span>
                                            {member.linkedin && (
                                                <a
                                                    href={member.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-1.5 rounded-lg border border-[rgba(0,255,65,0.18)] text-white/55 hover:text-[#00ff41] hover:border-[#00ff41]/50 transition-colors shrink-0"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border", rc.color)}>
                                                {rc.icon} {rc.label}
                                            </span>
                                            <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border", residencyBadgeClass[member.residency])}>
                                                {getResidencyLabel(member.residency)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2 mb-4 p-3 rounded-xl bg-[#0a1628]/60 border border-[rgba(0,255,65,0.12)] relative z-10">
                                    <p className={cn("text-xs text-white/80 leading-relaxed line-clamp-3", !member.bio && "text-white/40 italic")}>
                                        {member.bio || "No bio."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-2 relative z-10">
                                    {[
                                        { value: eng?.projects ?? 0, label: "Projects", color: "text-primary" },
                                        { value: eng?.uploads ?? 0, label: "Uploads", color: "text-chart-2" },
                                        { value: getAttendedCount(member.id), label: "Events", color: "text-chart-4" },
                                    ].map((cell) => (
                                        <div
                                            key={cell.label}
                                            className="rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.12)] py-2.5 px-1 text-center group-hover:border-[rgba(0,255,65,0.28)] transition-colors"
                                        >
                                            <div className={cn("text-sm font-bold", cell.color)}>{cell.value}</div>
                                            <div className="text-[10px] text-white/45 mt-1">{cell.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 etower-soft-card">
                    <Users className="w-16 h-16 text-white/20 mb-4" />
                    <p className="text-sm text-white/55 text-center">No members matching your search.</p>
                </div>
            )}

            {selectedMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-[#0a1628]/80 backdrop-blur-sm" onClick={() => setSelectedMember(null)} />

                    <div className="relative w-full max-w-2xl etower-soft-card flex flex-col max-h-full overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between p-4 border-b border-[rgba(0,255,65,0.18)] bg-[rgba(0,255,65,0.04)]">
                            <p className="etower-section-label mb-0">Member profile</p>
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="p-1.5 rounded-lg text-white/55 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 sm:p-8 overflow-y-auto custom-scroll flex-1">
                            <div className="flex flex-col sm:flex-row gap-6 mb-8">
                                <div className="shrink-0 flex justify-center">
                                    {selectedMember.photoURL ? (
                                        <img
                                            src={selectedMember.photoURL}
                                            alt=""
                                            className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border border-[#00ff41]/40"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-[#0a1628] flex items-center justify-center font-bold text-5xl border border-[#00ff41]/40 text-[#00ff41]">
                                            {selectedMember.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold tracking-tight mb-2 text-center sm:text-left">{selectedMember.name}</h2>

                                    <div className="flex flex-wrap items-center gap-2 mb-4 justify-center sm:justify-start">
                                        {userIsAdmin ? (
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <div className="flex flex-col gap-1">
                                                    <label className="etower-section-label text-[10px]">Club role</label>
                                                    <select
                                                        value={selectedMember.role}
                                                        onChange={async (e) => {
                                                            const newRole = e.target.value;
                                                            if (!selectedMember?.id) return;
                                                            setRoleUpdatingId(selectedMember.id);
                                                            try {
                                                                if (DEMO_MODE) return;
                                                                await updateDoc(doc(db, "users", selectedMember.id), { role: newRole, updatedAt: serverTimestamp() });
                                                                setSelectedMember((prev) => (prev ? { ...prev, role: newRole } : null));
                                                            } catch (err) {
                                                                console.error("Role update error:", err);
                                                            } finally {
                                                                setRoleUpdatingId(null);
                                                            }
                                                        }}
                                                        disabled={roleUpdatingId === selectedMember.id || residencyUpdatingId === selectedMember.id}
                                                        className={cn(
                                                            "text-xs font-semibold px-3 py-1.5 rounded-xl border bg-[#0a1628] cursor-pointer",
                                                            roleConfig[selectedMember.role]?.color || roleConfig.member.color
                                                        )}
                                                    >
                                                        {ALL_ROLES.map((r) => (
                                                            <option key={r.value} value={r.value}>{r.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="etower-section-label text-[10px]">Residency</label>
                                                    <select
                                                        value={selectedMember.residency}
                                                        onChange={async (e) => {
                                                            const next = e.target.value as ResidencyType;
                                                            if (!selectedMember?.id) return;
                                                            setResidencyUpdatingId(selectedMember.id);
                                                            try {
                                                                if (DEMO_MODE) return;
                                                                await updateDoc(doc(db, "users", selectedMember.id), { residency: next, updatedAt: serverTimestamp() });
                                                                setSelectedMember((prev) => (prev ? { ...prev, residency: next } : null));
                                                            } catch (err) {
                                                                console.error("Residency update error:", err);
                                                            } finally {
                                                                setResidencyUpdatingId(null);
                                                            }
                                                        }}
                                                        disabled={residencyUpdatingId === selectedMember.id || roleUpdatingId === selectedMember.id}
                                                        className={cn(
                                                            "text-xs font-semibold px-3 py-1.5 rounded-xl border bg-[#0a1628] cursor-pointer",
                                                            residencyBadgeClass[selectedMember.residency]
                                                        )}
                                                    >
                                                        {ALL_RESIDENCY_OPTIONS.map((r) => (
                                                            <option key={r.value} value={r.value}>{r.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border", roleConfig[selectedMember.role]?.color || roleConfig.member.color)}>
                                                    {roleConfig[selectedMember.role]?.icon || roleConfig.member.icon}{" "}
                                                    {getRoleLabel(selectedMember.role, profile?.role)}
                                                </span>
                                                <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border", residencyBadgeClass[selectedMember.residency])}>
                                                    {getResidencyLabel(selectedMember.residency)}
                                                </span>
                                            </div>
                                        )}
                                        {selectedMember.role === "alumni" && selectedMember.openToMentorship && (
                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1.5 rounded-full border border-chart-2/50 bg-chart-2/10 text-chart-2">
                                                <Users className="w-3 h-3" /> Open to outreach
                                            </span>
                                        )}
                                    </div>

                                    {selectedMember.bio && (
                                        <div className="bg-[#0a1628]/50 border border-[rgba(0,255,65,0.18)] p-4 rounded-xl relative">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-[#00ff41]/50 rounded-l-xl" />
                                            <p className="text-sm italic text-white/80 leading-relaxed pl-2">
                                                &ldquo;{selectedMember.bio}&rdquo;
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="etower-section-label mb-2 border-b border-[rgba(0,255,65,0.18)] pb-1">Primary specialty</p>
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(0,255,65,0.08)] border border-[#00ff41]/40 text-[#00ff41] font-semibold text-sm">
                                            <Star className="w-4 h-4 fill-current" />
                                            {selectedMember.standoutSkill}
                                        </div>
                                    </div>

                                    {selectedMember.skills && selectedMember.skills.length > 0 && (
                                        <div>
                                            <p className="etower-section-label mb-2 border-b border-[rgba(0,255,65,0.18)] pb-1">Skills</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedMember.skills.map((skill: string) => (
                                                    <span
                                                        key={skill}
                                                        className={cn(
                                                            "px-2 py-1 flex items-center gap-1.5 rounded-full text-[10px] font-semibold border",
                                                            skill === selectedMember.standoutSkill
                                                                ? "bg-[rgba(0,255,65,0.08)] border-[#00ff41]/50 text-[#00ff41]"
                                                                : "bg-[#0a1628] border-[rgba(0,255,65,0.18)] text-white/55"
                                                        )}
                                                    >
                                                        {skill === selectedMember.standoutSkill && <Check className="w-3 h-3" />}
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <p className="etower-section-label mb-2 border-b border-[rgba(0,255,65,0.18)] pb-1">Engagement</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.12)] p-3 text-center">
                                            <div className="text-xl font-bold text-primary">
                                                {countMemberProjects(allProjects, selectedMember.id)}
                                            </div>
                                            <div className="text-[11px] text-white/45 mt-1">Projects</div>
                                        </div>
                                        <div className="rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.12)] p-3 text-center">
                                            <div className="text-xl font-bold text-chart-2">
                                                {countMemberUploads(allResources, selectedMember.id, selectedMember.name)}
                                            </div>
                                            <div className="text-[11px] text-white/45 mt-1">Uploads</div>
                                        </div>
                                        <div className="rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.12)] p-3 text-center col-span-2">
                                            <div className="text-xl font-bold text-chart-4">{getAttendedCount(selectedMember.id)}</div>
                                            <div className="text-[11px] text-white/45 mt-1">Events attended</div>
                                        </div>
                                    </div>

                                    {selectedMember.linkedin && (
                                        <a
                                            href={selectedMember.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-4 flex flex-col items-center justify-center gap-1 p-3 etower-soft-btn etower-soft-btn--ghost w-full text-xs"
                                        >
                                            <ExternalLink className="w-4 h-4" /> Visit LinkedIn
                                        </a>
                                    )}

                                    {userIsPresident &&
                                        selectedMember.id !== profile?.uid &&
                                        (isRoot(profile?.role) || selectedMember.role !== "president") &&
                                        (isRoot(profile?.role) || selectedMember.role !== "root") && (
                                        <div className="mt-6 pt-4 border-t border-[rgba(0,255,65,0.18)]">
                                            {removeConfirm !== selectedMember.id ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setRemoveConfirm(selectedMember.id)}
                                                    className="w-full etower-soft-btn border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                                                >
                                                    <UserMinus className="w-4 h-4" /> Remove member
                                                </button>
                                            ) : (
                                                <div className="space-y-2">
                                                    <p className="text-xs text-white/55 text-center">
                                                        Remove {selectedMember.name} from the directory? They will lose dashboard access.
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                if (!selectedMember?.id) return;
                                                                setRemovingId(selectedMember.id);
                                                                try {
                                                                    if (DEMO_MODE) return;
                                                                    await updateDoc(doc(db, "users", selectedMember.id), { status: "removed", updatedAt: serverTimestamp() });
                                                                    setSelectedMember(null);
                                                                    setRemoveConfirm(null);
                                                                } catch (err) {
                                                                    console.error("Remove member error:", err);
                                                                } finally {
                                                                    setRemovingId(null);
                                                                }
                                                            }}
                                                            disabled={removingId === selectedMember.id}
                                                            className="flex-1 etower-soft-btn bg-red-500 text-white border-red-500 disabled:opacity-50"
                                                        >
                                                            {removingId === selectedMember.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
                                                            {removingId === selectedMember.id ? "Removing…" : "Confirm remove"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setRemoveConfirm(null)}
                                                            disabled={removingId === selectedMember.id}
                                                            className="etower-soft-btn etower-soft-btn--ghost disabled:opacity-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
