"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useNewsletterSubscribers } from "@/hooks/useFirestore";
import { canAccessNewsletterList, isAdmin } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { Download, Loader2, Mail, Search, Shield, Trash2 } from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
    popup: "Landing popup",
    "join-modal": "Join modal",
    landing: "Landing page",
    unknown: "Unknown",
};

export default function NewsletterPage() {
    const { profile } = useAuth();
    const canAccess = canAccessNewsletterList(profile?.role);
    const canManage = isAdmin(profile?.role);
    const { data: subscribers, loading, removeSubscriber } = useNewsletterSubscribers(canAccess);
    const [search, setSearch] = useState("");
    const [removingId, setRemovingId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return subscribers;
        return subscribers.filter(
            (s) =>
                s.email.toLowerCase().includes(q) ||
                s.source.toLowerCase().includes(q) ||
                s.date.toLowerCase().includes(q)
        );
    }, [subscribers, search]);

    const exportCsv = () => {
        const rows = [["email", "source", "subscribed"]];
        filtered.forEach((s) => rows.push([s.email, s.source, s.date]));
        const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `code-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleRemove = async (id: string) => {
        if (!canManage) return;
        try {
            setRemovingId(id);
            await removeSubscriber(id);
        } finally {
            setRemovingId(null);
        }
    };

    if (!canAccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in relative z-10 hud-panel bg-card/40 border border-destructive/40 scanlines p-8 text-center max-w-lg mx-auto">
                <Shield className="w-16 h-16 text-destructive mb-6" />
                <h1 className="text-2xl font-black uppercase tracking-tighter text-destructive mb-2">Access denied</h1>
                <p className="text-sm font-mono text-muted-foreground">
                    Newsletter subscribers are visible to presidents, vice presidents, and functional VPs only.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 text-[10px] font-mono text-primary uppercase tracking-widest mb-2">
                        <Mail className="w-3.5 h-3.5" />
                        COMMS // NEWSLETTER
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase">Newsletter list</h1>
                    <p className="text-sm font-mono text-muted-foreground mt-2 max-w-xl">
                        Emails collected from the landing popup and join modal. Export for mailings or outreach campaigns.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={exportCsv}
                    disabled={filtered.length === 0}
                    className="inline-flex items-center gap-2 px-4 py-2.5 hud-panel-sm border border-border/50 text-xs font-bold uppercase tracking-widest hover:border-primary/50 transition-colors disabled:opacity-40 shrink-0"
                >
                    <Download className="w-4 h-4" />
                    Export CSV ({filtered.length})
                </button>
            </div>

            <div className="hud-panel bg-card/60 border border-border/40 p-4 scanlines">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by email, source, or date..."
                        className="w-full pl-10 pr-4 py-2.5 hud-panel-sm bg-background/50 border border-border/50 focus:border-primary/50 text-sm font-mono transition-colors focus:outline-none"
                    />
                </div>
                <p className="mt-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    {loading ? "Syncing..." : `${filtered.length} subscriber${filtered.length === 1 ? "" : "s"}`}
                    {search.trim() ? ` matching "${search.trim()}"` : ""}
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 hud-panel bg-card/40 border border-border/40 scanlines">
                    <Mail className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                        {search.trim() ? "No matches found" : "No subscribers yet"}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((sub, i) => (
                        <div
                            key={sub.id}
                            className={cn(
                                "group p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 scanlines",
                                i % 2 === 0 ? "hud-panel bg-card/60 border border-border/40" : "hud-corners bg-background/40 border border-border/30"
                            )}
                        >
                            <div className="min-w-0">
                                <p className="font-mono text-sm font-bold truncate">{sub.email}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                                    <span className="text-primary/80">{SOURCE_LABELS[sub.source] ?? sub.source}</span>
                                    <span className="text-border">·</span>
                                    <span>{sub.date}</span>
                                </div>
                            </div>
                            {canManage && (
                                <button
                                    type="button"
                                    onClick={() => handleRemove(sub.id)}
                                    disabled={removingId === sub.id}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors shrink-0 disabled:opacity-50"
                                >
                                    {removingId === sub.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
