"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useNewsletterSubscribers } from "@/hooks/useFirestore";
import { canAccessNewsletterList, isAdmin } from "@/lib/roles";
import { PageHeader } from "@/components/page-header";
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in relative z-10 etower-soft-card p-8 text-center max-w-lg mx-auto border-red-500/30">
                <Shield className="w-14 h-14 text-red-400 mb-5" />
                <h1 className="text-2xl font-bold tracking-tight text-red-300 mb-2">Access denied</h1>
                <p className="text-sm text-white/55">
                    Newsletter subscribers are visible to presidents, vice presidents, and functional VPs only.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in relative z-10">
            <PageHeader
                eyebrow="Communications"
                title="Newsletter list"
                description="Emails collected from the landing popup and join modal. Export for mailings or outreach campaigns."
                actions={
                    <button
                        type="button"
                        onClick={exportCsv}
                        disabled={filtered.length === 0}
                        className="etower-soft-btn etower-soft-btn--ghost disabled:opacity-40"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV ({filtered.length})
                    </button>
                }
            />

            <div className="etower-soft-card p-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00ff41]/70" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by email, source, or date…"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a1628] border border-[rgba(0,255,65,0.18)] focus:border-[#00ff41]/50 text-sm transition-colors focus:outline-none placeholder:text-white/35"
                    />
                </div>
                <p className="mt-3 text-xs text-white/55">
                    {loading ? "Loading…" : `${filtered.length} subscriber${filtered.length === 1 ? "" : "s"}`}
                    {search.trim() ? ` matching “${search.trim()}”` : ""}
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00ff41]" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 etower-soft-card">
                    <Mail className="w-12 h-12 text-white/25 mb-4" />
                    <p className="text-sm text-white/55">
                        {search.trim() ? "No matches found" : "No subscribers yet"}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((sub) => (
                        <div
                            key={sub.id}
                            className="etower-soft-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-semibold truncate text-white">{sub.email}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-white/55">
                                    <span className="text-[#00ff41]/80">{SOURCE_LABELS[sub.source] ?? sub.source}</span>
                                    <span className="text-white/25">·</span>
                                    <span>{sub.date}</span>
                                </div>
                            </div>
                            {canManage && (
                                <button
                                    type="button"
                                    onClick={() => handleRemove(sub.id)}
                                    disabled={removingId === sub.id}
                                    className={cn(
                                        "etower-soft-btn etower-soft-btn--ghost shrink-0 text-red-300 border-red-500/30 hover:border-red-400 hover:text-red-200",
                                        "disabled:opacity-50"
                                    )}
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
