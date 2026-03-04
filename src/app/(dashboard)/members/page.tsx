"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { isAdmin } from "@/lib/roles";
import { getRoleLabel, ALL_ROLES, ADMIN_ROLES } from "@/lib/roles";
import { useMembers } from "@/hooks/useFirestore";
import {
    Users,
    Search,
    Mail,
    Star,
    Shield,
    Crown,
    User,
    ExternalLink,
    Users2,
    Loader2,
    Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const roleConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    president: { label: "COMMANDER", color: "bg-destructive/10 border-destructive/50 text-destructive", icon: <Crown className="w-3.5 h-3.5" /> },
    "vice-president": { label: "VICE CMD", color: "bg-chart-2/10 border-chart-2/50 text-chart-2", icon: <Shield className="w-3.5 h-3.5" /> },
    "community-manager": { label: "COMMS HEAD", color: "bg-chart-2/10 border-chart-2/50 text-chart-2", icon: <Shield className="w-3.5 h-3.5" /> },
    marketing: { label: "PR/MARKETING", color: "bg-primary/10 border-primary/50 text-primary", icon: <Star className="w-3.5 h-3.5" /> },
    events: { label: "LOGISTICS", color: "bg-chart-3/10 border-chart-3/50 text-chart-3", icon: <Star className="w-3.5 h-3.5" /> },
    finance: { label: "RESOURCES", color: "bg-chart-1/10 border-chart-1/50 text-chart-1", icon: <Briefcase className="w-3.5 h-3.5" /> },
    associate: { label: "SPECIALIST", color: "bg-chart-4/10 border-chart-4/50 text-chart-4", icon: <User className="w-3.5 h-3.5" /> },
    resident: { label: "OPERATIVE", color: "bg-background border-border/50 text-muted-foreground", icon: <User className="w-3.5 h-3.5" /> },
    alumni: { label: "VETERAN", color: "bg-chart-5/10 border-chart-5/50 text-chart-5", icon: <User className="w-3.5 h-3.5" /> },
};

