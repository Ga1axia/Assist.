"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { STARTUP_BUSINESS_CATEGORIES } from "@/lib/startup-gallery";
import { ArrowLeft, Loader2, Send, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { DEMO_MODE } from "@/lib/demo-mode";

export default function SubmitStartupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const submitted = searchParams.get("submitted") === "1";
    const { user, profile, loading: authLoading } = useAuth();
    const [name, setName] = useState("");
    const [companyOverview, setCompanyOverview] = useState("");
    const [founderStory, setFounderStory] = useState("");
    const [founders, setFounders] = useState("");
    const [foundedYear, setFoundedYear] = useState("");
    const [businessCategory, setBusinessCategory] = useState<string>(STARTUP_BUSINESS_CATEGORIES[0]);
    const [website, setWebsite] = useState("");
    const [instagramUrl, setInstagramUrl] = useState("");
    const [linkedinCompanyUrl, setLinkedinCompanyUrl] = useState("");
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const logoRef = useRef<HTMLInputElement>(null);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authLoading && !user) router.replace("/login");
    }, [authLoading, user, router]);

    const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Please choose an image file (PNG, JPG, or WebP).");
            return;
        }
        setError("");
        setLogo(file);
        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !profile) return;
        if (
            !name.trim() ||
            !companyOverview.trim() ||
            !founderStory.trim() ||
            !founders.trim() ||
            !foundedYear.trim() ||
            !businessCategory.trim()
        ) {
            setError("Fill in all required fields (name, overview, founder story, founders, year founded, and category).");
            return;
        }
        setSending(true);
        setError("");
        try {
            if (DEMO_MODE) {
                router.push("/startups/submit?submitted=1");
                return;
            }
            let logoUrl: string | null = null;
            if (logo) {
                const safe = logo.name.replace(/[^\w.-]/g, "_").slice(0, 80);
                const path = `startup-logos/${user.uid}/${Date.now()}-${safe}`;
                const storageRef = ref(storage, path);
                await uploadBytes(storageRef, logo);
                logoUrl = await getDownloadURL(storageRef);
            }

            await addDoc(collection(db, "startups"), {
                name: name.trim(),
                companyOverview: companyOverview.trim(),
                founderStory: founderStory.trim(),
                founders: founders.trim(),
                foundedYear: foundedYear.trim(),
                businessCategory: businessCategory.trim(),
                website: website.trim() || null,
                instagramUrl: instagramUrl.trim() || null,
                linkedinCompanyUrl: linkedinCompanyUrl.trim() || null,
                logoUrl,
                status: "pending",
                submittedByUid: user.uid,
                submitterName: profile.displayName?.trim() || "Member",
                submitterGraduationYear: profile.graduationYear?.trim() || null,
                submitterPhotoURL: profile.photoURL?.trim() || null,
                createdAt: serverTimestamp(),
            });

            router.push("/startups/submit?submitted=1");
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Could not submit. Check you are signed in and try again.");
        } finally {
            setSending(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const inputClass =
        "w-full border border-[rgba(0,255,65,0.3)] bg-[#0a1628] px-4 py-3 text-sm transition-colors focus:border-[#00ff41] focus:outline-none";

    return (
        <div className="mx-auto max-w-3xl animate-fade-in space-y-6 pb-16 pt-4">
            <Link
                href="/startups"
                className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-white/50 hover:text-[#00ff41] transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to gallery
            </Link>

            <PageHeader
                eyebrow="Startup gallery"
                title="Propose a startup"
                description={
                    profile?.graduationYear
                        ? `E-board review required before it appears in the public gallery · Class of ${profile.graduationYear}`
                        : "E-board review required before it appears in the public gallery."
                }
            />

            <div className="etower-soft-card p-6 sm:p-8">
                {!profile?.graduationYear && (
                    <p className="mb-4 text-xs text-warning border border-warning/30 bg-warning/5 px-3 py-2">
                        Add your graduation year in onboarding or ask an admin to set it on your profile so the gallery can show your class year.
                    </p>
                )}

                {submitted && (
                    <div className="mb-6 border border-[rgba(0,255,65,0.35)] bg-[#00ff41]/10 px-4 py-3 text-sm leading-relaxed">
                        Proposal received. President, VP, community manager, or a functional VP will review it before it goes live in the gallery.
                        <div className="mt-4">
                            <Link href="/startups" className="etower-soft-btn etower-soft-btn etower-soft-btn--ghost text-xs px-4 py-2 inline-flex">
                                Back to gallery
                            </Link>
                        </div>
                    </div>
                )}

                {!submitted && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <section className="space-y-4">
                        <p className="etower-section-label border-b border-[rgba(0,255,65,0.2)] pb-2">Company</p>
                        <div>
                            <label className="mb-1.5 block text-xs font-bold tracking-wide text-white/50">Company name *</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} className={cn(inputClass, "uppercase")} placeholder="Acme Inc." />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-bold tracking-wide text-white/50">Business category *</label>
                            <select value={businessCategory} onChange={(e) => setBusinessCategory(e.target.value)} className={inputClass}>
                                {STARTUP_BUSINESS_CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-bold tracking-wide text-white/50">Year founded *</label>
                            <input
                                value={foundedYear}
                                onChange={(e) => setFoundedYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                className={inputClass}
                                placeholder="2024"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-bold tracking-wide text-white/50">Company overview *</label>
                            <p className="mb-1 text-xs text-white/45">What you do in a few sentences (shown on the gallery card and at the top of the detail view).</p>
                            <textarea
                                value={companyOverview}
                                onChange={(e) => setCompanyOverview(e.target.value)}
                                rows={4}
                                className={cn(inputClass, "resize-none")}
                                placeholder="Product, customers, stage…"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-bold tracking-wide text-white/50">Founder story *</label>
                            <p className="mb-1 text-xs text-white/45">Why you started this, milestones, vision—longer narrative for the detail view.</p>
                            <textarea
                                value={founderStory}
                                onChange={(e) => setFounderStory(e.target.value)}
                                rows={6}
                                className={cn(inputClass, "resize-none")}
                                placeholder="Tell the eTower community your story…"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-bold tracking-wide text-white/50">Founding team (public names) *</label>
                            <input
                                value={founders}
                                onChange={(e) => setFounders(e.target.value)}
                                className={inputClass}
                                placeholder="Names as they should appear publicly"
                            />
                        </div>
                    </section>

                    <section className="space-y-4">
                        <p className="etower-section-label border-b border-[rgba(0,255,65,0.2)] pb-2">Links & brand</p>
                        <div>
                            <label className="mb-1.5 block text-xs font-bold tracking-wide text-white/50">Company website</label>
                            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} placeholder="https://…" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-bold tracking-wide text-white/50">Instagram</label>
                            <input
                                value={instagramUrl}
                                onChange={(e) => setInstagramUrl(e.target.value)}
                                className={inputClass}
                                placeholder="@handle or full profile URL"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-bold tracking-wide text-white/50">Company LinkedIn</label>
                            <input
                                value={linkedinCompanyUrl}
                                onChange={(e) => setLinkedinCompanyUrl(e.target.value)}
                                className={inputClass}
                                placeholder="company/your-company or full URL"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-bold tracking-wide text-white/50">Company logo (optional)</label>
                            <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogo} />
                            <button
                                type="button"
                                onClick={() => logoRef.current?.click()}
                                className={cn(
                                    "flex w-full cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-4 py-6 transition-colors",
                                    logo ? "border-[#00ff41]/40 bg-[#00ff41]/5" : "border-[rgba(0,255,65,0.3)] bg-[#0a1628] hover:border-[#00ff41]"
                                )}
                            >
                                {logoPreview ? (
                                    <img src={logoPreview} alt="" className="h-20 w-20 border border-[rgba(0,255,65,0.3)] object-contain" />
                                ) : (
                                    <ImageIcon className="h-8 w-8 text-white/40" />
                                )}
                                <span className="text-xs font-bold tracking-wide text-white/50">
                                    {logo ? "Tap to change image" : "PNG, JPG, or WebP"}
                                </span>
                            </button>
                        </div>
                    </section>

                    {error && <p className="text-xs text-destructive">{error}</p>}

                    <button
                        type="submit"
                        disabled={sending}
                        className="etower-soft-btn etower-btn--primary w-full h-11 text-sm disabled:opacity-50"
                    >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {sending ? "Submitting…" : "Submit proposal"}
                    </button>
                </form>
                )}
            </div>
        </div>
    );
}
