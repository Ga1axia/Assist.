"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    X,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    ShieldAlert,
    Terminal,
    UserPlus,
    Newspaper,
    ArrowLeft,
    Info,
} from "lucide-react";
import { useAuth, useOptionalAuth } from "@/contexts/auth-context";
import { subscribeToNewsletter } from "@/lib/newsletter";
import type { AuthMode, JoinModalView } from "@/contexts/join-modal-context";

interface JoinModalProps {
    isOpen: boolean;
    onClose: () => void;
    view: JoinModalView;
    onViewChange: (view: JoinModalView) => void;
    authMode: AuthMode;
    onAuthModeChange: (mode: AuthMode) => void;
}

export function JoinModal({
    isOpen,
    onClose,
    view,
    onViewChange,
    authMode,
    onAuthModeChange,
}: JoinModalProps) {
    const router = useRouter();
    const { user } = useOptionalAuth();
    const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (!isOpen) return null;

    const resetMessages = () => {
        setError("");
        setSuccess("");
    };

    const handleClose = () => {
        resetMessages();
        onClose();
    };

    const handleAuthSuccess = () => {
        handleClose();
        router.push("/dashboard");
    };

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            resetMessages();
            await signInWithGoogle();
            handleAuthSuccess();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to sign in with Google");
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            resetMessages();
            if (authMode === "signup") {
                await signUpWithEmail(email, password);
            } else {
                await signInWithEmail(email, password);
            }
            handleAuthSuccess();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            resetMessages();
            await subscribeToNewsletter(newsletterEmail, "join-modal");
            setSuccess("You're on the list! We'll keep you posted on CODE news and events.");
            setNewsletterEmail("");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to subscribe");
        } finally {
            setLoading(false);
        }
    };

    const headerEyebrow =
        view === "choose" ? (
            <>
                <ShieldAlert className="w-3.5 h-3.5" />
                JOIN CODE
            </>
        ) : view === "newsletter" ? (
            <>
                <Newspaper className="w-3.5 h-3.5" />
                NEWSLETTER
            </>
        ) : (
            <>
                <ShieldAlert className="w-3.5 h-3.5" />
                MEMBER ACCESS
            </>
        );

    const headerTitle =
        view === "choose"
            ? "Stay connected"
            : view === "newsletter"
              ? "Join our newsletter"
              : authMode === "signup"
                ? "Create account"
                : "Sign in";

    const headerSubtitle =
        view === "choose"
            ? "Get CODE updates in your inbox, or create a platform account if you're a past or current member."
            : view === "newsletter"
              ? "Hear about events, workshops, and what CODE is building — no membership required."
              : authMode === "signup"
                ? "Register for the CODE platform. Your application will be reviewed by E-board."
                : "Enter credentials to access the CODE dashboard.";

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-modal-title"
        >
            <button
                type="button"
                className="absolute inset-0 bg-background/85 backdrop-blur-sm"
                onClick={handleClose}
                aria-label="Close dialog"
            />

            <div
                className="relative z-10 flex w-full max-w-md max-h-[min(90vh,720px)] flex-col overflow-hidden border border-primary/40 bg-card shadow-[0_0_60px_color-mix(in_oklch,var(--primary)_12%,transparent)] scanlines animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border/40 bg-primary/5 px-5 py-4">
                    <div className="min-w-0 pr-2">
                        <div className="mb-1 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-primary/80">
                            {headerEyebrow}
                        </div>
                        <h2 id="join-modal-title" className="text-xl font-black tracking-tight sm:text-2xl">
                            {headerTitle}
                        </h2>
                        <p className="mt-1.5 text-xs font-mono leading-relaxed text-muted-foreground">
                            {headerSubtitle}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="shrink-0 rounded-sm border border-border/60 p-2 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="custom-scroll flex-1 overflow-y-auto px-5 py-5">
                    {view !== "choose" && (
                        <button
                            type="button"
                            onClick={() => {
                                resetMessages();
                                onViewChange("choose");
                            }}
                            className="mb-4 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="h-3 w-3" /> Back
                        </button>
                    )}

                    {view === "choose" && (
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => {
                                    resetMessages();
                                    onViewChange("newsletter");
                                }}
                                className="group flex w-full items-center gap-4 border border-border/50 bg-background/50 p-4 text-left transition-all hover:border-primary/50"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary/30 bg-primary/10 transition-colors group-hover:bg-primary/20">
                                    <Newspaper className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold uppercase tracking-wider">Join newsletter</div>
                                    <div className="mt-0.5 text-[10px] font-mono text-muted-foreground">
                                        Events, updates &amp; community news — open to everyone
                                    </div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    resetMessages();
                                    if (user) {
                                        handleClose();
                                        router.push("/dashboard");
                                        return;
                                    }
                                    onAuthModeChange("signin");
                                    onViewChange("auth");
                                }}
                                className="group flex w-full items-center gap-4 border border-border/50 bg-background/50 p-4 text-left transition-all hover:border-primary/50"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary/30 bg-primary/10 transition-colors group-hover:bg-primary/20">
                                    <UserPlus className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold uppercase tracking-wider">
                                        {user ? "Enter dashboard" : "Create account / Sign in"}
                                    </div>
                                    <div className="mt-0.5 text-[10px] font-mono text-muted-foreground">
                                        Platform access for past &amp; current CODE members only
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}

                    {view === "newsletter" && (
                        <>
                            {error && <AlertBox variant="error" message={error} />}
                            {success && <AlertBox variant="success" message={success} />}

                            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-mono uppercase text-muted-foreground" htmlFor="newsletter-email">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            id="newsletter-email"
                                            type="email"
                                            required
                                            value={newsletterEmail}
                                            onChange={(e) => setNewsletterEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full border border-border/50 bg-background/50 py-3 pl-10 pr-4 text-sm font-mono transition-colors focus:border-primary/50 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex h-11 w-full items-center justify-center gap-2 bg-primary text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                                    Subscribe
                                </button>
                            </form>
                        </>
                    )}

                    {view === "auth" && (
                        <>
                            <div className="mb-4 flex items-start gap-2 border border-primary/20 bg-primary/5 p-3 text-[10px] font-mono leading-relaxed text-muted-foreground">
                                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span>
                                    <strong className="text-foreground">Past or current CODE members only.</strong>{" "}
                                    If you haven&apos;t been part of Babson CODE, use the newsletter option instead — or reach out to{" "}
                                    <span className="text-primary">code@babson.edu</span>.
                                </span>
                            </div>

                            {error && <AlertBox variant="error" message={error} />}

                            <button
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="group relative flex h-11 w-full items-center justify-center gap-3 overflow-hidden border border-border bg-background/50 text-sm font-bold tracking-wider transition-all hover:border-primary/50 hover:bg-card disabled:opacity-50"
                            >
                                <div className="absolute inset-0 translate-y-full bg-primary/5 transition-transform group-hover:translate-y-0" />
                                {loading ? (
                                    <Loader2 className="relative z-10 h-4 w-4 animate-spin" />
                                ) : (
                                    <svg className="relative z-10 h-4 w-4" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                )}
                                <span className="relative z-10 uppercase">Google Auth</span>
                            </button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border/50" />
                                </div>
                                <div className="relative flex justify-center text-[10px] font-mono tracking-widest">
                                    <span className="bg-card px-3 uppercase text-muted-foreground">Email</span>
                                </div>
                            </div>

                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-mono uppercase text-muted-foreground" htmlFor="auth-email">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            id="auth-email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="user@babson.edu"
                                            className="w-full border border-border/50 bg-background/50 py-3 pl-10 pr-4 text-sm font-mono transition-colors focus:border-primary/50 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-mono uppercase text-muted-foreground" htmlFor="auth-password">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            id="auth-password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            minLength={8}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full border border-border/50 bg-background/50 py-3 pl-10 pr-10 text-sm font-mono transition-colors focus:border-primary/50 focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-2 flex h-11 w-full items-center justify-center gap-2 bg-primary text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Terminal className="h-4 w-4" />}
                                    {authMode === "signup" ? "Create account" : "Sign in"}
                                </button>
                            </form>

                            <p className="mt-4 text-center text-[10px] font-mono text-muted-foreground">
                                {authMode === "signin" ? (
                                    <>
                                        Need an account?{" "}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                resetMessages();
                                                onAuthModeChange("signup");
                                            }}
                                            className="uppercase tracking-wider text-primary hover:underline"
                                        >
                                            Sign up
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{" "}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                resetMessages();
                                                onAuthModeChange("signin");
                                            }}
                                            className="uppercase tracking-wider text-primary hover:underline"
                                        >
                                            Sign in
                                        </button>
                                    </>
                                )}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function AlertBox({ variant, message }: { variant: "error" | "success"; message: string }) {
    return (
        <div
            className={`mb-4 flex items-start gap-2 border p-4 text-xs font-mono ${
                variant === "error"
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-success/30 bg-success/10 text-success"
            }`}
        >
            {variant === "error" ? <ShieldAlert className="h-4 w-4 shrink-0" /> : <Mail className="h-4 w-4 shrink-0" />}
            <span>{message}</span>
        </div>
    );
}
