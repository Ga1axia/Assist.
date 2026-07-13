"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useOrgSettings } from "@/hooks/useFirestore";
import { isAdmin } from "@/lib/roles";
import {
    defaultOrgFiscalSettings,
    fiscalLabelFromOrgSettings,
    normalizeYearTwoDigit,
    type FiscalTerm,
    type OrgSettingsData,
} from "@/lib/org-fiscal";
import { CalendarClock, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClubFiscalAdminTab() {
    const { profile } = useAuth();
    const core = isAdmin(profile?.role);
    const { data, loading, error, saveOrgSettings } = useOrgSettings(core);

    const [term, setTerm] = useState<FiscalTerm>("spring");
    const [yearInput, setYearInput] = useState("");
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    useEffect(() => {
        const base = data
            ? { fiscalTerm: data.fiscalTerm, fiscalYearTwoDigit: data.fiscalYearTwoDigit }
            : defaultOrgFiscalSettings();
        setTerm(base.fiscalTerm);
        setYearInput(base.fiscalYearTwoDigit);
    }, [data]);

    if (!core) return null;

    const preview = fiscalLabelFromOrgSettings({
        fiscalTerm: term,
        fiscalYearTwoDigit: normalizeYearTwoDigit(yearInput),
    });

    const handleSave = async () => {
        setSaving(true);
        setMsg(null);
        try {
            const payload: OrgSettingsData = {
                fiscalTerm: term,
                fiscalYearTwoDigit: normalizeYearTwoDigit(yearInput),
            };
            await saveOrgSettings(payload);
            setMsg("Saved.");
        } catch (e) {
            console.error(e);
            setMsg("Save failed. Check permissions and try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="etower-soft-card p-6 sm:p-8 border-[#00ff41]/30">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-3 tracking-tight text-[#00ff41] border-b border-[rgba(0,255,65,0.18)] pb-4">
                <CalendarClock className="w-5 h-5" /> Club fiscal term
            </h3>
            <p className="text-sm text-white/55 mb-6 max-w-xl leading-relaxed">
                Sets the global label shown on the dashboard and applied automatically when budgets are saved or
                exported (e.g. <span className="text-[#00ff41]">S26</span> = Spring &apos;26,{" "}
                <span className="text-[#00ff41]">F26</span> = Fall &apos;26).
            </p>

            {error && <p className="text-xs text-destructive mb-4">Could not load settings: {error}</p>}

            {loading ? (
                <div className="flex items-center gap-3 py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#00ff41]" />
                    <span className="text-sm text-white/45">Loading settings…</span>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex flex-wrap gap-3 items-center">
                        <span className="etower-section-label">Term</span>
                        {(["spring", "fall"] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTerm(t)}
                                className={cn(
                                    "etower-soft-btn text-xs",
                                    term === t ? "etower-soft-btn--primary" : "etower-soft-btn--ghost"
                                )}
                            >
                                {t === "spring" ? "Spring (S)" : "Fall (F)"}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-1.5 max-w-xs">
                        <label className="etower-section-label block">Year (2 digits)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={yearInput}
                            onChange={(e) => setYearInput(e.target.value)}
                            placeholder="26"
                            className="w-full px-4 py-3 rounded-xl bg-[#0a1628] border border-[rgba(0,255,65,0.28)] focus:border-[#00ff41] text-sm tabular-nums focus:outline-none"
                        />
                        <p className="text-xs text-white/40">
                            You can type 26 or 2026 — only the last two digits are stored.
                        </p>
                    </div>

                    <div className="rounded-xl border border-[#00ff41]/30 bg-[#00ff41]/5 px-4 py-3 inline-block">
                        <span className="etower-section-label mr-2">Preview</span>
                        <span className="text-lg font-bold text-[#00ff41] tabular-nums">{preview}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => void handleSave()}
                            className="etower-soft-btn etower-soft-btn--primary disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Saving…" : "Save club fiscal"}
                        </button>
                        {msg && <span className="text-xs text-white/45">{msg}</span>}
                    </div>
                </div>
            )}
        </div>
    );
}
