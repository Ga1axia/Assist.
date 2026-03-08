"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProjects } from "@/hooks/useFirestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Rocket, Terminal, Image as ImageIcon, LinkIcon, GitBranch, AlignLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewProjectPage() {
    const { profile } = useAuth();
    const router = useRouter();
    const { createProject } = useProjects();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: "",
        description: "",
        githubUrl: "",
        liveUrl: "",
        coverImage: "",
        content: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.description.trim()) return;

        setSubmitting(true);
        try {
            await createProject({
                name: form.name,
                description: form.description,
                githubUrl: form.githubUrl || null,
                liveUrl: form.liveUrl || null,
                coverImage: form.coverImage || null,
                content: form.content,
                teamMembers: [{ uid: profile?.uid || "", role: "lead", name: profile?.displayName || "" }],
            });

            // Redirect back to projects gallery
            router.push("/projects");
        } catch (error) {
            console.error("Failed to create project:", error);
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in relative z-10 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start gap-4 pb-6 border-b border-border/50">
                <Link
                    href="/projects"
                    className="p-2 hud-panel-sm bg-background border border-border/40 hover:border-primary/50 hover:text-primary transition-colors text-muted-foreground mt-1"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-primary/80 uppercase tracking-widest mb-1.5">
                        <Terminal className="w-3 h-3" />
                        SYSTEM_OVERRIDE: PORTFOLIO_ENTRY
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">
                        SUBMIT <span className="gradient-text text-transparent bg-clip-text">NEW PROJECT</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-mono mt-2">
                        Add a completed or in-progress project to The Generator public directory.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Core Details */}
                <div className="hud-panel bg-card/60 border border-border/40 p-6 sm:p-8 scanlines relative">
                    <div className="flex items-center justify-between mb-6 border-b border-border/40 pb-4 relative z-10">
                        <h2 className="font-bold text-lg font-mono tracking-tight uppercase">PRIMARY CLASSIFICATION</h2>
                    </div>

                    <div className="space-y-5 relative z-10">
                        <div>
                            <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">PROJECT TITLE</label>
                            <input
                                required
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="E.G. Neural Interface v2"
                                className="w-full px-4 py-3 hud-panel-sm bg-background/50 border border-border/50 focus:border-primary/50 text-base font-mono uppercase transition-colors focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">ELEVATOR PITCH (ONE-LINER)</label>
                            <input
                                required
                                type="text"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                maxLength={150}
                                placeholder="A brief description of what it is and who it's for..."
                                className="w-full px-4 py-3 hud-panel-sm bg-background/50 border border-border/50 focus:border-primary/50 text-sm font-mono transition-colors focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Media & Links */}
                <div className="hud-panel bg-card/60 border border-border/40 p-6 sm:p-8 scanlines relative">
                    <div className="flex items-center justify-between mb-6 border-b border-border/40 pb-4 relative z-10">
                        <h2 className="font-bold text-lg font-mono tracking-tight uppercase text-chart-2">MEDIA & ENDPOINTS</h2>
                    </div>

                    <div className="space-y-5 relative z-10">
                        <div>
                            <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <ImageIcon className="w-3 h-3 text-primary" /> COVER IMAGE URL
                            </label>
                            <input
                                type="url"
                                value={form.coverImage}
                                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                                placeholder="https://example.com/image.png"
                                className="w-full px-4 py-3 hud-panel-sm bg-background/50 border border-border/50 focus:border-primary/50 text-sm font-mono transition-colors focus:outline-none"
                            />
                            {form.coverImage && (
                                <div className="mt-4 aspect-video w-full max-w-md bg-background/50 border border-border/50 hud-corners overflow-hidden p-1">
                                    <img src={form.coverImage} alt="Cover Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                            )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-5">
                            <div>
                                <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                    <GitBranch className="w-3 h-3 text-chart-1" /> GITHUB REPOSITORY URL
                                </label>
                                <input
                                    type="url"
                                    value={form.githubUrl}
                                    onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                                    placeholder="https://github.com/..."
                                    className="w-full px-4 py-3 hud-panel-sm bg-background/50 border border-border/50 focus:border-primary/50 text-sm font-mono transition-colors focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                    <LinkIcon className="w-3 h-3 text-success" /> LIVE DEPLOYMENT URL
                                </label>
                                <input
                                    type="url"
                                    value={form.liveUrl}
                                    onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                                    placeholder="https://my-project.app"
                                    className="w-full px-4 py-3 hud-panel-sm bg-background/50 border border-border/50 focus:border-primary/50 text-sm font-mono transition-colors focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* The Story */}
                <div className="hud-panel bg-card/60 border border-border/40 p-6 sm:p-8 scanlines relative">
                    <div className="flexible items-center justify-between mb-6 border-b border-border/40 pb-4 relative z-10">
                        <h2 className="font-bold text-lg font-mono tracking-tight uppercase text-primary">PROJECT LOG (THE STORY)</h2>
                        <p className="text-xs font-mono text-muted-foreground mt-1">Write a blog post about how you built this, what tech stack you used, and what you learned. Markdown formatting is supported.</p>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 bg-background/80 border border-b-0 border-border/50 px-4 py-2 hud-corners-top text-muted-foreground">
                            <AlignLeft className="w-4 h-4" />
                            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">MARKDOWN EDITOR</span>
                        </div>
                        <textarea
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            placeholder="Write your story here..."
                            rows={15}
                            className="w-full px-4 py-4 hud-corners-bottom bg-background/50 border border-border/50 focus:border-primary/50 text-sm font-sans transition-colors focus:outline-none resize-y leading-relaxed"
                        />
                    </div>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end gap-4 relative z-10">
                    <Link href="/projects" className="px-6 py-3 hud-panel-sm bg-background/60 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border transition-colors text-xs font-bold font-mono uppercase tracking-widest">
                        CANCEL
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className={cn(
                            "px-8 py-3 hud-panel text-primary-foreground text-xs font-bold font-mono uppercase tracking-widest transition-all glow-border-strong flex items-center gap-2",
                            submitting ? "bg-primary/50 cursor-not-allowed" : "bg-primary hover:brightness-110"
                        )}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                DEPLOYING DIRECTORY ENTRY...
                            </>
                        ) : (
                            <>
                                <Rocket className="w-4 h-4" />
                                PUBLISH PROJECT SHOWCASE
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
