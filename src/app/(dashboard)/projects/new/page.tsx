"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProjects, useMembers } from "@/hooks/useFirestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { ArrowLeft, Rocket, Terminal, Image as ImageIcon, LinkIcon, GitBranch, AlignLeft, Loader2, Upload, X, Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const TEAM_ROLES = ["lead", "developer", "designer", "member"] as const;

type TeamMemberEntry = { uid: string; role: string; name?: string };

export default function NewProjectPage() {
    const { profile } = useAuth();
    const router = useRouter();
    const { createProject } = useProjects();
    const { data: members } = useMembers();
    const [submitting, setSubmitting] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
        githubUrl: "",
        liveUrl: "",
        coverImage: "",
        content: "",
    });
    const [teamMembers, setTeamMembers] = useState<TeamMemberEntry[]>(() =>
        profile ? [{ uid: profile.uid, role: "lead", name: profile.displayName || "" }] : []
    );
    const [memberSearch, setMemberSearch] = useState("");
    const [showMemberPicker, setShowMemberPicker] = useState(false);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

    const addedUids = useMemo(() => new Set(teamMembers.map((m) => m.uid)), [teamMembers]);
    const availableMembers = useMemo(
        () => members.filter((m) => !addedUids.has(m.id)),
        [members, addedUids]
    );
    const filteredAvailable = useMemo(
        () =>
            !memberSearch.trim()
                ? availableMembers.slice(0, 8)
                : availableMembers.filter(
                    (m) =>
                        m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                        m.email.toLowerCase().includes(memberSearch.toLowerCase())
                ).slice(0, 8),
        [availableMembers, memberSearch]
    );

    const addTeamMember = (uid: string, name: string, role: string = "member") => {
        if (addedUids.has(uid)) return;
        setTeamMembers((prev) => [...prev, { uid, role, name }]);
        setMemberSearch("");
        setShowMemberPicker(false);
    };
    const removeTeamMember = (uid: string) => {
        setTeamMembers((prev) => prev.filter((m) => m.uid !== uid));
    };
    const setMemberRole = (uid: string, role: string) => {
        setTeamMembers((prev) => prev.map((m) => (m.uid === uid ? { ...m, role } : m)));
    };

    useEffect(() => {
        if (profile && teamMembers.length === 0) {
            setTeamMembers([{ uid: profile.uid, role: "lead", name: profile.displayName || "" }]);
        }
    }, [profile]);

    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const [coverDragActive, setCoverDragActive] = useState(false);
    const [galleryDragActive, setGalleryDragActive] = useState(false);

    const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processCoverFile(file);
        e.target.value = "";
    };
    const handleGalleryFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length) processGalleryFiles(files);
        e.target.value = "";
    };
    const removeGalleryImage = (index: number) => {
        setGalleryFiles((p) => p.filter((_, i) => i !== index));
        setGalleryPreviews((p) => p.filter((_, i) => i !== index));
    };

    const processCoverFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        setCoverImageFile(file);
        setForm((f) => ({ ...f, coverImage: "" }));
        const reader = new FileReader();
        reader.onloadend = () => setCoverImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const processGalleryFiles = (files: File[]) => {
        const images = files.filter((f) => f.type.startsWith("image/"));
        setGalleryFiles((prev) => [...prev, ...images]);
        images.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => setGalleryPreviews((p) => [...p, reader.result as string]);
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.description.trim()) return;

        setSubmitting(true);
        try {
            const uid = profile?.uid || "anon";
            let coverUrl = form.coverImage?.trim() || null;

            if (coverImageFile) {
                const coverRef = ref(storage, `projects/${uid}/${Date.now()}_cover`);
                await uploadBytes(coverRef, coverImageFile);
                coverUrl = await getDownloadURL(coverRef);
            }

            const galleryUrls: string[] = [];
            for (let i = 0; i < galleryFiles.length; i++) {
                const file = galleryFiles[i];
                const galleryRef = ref(storage, `projects/${uid}/${Date.now()}_gallery_${i}`);
                await uploadBytes(galleryRef, file);
                galleryUrls.push(await getDownloadURL(galleryRef));
            }

            await createProject({
                name: form.name,
                description: form.description,
                githubUrl: form.githubUrl || null,
                liveUrl: form.liveUrl || null,
                coverImage: coverUrl,
                gallery: galleryUrls,
                content: form.content,
                teamMembers: teamMembers.length > 0 ? teamMembers : [{ uid: profile?.uid || "", role: "lead", name: profile?.displayName || "" }],
            });

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
                        Add a completed or in-progress project to the CODE public directory.
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

                {/* Team Members */}
                <div className="hud-panel bg-card/60 border border-border/40 p-6 sm:p-8 scanlines relative">
                    <div className="flex items-center justify-between mb-6 border-b border-border/40 pb-4 relative z-10">
                        <h2 className="font-bold text-lg font-mono tracking-tight uppercase flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" /> TEAM MEMBERS
                        </h2>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{teamMembers.length} CONTRIBUTOR{teamMembers.length !== 1 ? "S" : ""}</span>
                    </div>
                    <div className="space-y-4 relative z-10">
                        <div className="flex flex-wrap gap-2">
                            {teamMembers.map((m) => (
                                <div
                                    key={m.uid}
                                    className="flex items-center gap-2 px-3 py-2 hud-panel-sm bg-background/60 border border-border/50"
                                >
                                    <select
                                        value={m.role}
                                        onChange={(e) => setMemberRole(m.uid, e.target.value)}
                                        className="bg-transparent text-[10px] font-mono font-bold uppercase tracking-widest text-primary border-none focus:outline-none cursor-pointer pr-1"
                                    >
                                        {TEAM_ROLES.map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                    <span className="text-xs font-mono truncate max-w-[120px]">{m.name || m.uid.slice(0, 8)}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeTeamMember(m.uid)}
                                        disabled={m.uid === profile?.uid && teamMembers.length === 1}
                                        className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        title={m.uid === profile?.uid && teamMembers.length === 1 ? "Keep at least one member (you)" : "Remove"}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowMemberPicker((v) => !v)}
                                className="flex items-center gap-2 px-4 py-2.5 hud-panel-sm border border-dashed border-primary/50 text-primary text-xs font-mono uppercase tracking-wider hover:bg-primary/10 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> ADD MEMBER
                            </button>
                            {showMemberPicker && (
                                <>
                                    <div className="absolute left-0 right-0 top-full mt-2 z-20 hud-panel-sm bg-card border border-border/50 p-2 max-h-64 overflow-y-auto">
                                        <input
                                            type="text"
                                            value={memberSearch}
                                            onChange={(e) => setMemberSearch(e.target.value)}
                                            placeholder="Search by name or email..."
                                            className="w-full px-3 py-2 mb-2 hud-panel-sm bg-background/50 border border-border/50 text-sm font-mono focus:outline-none focus:border-primary/50"
                                        />
                                        {filteredAvailable.length === 0 ? (
                                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest py-3 text-center">No members to add.</p>
                                        ) : (
                                            <ul className="space-y-1">
                                                {filteredAvailable.map((mem) => (
                                                    <li key={mem.id}>
                                                        <button
                                                            type="button"
                                                            onClick={() => addTeamMember(mem.id, mem.name)}
                                                            className="w-full flex items-center justify-between px-3 py-2 text-left hud-panel-sm bg-background/40 border border-transparent hover:border-primary/50 hover:bg-primary/5 transition-colors"
                                                        >
                                                            <span className="text-xs font-mono font-bold uppercase truncate">{mem.name}</span>
                                                            <span className="text-[9px] font-mono text-muted-foreground truncate max-w-[140px]">{mem.email}</span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowMemberPicker(false)} aria-hidden="true" />
                                </>
                            )}
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
                                <ImageIcon className="w-3 h-3 text-primary" /> COVER IMAGE
                            </label>
                            <p className="text-[10px] font-mono text-muted-foreground mb-2">Drag and drop an image, click to upload, or paste a URL.</p>
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => coverInputRef.current?.click()}
                                onKeyDown={(e) => e.key === "Enter" && coverInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setCoverDragActive(true); }}
                                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setCoverDragActive(false); }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setCoverDragActive(false);
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) processCoverFile(file);
                                }}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-2 rounded-none border-2 border-dashed p-8 min-h-[140px] transition-colors cursor-pointer",
                                    coverDragActive
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border/50 bg-background/30 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary"
                                )}
                            >
                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverFile}
                                    className="hidden"
                                />
                                <Upload className={cn("w-10 h-10", coverDragActive && "scale-110")} />
                                <span className="text-xs font-mono font-bold uppercase tracking-widest">
                                    {coverDragActive ? "DROP COVER IMAGE" : "DRAG & DROP OR CLICK TO UPLOAD"}
                                </span>
                                <span className="text-[10px] font-mono opacity-80">JPG, PNG, WEBP</span>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-3">
                                <input
                                    type="url"
                                    value={form.coverImage}
                                    onChange={(e) => {
                                        setForm({ ...form, coverImage: e.target.value });
                                        if (e.target.value) { setCoverImageFile(null); setCoverImagePreview(null); }
                                    }}
                                    placeholder="Or paste image URL..."
                                    className="flex-1 min-w-[200px] px-4 py-3 hud-panel-sm bg-background/50 border border-border/50 focus:border-primary/50 text-sm font-mono transition-colors focus:outline-none"
                                />
                            </div>
                            {(coverImagePreview || form.coverImage) && (
                                <div className="mt-4 aspect-video w-full max-w-md bg-background/50 border border-border/50 hud-corners overflow-hidden p-1 relative group">
                                    <img
                                        src={coverImagePreview || form.coverImage || ""}
                                        alt="Cover Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => (e.currentTarget.style.display = "none")}
                                    />
                                    {coverImageFile && (
                                        <button
                                            type="button"
                                            onClick={() => { setCoverImageFile(null); setCoverImagePreview(null); }}
                                            className="absolute top-2 right-2 p-1.5 bg-destructive/90 text-destructive-foreground rounded hud-panel-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                GALLERY IMAGES (OPTIONAL)
                            </label>
                            <p className="text-[10px] font-mono text-muted-foreground mb-2">Drag and drop or click to add multiple images.</p>
                            <input
                                ref={galleryInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleGalleryFiles}
                                className="hidden"
                            />
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => galleryInputRef.current?.click()}
                                onKeyDown={(e) => e.key === "Enter" && galleryInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setGalleryDragActive(true); }}
                                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setGalleryDragActive(false); }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setGalleryDragActive(false);
                                    const files = Array.from(e.dataTransfer.files || []);
                                    if (files.length) processGalleryFiles(files);
                                }}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 rounded-none border-2 border-dashed p-6 min-h-[100px] transition-colors cursor-pointer",
                                    galleryDragActive
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border/50 bg-background/30 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary"
                                )}
                            >
                                <Upload className={cn("w-8 h-8", galleryDragActive && "scale-110")} />
                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
                                    {galleryDragActive ? "DROP IMAGES" : "DRAG & DROP OR CLICK TO ADD GALLERY IMAGES"}
                                </span>
                            </div>
                            {galleryPreviews.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {galleryPreviews.map((src, i) => (
                                        <div key={i} className="relative w-20 h-20 hud-corners border border-border/50 overflow-hidden group">
                                            <img src={src} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(i)}
                                                className="absolute inset-0 bg-destructive/80 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
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
                    <div className="flex items-center justify-between mb-6 border-b border-border/40 pb-4 relative z-10">
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
