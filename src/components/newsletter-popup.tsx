"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X, Newspaper, UserPlus, Mail, Loader2 } from "lucide-react";
import { useOptionalAuth } from "@/contexts/auth-context";
import { useOptionalJoinModal } from "@/contexts/join-modal-context";
import { subscribeToNewsletter } from "@/lib/newsletter";

const POPUP_DELAY_MS = 5000;

export function NewsletterPopup() {
    const pathname = usePathname();
    const { user } = useOptionalAuth();
    const { openJoinModal } = useOptionalJoinModal();
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        // Remove legacy permanent-dismiss flag from earlier implementation
        if (typeof window !== "undefined") {
            window.localStorage.removeItem("code_newsletter_popup_dismissed");
        }

        if (pathname !== "/" || user) {
            setVisible(false);
            return;
        }

        setDismissed(false);
        setShowEmailForm(false);
        setError("");
        setSuccess("");

        const timer = window.setTimeout(() => setVisible(true), POPUP_DELAY_MS);
        return () => window.clearTimeout(timer);
    }, [pathname, user]);

    const dismiss = () => {
        setVisible(false);
        setDismissed(true);
    };

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");
            await subscribeToNewsletter(email, "popup");
            setSuccess("You're subscribed!");
            setEmail("");
            window.setTimeout(dismiss, 2000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to subscribe");
        } finally {
            setLoading(false);
        }
    };

    if (!visible || dismissed || user || pathname !== "/") return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[150] animate-slide-up sm:left-auto sm:right-6 sm:max-w-sm">
            <div className="relative overflow-hidden border border-primary/40 bg-card/95 shadow-[0_0_30px_rgba(0,0,0,0.4)] scanlines">
                <div className="flex items-start justify-between gap-3 border-b border-border/40 bg-primary/5 p-4">
                    <div className="min-w-0 flex-1">
                        {!showEmailForm ? (
                            <>
                                <div className="mb-1 text-[10px] font-mono uppercase tracking-widest text-primary">
                                    // INCOMING TRANSMISSION
                                </div>
                                <h3 className="text-base font-black tracking-tight">Join CODE</h3>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEmailForm(false);
                                        setError("");
                                        setSuccess("");
                                    }}
                                    className="mb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
                                >
                                    ← Back
                                </button>
                                <h3 className="text-base font-black tracking-tight">Newsletter signup</h3>
                            </>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={dismiss}
                        className="shrink-0 rounded-sm border border-border/60 p-2 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                        aria-label="Dismiss"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-4">
                    {!showEmailForm ? (
                        <>
                            <p className="mb-4 text-xs font-mono leading-relaxed text-muted-foreground">
                                Subscribe to our newsletter for events and updates, or sign up for a platform account if you&apos;re a past or current member.
                            </p>

                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEmailForm(true)}
                                    className="flex w-full items-center justify-center gap-2 bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110"
                                >
                                    <Newspaper className="h-3.5 w-3.5" />
                                    Join newsletter
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setVisible(false);
                                        openJoinModal({ view: "choose" });
                                    }}
                                    className="flex w-full items-center justify-center gap-2 border border-border/50 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors hover:border-primary/50"
                                >
                                    <UserPlus className="h-3.5 w-3.5" />
                                    Join platform
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {error && <p className="mb-2 text-[10px] font-mono text-destructive">{error}</p>}
                            {success && <p className="mb-2 text-[10px] font-mono text-success">{success}</p>}
                            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full border border-border/50 bg-background/50 py-2 pl-8 pr-3 text-xs font-mono focus:border-primary/50 focus:outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-primary px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-primary-foreground hover:brightness-110 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Go"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