export default function MembersPage() {
    const { profile } = useAuth();
    const { data: members, loading } = useMembers();
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");

    const userIsAdmin = isAdmin(profile?.role);

    const filtered = members
        .filter((m) => roleFilter === "all" || m.role === roleFilter || (roleFilter === "eboard" && ADMIN_ROLES.includes(m.role as any)))
        .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.standoutSkill.toLowerCase().includes(search.toLowerCase()));

    const roleCounts = {
        total: members.length,
        eboard: members.filter((m) => ADMIN_ROLES.includes(m.role as any)).length,
        associates: members.filter((m) => m.role === "associate").length,
        residents: members.filter((m) => m.role === "resident").length,
        alumni: members.filter((m) => m.role === "alumni").length,
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] animate-fade-in space-y-6 relative z-10">
            {/* Header */}
            <div className="border-b border-border/50 pb-5">
                <div className="flex items-center gap-2 text-[10px] font-mono text-primary/80 uppercase tracking-widest mb-1.5">
                    <Users2 className="w-3.5 h-3.5" />
                    SYSTEM_MODULE / DIRECTORY
                </div>
                <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">
                    ACTIVE <span className="gradient-text-cyber">PERSONNEL</span>
                </h1>
                <div className="text-muted-foreground mt-2 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {roleCounts.total} REGISTERED UNIT{roleCounts.total !== 1 ? "S" : ""} IN DB.
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "HIGH COMMAND", value: roleCounts.eboard, color: "text-chart-2", border: "border-chart-2/40", bg: "bg-chart-2/5" },
                    { label: "SPECIALISTS", value: roleCounts.associates, color: "text-primary", border: "border-primary/40", bg: "bg-primary/5" },
                    { label: "OPERATIVES", value: roleCounts.residents, color: "text-chart-4", border: "border-chart-4/40", bg: "bg-chart-4/5" },
                    { label: "VETERANS", value: roleCounts.alumni, color: "text-chart-5", border: "border-chart-5/40", bg: "bg-chart-5/5" },
                ].map((stat) => (
                    <div key={stat.label} className={cn("hud-corners border p-5 text-center relative scanlines overflow-hidden group", stat.bg, stat.border)}>
                        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none" style={{ background: `radial-gradient(circle, var(--${stat.color.split('-')[1]}) 0%, transparent 70%)`, opacity: 0.1 }} />
                        <div className={cn("text-3xl font-black tracking-tighter mb-1", stat.color)}>{stat.value}</div>
                        <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 hud-corners bg-card/60 border border-border/40 p-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <input
                        type="text"
                        placeholder="QUERY BY DESIGNATION OR SPECIALTY..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-transparent text-sm font-mono uppercase tracking-wide focus:outline-none placeholder:text-muted-foreground/50 transition-colors"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto custom-scroll pb-1 sm:pb-0 bg-card/40 border border-border/30 p-2 hud-panel-sm">
                    {["all", "eboard", "resident", "associate", "alumni"].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRoleFilter(r)}
                            className={cn(
                                "px-4 py-2 hud-panel-sm text-[10px] font-mono font-bold uppercase tracking-widest transition-all whitespace-nowrap border",
                                roleFilter === r
                                    ? "bg-primary text-primary-foreground border-primary glow-border"
                                    : "bg-background/50 border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            {r === "all" ? "GLOBAL" : r === "eboard" ? "COMMAND" : r === "resident" ? "OPS" : r === "associate" ? "SPEC" : "VET"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-xs font-mono text-primary uppercase tracking-widest animate-pulse">EXTRACTING PERSONNEL RECORDS...</span>
                </div>
            )}

            {/* Member Grid */}
            {!loading && (
                <div className="flex-1 grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((member, i) => {
                        const rc = roleConfig[member.role] || roleConfig.resident;
                        const isHighCommand = ADMIN_ROLES.includes(member.role as any);

                        return (
                            <div key={member.id} className={cn("group bg-card/60 border p-5 transition-all hover:border-primary/50 relative flex flex-col scanlines", i % 2 === 0 ? 'hud-panel' : 'hud-corners', isHighCommand ? "border-primary/40 bg-primary/5" : "border-border/40")}>
                                {isHighCommand && (
                                    <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-primary/20 to-transparent pointer-events-none z-10" />
                                )}

                                <div className="flex items-start gap-4 mb-4 relative z-10">
                                    <div className={cn("w-14 h-14 hud-corners flex items-center justify-center font-black text-xl border shadow-inner", isHighCommand ? "bg-primary/20 border-primary text-primary shadow-[inset_0_0_10px_rgba(203,247,2,0.2)]" : "bg-background border-border/50 text-muted-foreground")}>
                                        {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h3 className="font-bold font-mono tracking-tight uppercase truncate group-hover:text-primary transition-colors">{member.name}</h3>
                                            {member.linkedin && (
                                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-1 hud-panel-sm bg-background border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                        </div>
                                        <span className={cn("inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 border hud-panel-sm mt-1", rc.color)}>
                                            {rc.icon} {rc.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-2 mb-4 p-3 hud-corners bg-background/40 border border-border/40 relative z-10 flex items-start gap-3">
                                    <Star className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1">PRIMARY SPECIALTY</div>
                                        <div className="font-bold font-mono text-xs uppercase tracking-tight text-foreground/90">{member.standoutSkill}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 relative z-10">
                                    <div className="hud-panel-sm bg-background/60 border border-border/40 py-2.5 px-1 text-center group-hover:border-primary/30 transition-colors">
                                        <div className="text-sm font-black text-primary font-mono">{member.projects}</div>
                                        <div className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-widest mt-1">MISSIONS</div>
                                    </div>
                                    <div className="hud-panel-sm bg-background/60 border border-border/40 py-2.5 px-1 text-center group-hover:border-primary/30 transition-colors">
                                        <div className="text-sm font-black text-chart-2 font-mono">{member.uploads}</div>
                                        <div className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-widest mt-1">DATA UPL.</div>
                                    </div>
                                    <div className="hud-panel-sm bg-background/60 border border-border/40 py-2.5 px-1 text-center group-hover:border-primary/30 transition-colors">
                                        <div className="text-sm font-black text-chart-4 font-mono">{member.attendance}</div>
                                        <div className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-widest mt-1">SYNC RT.</div>
                                    </div>
                                </div>

                                {userIsAdmin && (
                                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-2 text-[10px] font-mono text-muted-foreground relative z-10 break-all">
                                        <Mail className="w-3.5 h-3.5 shrink-0" /> {member.email}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 hud-panel bg-card/40 border border-border/40 scanlines">
                    <Users className="w-16 h-16 text-muted-foreground/30 mb-4 relative z-10" />
                    <p className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest relative z-10 text-center">NO PERSONNEL MATCHING THE PROVIDED QUERY.</p>
                </div>
            )}
        </div>
    );
}
