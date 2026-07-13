"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { ETOWER_LOGO } from "@/lib/demo-data";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, ShieldAlert } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { signInWithGoogle, signInWithEmail, user, loading: authLoading, needsOnboarding } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading || !user) return;
        router.replace(needsOnboarding ? "/onboarding" : "/dashboard");
    }, [authLoading, user, needsOnboarding, router]);

    const handleGoogleSignIn = () => {
        setError("");
        setLoading(true);
        void signInWithGoogle().catch((err: unknown) => {
            setError(err instanceof Error ? err.message : "Failed to sign in with Google");
            setLoading(false);
        });
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");
            await signInWithEmail(email, password);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Authentication failed");
            setLoading(false);
        }
    };

    return (
        <div className="etower-app etower-page min-h-screen flex relative overflow-hidden">
            <div className="pointer-events-none fixed inset-0 bg-grid-brutalist opacity-80" />

            <div className="hidden lg:flex lg:w-1/2 relative border-r border-[rgba(0,255,65,0.25)] items-center justify-center p-12 z-10">
                <div className="relative z-10 max-w-lg text-center">
                    <Image
                        src={ETOWER_LOGO}
                        alt="eTower"
                        width={200}
                        height={56}
                        className="h-14 w-auto mx-auto object-contain brightness-0 invert mb-8"
                        priority
                    />
                    <h1 className="text-4xl font-black tracking-tight mb-4">
                        Member <span className="text-[#00ff41]">Portal</span>
                    </h1>
                    <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto">
                        Sign in to access the eTower management dashboard — projects, events,
                        resources, and community tools for residents and alumni.
                    </p>
                    <div className="mt-10 grid grid-cols-3 gap-3">
                        {["Projects", "Events", "Network"].map((label) => (
                            <div
                                key={label}
                                className="etower-card p-3 text-xs font-bold uppercase tracking-wider text-white/80"
                            >
                                {label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
                <div className="w-full max-w-md">
                    <div className="flex items-center justify-between mb-8">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-[#00ff41] transition-colors"
                        >
                            <ArrowLeft className="w-3 h-3" /> Back to site
                        </Link>
                    </div>

                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <Image
                            src={ETOWER_LOGO}
                            alt="eTower"
                            width={120}
                            height={32}
                            className="h-8 w-auto object-contain brightness-0 invert"
                        />
                    </div>

                    <div className="etower-card p-8 relative">
                        <p className="etower-section-label mb-3">Member access</p>
                        <h2 className="text-2xl font-bold tracking-tight mb-2">Sign in</h2>
                        <p className="text-white/55 text-sm mb-6">
                            Demo mode is on — Firebase is unlinked. Click any sign-in option to enter the
                            eTower management portal with sample data.
                        </p>

                        {error && (
                            <div className="mb-6 p-4 border border-red-500/40 bg-red-500/10 text-red-300 text-xs flex items-start gap-2">
                                <ShieldAlert className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full h-11 flex items-center justify-center gap-3 border border-[rgba(0,255,65,0.3)] bg-[#0a1628] text-sm font-bold uppercase tracking-wider hover:border-[#00ff41] hover:text-[#00ff41] transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            )}
                            Continue with Google
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[rgba(0,255,65,0.2)]" />
                            </div>
                            <div className="relative flex justify-center text-[10px] font-bold tracking-widest uppercase">
                                <span className="px-3 bg-[#1a2332] text-white/45">or email</span>
                            </div>
                        </div>

                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-white/50 mb-1.5 uppercase tracking-wider" htmlFor="email">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@babson.edu"
                                        className="w-full pl-10 pr-4 py-3 bg-[#0a1628] border border-[rgba(0,255,65,0.3)] text-sm focus:border-[#00ff41] focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 mb-1.5 uppercase tracking-wider" htmlFor="password">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        minLength={8}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-3 bg-[#0a1628] border border-[rgba(0,255,65,0.3)] text-sm focus:border-[#00ff41] focus:outline-none transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#00ff41] transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="etower-btn etower-btn--primary w-full h-11 text-sm disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Sign in
                            </button>
                        </form>
                    </div>

                    <p className="mt-8 text-center text-[11px] text-white/40 uppercase tracking-wider leading-relaxed">
                        For current and former eTower members.
                        <br />
                        Need access? Email etowerbabson@gmail.com
                    </p>
                </div>
            </div>
        </div>
    );
}
