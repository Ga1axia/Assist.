"use client";

import { useAuth } from "@/contexts/auth-context";
import { isAdmin } from "@/lib/roles";
import { useMembers } from "@/hooks/useFirestore";
import {
    GraduationCap,
    Search,
    Mail,
    ExternalLink,
    Loader2,
    Clock,
    Shield,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";

export default function AlumniNetworkPage() {
    const { profile } = useAuth();
    const { data: members, loading } = useMembers();
    const [search, setSearch] = useState("");

    // Only fetch alumni explicitly.
    const alumniMembers = members.filter((m) => m.role === "alumni" || m.residency === "alumni");

    const filteredAlumni = alumniMembers.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.standoutSkill.toLowerCase().includes(search.toLowerCase())
    );

    const userIsAdmin = isAdmin(profile?.role);

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] animate-fade-in space-y-6 relative z-10 max-w-7xl mx-auto">
            <PageHeader
                eyebrow="Network directory"
                title="Alumni network"
                description="Connect with past members in the industry. Those marked as open to outreach are available for mentorship and guidance."
            />

            <p className="text-sm text-[#00ff41]/90 flex items-center gap-2 -mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse" />
                {alumniMembers.length} registered alumni
            </p>

            <div className="relative w-full max-w-md etower-soft-card p-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00ff41]/80" />
                <input
                    type="text"
                    placeholder="Search by name or skill…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/35"
                />
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00ff41]" />
                    <span className="text-sm text-white/55">Loading alumni…</span>
                </div>
            )}

            {!loading && (
                <div className="flex-1 grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredAlumni.map((alumni) => (
                        <div
                            key={alumni.id}
                            className={cn(
                                "group etower-soft-card p-6 transition-all hover:border-[#00ff41]/40 relative flex flex-col",
                                alumni.openToMentorship && "border-[#00ff41]/35 bg-[rgba(0,255,65,0.04)]"
                            )}
                        >
                            {alumni.openToMentorship && (
                                <span className="absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#00ff41] text-[#0a0a0a] whitespace-nowrap z-20 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-[#0a0a0a] rounded-full animate-pulse" />
                                    Open to outreach
                                </span>
                            )}

                            <div className="flex items-start gap-5 mb-5 relative z-10 pt-2">
                                <div
                                    className={cn(
                                        "w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl border shrink-0",
                                        alumni.openToMentorship
                                            ? "bg-[rgba(0,255,65,0.12)] border-[#00ff41]/50 text-[#00ff41]"
                                            : "bg-[#0a1628] border-[rgba(0,255,65,0.18)] text-white/55"
                                    )}
                                >
                                    {alumni.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <h3 className="font-semibold tracking-tight truncate text-lg group-hover:text-[#00ff41] transition-colors">
                                        {alumni.name}
                                    </h3>
                                    <span className="inline-flex items-center gap-1.5 text-xs text-white/55 mt-1">
                                        <Clock className="w-3 h-3" />
                                        Joined {alumni.joinDate.substring(0, 4)}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-5 p-4 rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.12)] relative z-10 flex-1">
                                <p className="etower-section-label mb-1.5 text-[10px]">Primary specialty</p>
                                <div className="font-semibold text-sm text-white/90 leading-tight">
                                    {alumni.standoutSkill !== "—" ? alumni.standoutSkill : "Unspecified expertise"}
                                </div>
                            </div>

                            {(alumni.openToMentorship || userIsAdmin) && (
                                <div className="mt-auto pt-4 border-t border-[rgba(0,255,65,0.18)] flex flex-col gap-2.5 relative z-10">
                                    {!alumni.openToMentorship && userIsAdmin && (
                                        <span className="text-[10px] text-amber-400/90 mb-1">Visible to leadership only</span>
                                    )}

                                    {alumni.linkedin ? (
                                        <a
                                            href={alumni.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cn(
                                                "etower-soft-btn justify-between w-full",
                                                alumni.openToMentorship
                                                    ? "etower-soft-btn--primary"
                                                    : "etower-soft-btn--ghost"
                                            )}
                                        >
                                            <span className="flex items-center gap-2 text-xs">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                LinkedIn profile
                                            </span>
                                            <span>&rarr;</span>
                                        </a>
                                    ) : (
                                        <div className="flex items-center p-2.5 rounded-full border border-[rgba(0,255,65,0.12)] text-white/40">
                                            <span className="text-xs flex items-center gap-2">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                No LinkedIn provided
                                            </span>
                                        </div>
                                    )}

                                    <a
                                        href={`mailto:${alumni.email}`}
                                        className="etower-soft-btn etower-soft-btn--ghost justify-between w-full group/link"
                                    >
                                        <span className="text-xs flex items-center gap-2 truncate">
                                            <Mail className="w-3.5 h-3.5 shrink-0" />
                                            {alumni.email}
                                        </span>
                                        <span className="opacity-0 group-hover/link:opacity-100 transition-opacity">&rarr;</span>
                                    </a>
                                </div>
                            )}

                            {!alumni.openToMentorship && !userIsAdmin && (
                                <div className="mt-auto pt-4 border-t border-[rgba(0,255,65,0.18)]">
                                    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.12)] text-center">
                                        <Shield className="w-5 h-5 text-white/30 mb-2" />
                                        <span className="text-xs text-white/45">Contact details not shared</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredAlumni.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 etower-soft-card mt-8">
                    <GraduationCap className="w-16 h-16 text-white/20 mb-5" />
                    <p className="text-sm font-semibold text-white text-center mb-2">No alumni found</p>
                    <p className="text-xs text-white/55 text-center">Your search returned no results.</p>
                </div>
            )}
        </div>
    );
}
