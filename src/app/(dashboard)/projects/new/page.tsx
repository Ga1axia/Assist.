"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProjects, useMembers } from "@/hooks/useFirestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { DEMO_MODE } from "@/lib/demo-mode";
import { ArrowLeft, Rocket, Image as ImageIcon, LinkIcon, GitBranch, AlignLeft, Loader2, Upload, X, Users, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";

const TEAM_ROLES = ["lead", "developer", "designer", "member"] as const;

type TeamMemberEntry = { uid: string; role: string; name?: string };

const inputClass =
    "w-full px-4 py-3 rounded-xl bg-[#0a1628] border border-[rgba(0,255,65,0.28)] focus:border-[#00ff41] text-sm transition-colors focus:outline-none";

export default function NewProjectPage() {
    const { profile } = useAuth();
    const router = useRouter();
    const { createProject } = useProjects();
    const { data: members, loading: membersLoading } = useMembers();
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
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

    const addedUids = useMemo(() => new Set(teamMembers.map((m) => m.uid)), [teamMembers]);
    const nonAlumniMembers = useMemo(
        () => members.filter((m) => m.role !== "alumni"),
        [members]
    );
    const filteredMemberList = useMemo(() => {
        if (!memberSearch.trim()) return nonAlumniMembers;
        const q = memberSearch.toLowerCase().trim();
        return nonAlumniMembers.filter(
            (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
        );
    }, [nonAlumniMembers, memberSearch]);

    const toggleTeamMember = (mem: { id: string; name: string }) => {
        if (addedUids.has(mem.id)) {
            if (teamMembers.length <= 1) return;
            if (mem.id === profile?.uid) return;
            setTeamMembers((prev) => prev.filter((m) => m.uid !== mem.id));
        } else {
            setTeamMembers((prev) => [...prev, { uid: mem.id, role: "member", name: mem.name }]);
        }
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
            if (DEMO_MODE) {
                router.push("/projects");
                return;
            }

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
                teamMembers:
                    teamMembers.length > 0
                        ? teamMembers
                        : [{ uid: profile?.uid || "", role: "lead", name: profile?.displayName || "" }],
            });

            router.push("/projects");
        } catch (error) {
            console.error("Failed to create project:", error);
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in relative z-10 pb-20">
            <div className="flex items-start gap-3">
                <Link
                    href="/projects"
                    className="etower-soft-btn etower-soft-btn--ghost p-2.5 mt-1"
                    aria-label="Back to projects"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <PageHeader
                    className="flex-1 border-b-0 pb-0"
                    eyebrow="Projects"
                    title="New project"
                    description="Add a completed or in-progress project to the eTower directory."
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="etower-soft-card p-6 sm:p-8">
                    <h2 className="font-semibold text-lg tracking-tight mb-6 border-b border-[rgba(0,255,65,0.18)] pb-4">
                        Basics
                    </h2>
                    <div className="space-y-5">
                        <div>
                            <label className="etower-section-label mb-1.5 block">Project title</label>
                            <input
                                required
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Campus event finder"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="etower-section-label mb-1.5 block">Short description</label>
                            <input
                                required
                                type="text"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                maxLength={150}
                                placeholder="A brief description of what it is and who it's for..."
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>

                <div className="etower-soft-card p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-4 border-b border-[rgba(0,255,65,0.18)] pb-4">
                        <h2 className="font-semibold text-lg tracking-tight flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#00ff41]" /> Team members
                        </h2>
                        <span className="text-xs text-white/45">{teamMembers.length} selected</span>
                    </div>
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                                type="text"
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                                placeholder="Search by name or email..."
                                className={cn(inputClass, "pl-10")}
                            />
                        </div>

                        {teamMembers.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {teamMembers.map((m) => (
                                    <div
                                        key={m.uid}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00ff41]/15 border border-[#00ff41]/40 text-[#00ff41] text-xs"
                                    >
                                        <select
                                            value={m.role}
                                            onChange={(e) => setMemberRole(m.uid, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="bg-transparent border-none focus:outline-none cursor-pointer text-xs font-semibold text-[#00ff41] pr-0.5 min-w-0"
                                        >
                                            {TEAM_ROLES.map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="truncate max-w-[100px]">{m.name || m.uid.slice(0, 8)}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeTeamMember(m.uid)}
                                            disabled={m.uid === profile?.uid && teamMembers.length === 1}
                                            className="p-0.5 text-[#00ff41]/80 hover:text-[#00ff41] hover:bg-[#00ff41]/20 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                                            title={
                                                m.uid === profile?.uid && teamMembers.length === 1
                                                    ? "Keep at least one member"
                                                    : "Remove"
                                            }
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="max-h-[40vh] overflow-y-auto space-y-4 pr-2 custom-scroll">
                            {membersLoading ? (
                                <div className="flex flex-col items-center justify-center py-8 gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin text-[#00ff41]" />
                                    <p className="text-xs text-white/45">Loading directory…</p>
                                </div>
                            ) : filteredMemberList.length === 0 ? (
                                <p className="text-xs text-white/45 py-4 text-center">
                                    {memberSearch.trim()
                                        ? "No matching members."
                                        : "No non-alumni members in directory."}
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {filteredMemberList.map((mem) => {
                                        const onTeam = addedUids.has(mem.id);
                                        return (
                                            <button
                                                key={mem.id}
                                                type="button"
                                                onClick={() => toggleTeamMember(mem)}
                                                className={cn(
                                                    "etower-soft-btn text-xs py-1.5 px-3",
                                                    onTeam
                                                        ? "etower-soft-btn--primary"
                                                        : "etower-soft-btn--ghost"
                                                )}
                                            >
                                                {mem.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="etower-soft-card p-6 sm:p-8">
                    <h2 className="font-semibold text-lg tracking-tight mb-6 border-b border-[rgba(0,255,65,0.18)] pb-4 text-[#00ff41]">
                        Media & links
                    </h2>
                    <div className="space-y-5">
                        <div>
                            <label className="etower-section-label mb-1.5 flex items-center gap-2">
                                <ImageIcon className="w-3 h-3 text-[#00ff41]" /> Cover image
                            </label>
                            <p className="text-xs text-white/45 mb-2">
                                Drag and drop an image, click to upload, or paste a URL.
                            </p>
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => coverInputRef.current?.click()}
                                onKeyDown={(e) => e.key === "Enter" && coverInputRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setCoverDragActive(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setCoverDragActive(false);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setCoverDragActive(false);
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) processCoverFile(file);
                                }}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 min-h-[140px] transition-colors cursor-pointer",
                                    coverDragActive
                                        ? "border-[#00ff41] bg-[#00ff41]/10 text-[#00ff41]"
                                        : "border-[rgba(0,255,65,0.28)] bg-[#0a1628]/60 hover:border-[#00ff41]/50 hover:bg-[#00ff41]/5 text-white/50 hover:text-[#00ff41]"
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
                                <span className="text-xs font-semibold">
                                    {coverDragActive ? "Drop cover image" : "Drag & drop or click to upload"}
                                </span>
                                <span className="text-[10px] opacity-80">JPG, PNG, WEBP</span>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-3">
                                <input
                                    type="url"
                                    value={form.coverImage}
                                    onChange={(e) => {
                                        setForm({ ...form, coverImage: e.target.value });
                                        if (e.target.value) {
                                            setCoverImageFile(null);
                                            setCoverImagePreview(null);
                                        }
                                    }}
                                    placeholder="Or paste image URL..."
                                    className={cn(inputClass, "flex-1 min-w-[200px]")}
                                />
                            </div>
                            {(coverImagePreview || form.coverImage) && (
                                <div className="mt-4 aspect-video w-full max-w-md rounded-2xl border border-[rgba(0,255,65,0.2)] overflow-hidden p-1 relative group">
                                    <img
                                        src={coverImagePreview || form.coverImage || ""}
                                        alt="Cover Preview"
                                        className="w-full h-full object-cover rounded-xl"
                                        onError={(e) => (e.currentTarget.style.display = "none")}
                                    />
                                    {coverImageFile && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCoverImageFile(null);
                                                setCoverImagePreview(null);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="etower-section-label mb-1.5 block">Gallery images (optional)</label>
                            <p className="text-xs text-white/45 mb-2">Drag and drop or click to add multiple images.</p>
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
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setGalleryDragActive(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setGalleryDragActive(false);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setGalleryDragActive(false);
                                    const files = Array.from(e.dataTransfer.files || []);
                                    if (files.length) processGalleryFiles(files);
                                }}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 min-h-[100px] transition-colors cursor-pointer",
                                    galleryDragActive
                                        ? "border-[#00ff41] bg-[#00ff41]/10 text-[#00ff41]"
                                        : "border-[rgba(0,255,65,0.28)] bg-[#0a1628]/60 hover:border-[#00ff41]/50 hover:bg-[#00ff41]/5 text-white/50 hover:text-[#00ff41]"
                                )}
                            >
                                <Upload className={cn("w-8 h-8", galleryDragActive && "scale-110")} />
                                <span className="text-xs font-semibold">
                                    {galleryDragActive ? "Drop images" : "Drag & drop or click to add gallery images"}
                                </span>
                            </div>
                            {galleryPreviews.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {galleryPreviews.map((src, i) => (
                                        <div
                                            key={i}
                                            className="relative w-20 h-20 rounded-xl border border-[rgba(0,255,65,0.2)] overflow-hidden group"
                                        >
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
                                <label className="etower-section-label mb-1.5 flex items-center gap-2">
                                    <GitBranch className="w-3 h-3 text-chart-1" /> GitHub repository
                                </label>
                                <input
                                    type="url"
                                    value={form.githubUrl}
                                    onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                                    placeholder="https://github.com/..."
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="etower-section-label mb-1.5 flex items-center gap-2">
                                    <LinkIcon className="w-3 h-3 text-success" /> Live URL
                                </label>
                                <input
                                    type="url"
                                    value={form.liveUrl}
                                    onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                                    placeholder="https://my-project.app"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="etower-soft-card p-6 sm:p-8">
                    <div className="mb-6 border-b border-[rgba(0,255,65,0.18)] pb-4">
                        <h2 className="font-semibold text-lg tracking-tight text-[#00ff41]">Project story</h2>
                        <p className="text-xs text-white/45 mt-1">
                            Share how you built this, the stack you used, and what you learned. Markdown is supported.
                        </p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 bg-[#0a1628]/80 border border-[rgba(0,255,65,0.2)] border-b-0 px-4 py-2 rounded-t-xl text-white/50">
                            <AlignLeft className="w-4 h-4" />
                            <span className="text-xs font-semibold">Markdown editor</span>
                        </div>
                        <textarea
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            placeholder="Write your story here..."
                            rows={15}
                            className="w-full px-4 py-4 rounded-b-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.28)] focus:border-[#00ff41] text-sm transition-colors focus:outline-none resize-y leading-relaxed"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link href="/projects" className="etower-soft-btn etower-soft-btn--ghost">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className={cn(
                            "etower-soft-btn etower-soft-btn--primary",
                            submitting && "opacity-60 cursor-not-allowed"
                        )}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Publishing…
                            </>
                        ) : (
                            <>
                                <Rocket className="w-4 h-4" />
                                Publish project
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
