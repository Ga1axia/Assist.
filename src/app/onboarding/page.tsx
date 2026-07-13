"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import {
    Sparkles,
    ChevronRight,
    ChevronLeft,
    Upload,
    Camera,
    Loader2,
    Code2,
    Search,
    X,
    FileText,
    Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { SKILL_CATEGORIES, INTEREST_CATEGORIES } from "@/lib/skills";

export default function OnboardingPage() {
    const router = useRouter();
    const { profile, refreshProfile } = useAuth();
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [displayName, setDisplayName] = useState(profile?.displayName || "");
    const [birthday, setBirthday] = useState("");
    const [graduationYear, setGraduationYear] = useState(profile?.graduationYear ?? "");
    const [bio, setBio] = useState("");
    const [funFact, setFunFact] = useState("");
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [standoutSkill, setStandoutSkill] = useState("");
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [skillSearch, setSkillSearch] = useState("");

    // File uploads
    const [headshot, setHeadshot] = useState<File | null>(null);
    const [headshotPreview, setHeadshotPreview] = useState<string | null>(null);
    const [resume, setResume] = useState<File | null>(null);
    const headshotRef = useRef<HTMLInputElement>(null);
    const resumeRef = useRef<HTMLInputElement>(null);

    const toggleSkill = (skill: string) => {
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter((s) => s !== skill));
            if (standoutSkill === skill) setStandoutSkill("");
        } else {
            setSelectedSkills([...selectedSkills, skill]);
        }
    };

    const toggleInterest = (interest: string) => {
        setSelectedInterests(
            selectedInterests.includes(interest)
                ? selectedInterests.filter((i) => i !== interest)
                : [...selectedInterests, interest]
        );
    };

    const handleHeadshot = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setHeadshot(file);
            const reader = new FileReader();
            reader.onloadend = () => setHeadshotPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleResume = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setResume(file);
    };

    const handleFinish = async () => {
        setSubmitting(true);
        try {
            const { auth: firebaseAuth } = await import("@/lib/firebase");
            const currentUser = firebaseAuth.currentUser;
            if (!currentUser) return;
            const uid = currentUser.uid;

            // Upload headshot
            let photoURL: string | null = null;
            if (headshot) {
                const headshotStorageRef = ref(storage, `users/${uid}/headshot`);
                await uploadBytes(headshotStorageRef, headshot);
                photoURL = await getDownloadURL(headshotStorageRef);
            }

            // Upload resume
            let resumeURL: string | null = null;
            if (resume) {
                const resumeStorageRef = ref(storage, `users/${uid}/resume`);
                await uploadBytes(resumeStorageRef, resume);
                resumeURL = await getDownloadURL(resumeStorageRef);
            }

            // Write user document directly to Firestore (client-side)
            const userDocRef = doc(db, "users", uid);
            await setDoc(userDocRef, {
                uid,
                email: currentUser.email || null,
                displayName,
                birthday: birthday || null,
                graduationYear: graduationYear.trim() || null,
                photoURL: photoURL || currentUser.photoURL || null,
                resumeURL,
                role: "member",
                residency: "resident",
                standoutSkill,
                bio,
                funFact: funFact.trim() || null,
                skills: selectedSkills,
                interests: selectedInterests,
                onboarded: true,
                joinDate: serverTimestamp(),
                lastActive: serverTimestamp(),
                engagementMetrics: {
                    attendanceRate: 0,
                    pitchesSubmitted: 0,
                    uploadsCount: 0,
                    projectsCompleted: 0,
                },
                projects: [],
                alumni: {
                    isAlumni: false,
                    mentorshipEnabled: false,
                    linkedinUrl: null,
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }, { merge: true });

            // Create activity feed entry
            await addDoc(collection(db, "activityFeed"), {
                type: "member_join",
                actorId: uid,
                actorName: displayName || "New Member",
                targetId: null,
                targetName: null,
                description: `joined CODE`,
                pinned: false,
                pinnedBy: null,
                createdAt: serverTimestamp(),
            });

            // Refresh auth context so needsOnboarding becomes false
            await refreshProfile();

            router.push("/dashboard");
        } catch (err) {
            console.error("Onboarding error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    // Filter skills by search
    const filteredSkillCategories = Object.entries(SKILL_CATEGORIES).reduce(
        (acc, [category, skills]) => {
            const filtered = skillSearch
                ? skills.filter((s) => s.toLowerCase().includes(skillSearch.toLowerCase()))
                : skills;
            if (filtered.length > 0) acc[category] = filtered;
            return acc;
        },
        {} as Record<string, string[]>
    );

    // Step validation
    const graduationYearOk =
        /^\d{4}$/.test(graduationYear.trim()) &&
        Number(graduationYear.trim()) >= 2000 &&
        Number(graduationYear.trim()) <= 2040;

    const stepValid = [
        // Step 0: Name, Birthday, graduation year, Bio & Fun Fact
        displayName.trim().length > 0 &&
            birthday.trim().length > 0 &&
            graduationYearOk &&
            bio.trim().length > 0 &&
            funFact.trim().length > 0,
        // Step 1: Select skills (at least 1)
        selectedSkills.length >= 1,
        // Step 2: Pick standout skill
        standoutSkill.length > 0,
        // Step 3: Interests (at least 1)
        selectedInterests.length >= 1,
        // Step 4: Headshot & Resume
        headshot !== null && resume !== null,
        // Step 5: Summary (always valid)
        true,
    ];

    const steps = [
        // ── Step 0: Welcome ──
        {
            title: "Create your profile",
            subtitle: "Tell us a bit about yourself. All fields are required.",
            content: (
                <div className="space-y-5">
                    <div>
                        <label className="etower-section-label text-[10px] mb-1.5 block">Display name</label>
                        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="w-full px-4 py-3 rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.18)] focus:border-[#00ff41]/50 text-sm transition-colors focus:outline-none" />
                    </div>
                    <div>
                        <label className="etower-section-label text-[10px] mb-1.5 block">Birthday</label>
                        <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.18)] focus:border-[#00ff41]/50 text-sm transition-colors focus:outline-none" />
                    </div>
                    <div>
                        <label className="etower-section-label text-[10px] mb-1.5 block">Babson graduation year</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            value={graduationYear}
                            onChange={(e) => setGraduationYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="e.g. 2027"
                            className="w-full px-4 py-3 rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.18)] focus:border-[#00ff41]/50 text-sm transition-colors focus:outline-none"
                        />
                        <p className="text-[11px] text-white/45 mt-1.5">Four-digit year you expect to graduate (undergrad or grad).</p>
                    </div>
                    <div>
                        <label className="etower-section-label text-[10px] mb-1.5 block">Short bio</label>
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Major, year, what you're working on…" rows={3} className="w-full px-4 py-3 rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.18)] focus:border-[#00ff41]/50 text-sm transition-colors focus:outline-none resize-none" />
                    </div>
                    <div>
                        <label className="etower-section-label text-[10px] mb-1.5 block">Fun fact</label>
                        <input type="text" value={funFact} onChange={(e) => setFunFact(e.target.value)} placeholder="One fun fact about you…" className="w-full px-4 py-3 rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.18)] focus:border-[#00ff41]/50 text-sm transition-colors focus:outline-none" />
                    </div>
                </div>
            ),
        },
        // ── Step 1: Skills Library ──
        {
            title: "Your skills",
            subtitle: `Select everything you bring to the club. (${selectedSkills.length} selected)`,
            content: (
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input type="text" value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} placeholder="Search skills…" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a1628]/50 border border-[rgba(0,255,65,0.18)] focus:border-[#00ff41]/50 text-sm transition-colors focus:outline-none" />
                    </div>

                    {/* Selected pills */}
                    {selectedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {selectedSkills.map((skill) => (
                                <button key={skill} onClick={() => toggleSkill(skill)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(0,255,65,0.15)] border border-[#00ff41]/50 text-[#00ff41] text-[10px] font-semibold">
                                    {skill} <X className="w-3 h-3 ml-1" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Categories */}
                    <div className="max-h-[40vh] overflow-y-auto space-y-5 pr-2 custom-scroll">
                        {Object.entries(filteredSkillCategories).map(([category, skills]) => (
                            <div key={category}>
                                <div className="flex items-center gap-2 mb-2.5">
                                    <div className="h-px bg-[rgba(0,255,65,0.18)] flex-1" />
                                    <p className="etower-section-label text-[10px] mb-0">{category}</p>
                                    <div className="h-px bg-[rgba(0,255,65,0.18)] flex-1" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <button key={skill} onClick={() => toggleSkill(skill)} className={cn("px-3 py-1.5 rounded-full text-xs transition-all border", selectedSkills.includes(skill) ? "bg-[rgba(0,255,65,0.1)] text-[#00ff41] border-[#00ff41]/50" : "bg-[#0a1628]/40 border-[rgba(0,255,65,0.18)] text-white/55 hover:border-[#00ff41]/40")}>
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ),
        },
        // ── Step 2: Standout Skill ──
        {
            title: "Primary specialty",
            subtitle: "Pick the skill you want people to know you for.",
            content: (
                <div className="space-y-3">
                    {selectedSkills.length === 0 ? (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 text-center">
                            <p className="text-sm text-red-300">No skills selected yet.</p>
                            <p className="text-xs text-white/45 mt-2">Go back and choose at least one skill.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {selectedSkills.map((skill) => (
                                <button key={skill} onClick={() => setStandoutSkill(skill)} className={cn("px-4 py-3 rounded-xl border text-xs transition-all text-left", standoutSkill === skill ? "bg-[rgba(0,255,65,0.1)] text-[#00ff41] border-[#00ff41]/50" : "bg-[#0a1628]/40 border-[rgba(0,255,65,0.18)] text-white/55 hover:border-[#00ff41]/40")}>
                                    <div className="flex items-center justify-between">
                                        <span>{skill}</span>
                                        {standoutSkill === skill && <Sparkles className="w-3.5 h-3.5" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ),
        },
        // ── Step 3: Interests ──
        {
            title: "Interests",
            subtitle: `What kinds of work excite you? (${selectedInterests.length} selected)`,
            content: (
                <div className="max-h-[50vh] overflow-y-auto space-y-5 pr-2 custom-scroll">
                    {Object.entries(INTEREST_CATEGORIES).map(([category, interests]) => (
                        <div key={category}>
                            <div className="flex items-center gap-2 mb-2.5">
                                <div className="h-px bg-[rgba(0,255,65,0.18)] flex-1" />
                                <p className="etower-section-label text-[10px] mb-0">{category}</p>
                                <div className="h-px bg-[rgba(0,255,65,0.18)] flex-1" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {interests.map((interest) => (
                                    <button key={interest} onClick={() => toggleInterest(interest)} className={cn("px-3 py-1.5 rounded-full text-xs transition-all border", selectedInterests.includes(interest) ? "bg-[rgba(0,255,65,0.1)] text-[#00ff41] border-[#00ff41]/50" : "bg-[#0a1628]/40 border-[rgba(0,255,65,0.18)] text-white/55 hover:border-[#00ff41]/40")}>
                                        {interest}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ),
        },
        // ── Step 4: Uploads ──
        {
            title: "Photo & resume",
            subtitle: "Upload a headshot and your resume to complete your application.",
            content: (
                <div className="space-y-6">
                    {/* Headshot */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="etower-section-label text-[10px]">Headshot</label>
                            {headshot && <span className="text-[10px] font-semibold text-[#00ff41]">Uploaded</span>}
                        </div>
                        <input type="file" ref={headshotRef} accept="image/*" onChange={handleHeadshot} className="hidden" />
                        <div onClick={() => headshotRef.current?.click()} className={cn("rounded-2xl border border-dashed p-6 text-center cursor-pointer transition-colors bg-[#0a1628]/40", headshot ? "border-[#00ff41]/40 bg-[rgba(0,255,65,0.05)]" : "border-[rgba(0,255,65,0.25)] hover:border-[#00ff41]/50")}>
                            {headshotPreview ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-24 h-24 rounded-xl p-1 border border-[#00ff41]/30 bg-[#0a1628] inline-block overflow-hidden">
                                        <img src={headshotPreview} alt="Headshot preview" className="w-full h-full object-cover rounded-lg" />
                                    </div>
                                    <p className="text-[11px] text-[#00ff41]">Click to replace</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Camera className="w-8 h-8 text-white/35 mb-1" />
                                    <p className="text-sm text-white">Select image</p>
                                    <p className="text-[11px] text-white/45">JPG, PNG, WEBP</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resume */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="etower-section-label text-[10px]">Resume</label>
                            {resume && <span className="text-[10px] font-semibold text-[#00ff41]">Uploaded</span>}
                        </div>
                        <input type="file" ref={resumeRef} accept=".pdf,.doc,.docx" onChange={handleResume} className="hidden" />
                        <div onClick={() => resumeRef.current?.click()} className={cn("rounded-2xl border border-dashed p-6 text-center cursor-pointer transition-colors bg-[#0a1628]/40", resume ? "border-[#00ff41]/40 bg-[rgba(0,255,65,0.05)]" : "border-[rgba(0,255,65,0.25)] hover:border-[#00ff41]/50")}>
                            {resume ? (
                                <div className="flex items-center justify-center gap-3">
                                    <FileText className="w-8 h-8 text-[#00ff41]" />
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-[#00ff41] truncate max-w-[200px]">{resume.name}</p>
                                        <p className="text-[11px] text-white/45 mt-0.5">{(resume.size / 1024).toFixed(0)} KB · Click to change</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="w-8 h-8 text-white/35 mb-1" />
                                    <p className="text-sm text-white">Select document</p>
                                    <p className="text-[11px] text-white/45">PDF, DOC, DOCX</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        // ── Step 5: Summary ──
        {
            title: "Review & submit",
            subtitle: "Double-check your profile before submitting. Access is granted once the e-board approves your application.",
            content: (
                <div className="py-2 space-y-6">
                    <div className="flex items-center gap-4 etower-soft-card p-4">
                        <div className="w-16 h-16 rounded-xl border border-[#00ff41]/30 bg-[#0a1628] flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {headshotPreview ? (
                                <img src={headshotPreview} alt="Headshot" className="w-full h-full object-cover" />
                            ) : (
                                <Terminal className="w-8 h-8 text-[#00ff41]/50" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="etower-section-label text-[10px] mb-0.5">Applicant</p>
                            <p className="text-lg font-bold tracking-tight truncate">{displayName}</p>
                            <p className="text-[11px] text-white/55 mt-1 truncate">{bio}</p>
                            {birthday && <p className="text-[11px] text-white/45 mt-0.5">Birthday: {new Date(birthday).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>}
                            {graduationYearOk && (
                                <p className="text-[11px] text-white/45 mt-0.5">Class of {graduationYear.trim()}</p>
                            )}
                            {funFact && <p className="text-[11px] text-[#00ff41]/80 italic mt-1">Fun fact: {funFact}</p>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl border border-[rgba(0,255,65,0.18)] bg-[#0a1628]/30 p-4">
                            <p className="etower-section-label text-[10px] mb-2 border-b border-[rgba(0,255,65,0.12)] pb-1">Specialty & skills</p>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-3.5 h-3.5 text-[#00ff41]" />
                                <span className="text-sm font-semibold text-white">{standoutSkill}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {selectedSkills.filter(s => s !== standoutSkill).map(skill => (
                                    <span key={skill} className="text-[10px] text-white/55 bg-white/5 px-2 py-0.5 rounded-full">{skill}</span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[rgba(0,255,65,0.18)] bg-[#0a1628]/30 p-4">
                            <p className="etower-section-label text-[10px] mb-2 border-b border-[rgba(0,255,65,0.12)] pb-1">Interests & files</p>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {selectedInterests.map(interest => (
                                    <span key={interest} className="text-[10px] text-white/55 bg-white/5 px-2 py-0.5 rounded-full">{interest}</span>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/55">
                                <FileText className="w-3.5 h-3.5" />
                                <span className="truncate">{resume?.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    const currentStep = steps[step];
    const isLast = step === steps.length - 1;
    const canProceed = stepValid[step];

    return (
        <div className="etower-app min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="pointer-events-none fixed inset-0 bg-grid-brutalist opacity-70" />

            <div className="relative z-10 w-full max-w-lg mb-8 text-center animate-fade-in">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl border border-[rgba(0,255,65,0.28)] bg-[rgba(20,32,51,0.88)] mb-3">
                    <Code2 className="w-6 h-6 text-[#00ff41]" />
                </div>
                <p className="etower-section-label">eTower onboarding</p>
            </div>

            <div className="w-full max-w-lg relative z-10">
                {/* Progress bar */}
                <div className="flex items-center gap-1.5 mb-6">
                    {steps.map((_, i) => (
                        <div key={i} className="h-1.5 flex-1 bg-[rgba(0,255,65,0.12)] overflow-hidden rounded-full">
                            {i <= step && <div className="h-full bg-[#00ff41] w-full animate-fade-in" />}
                        </div>
                    ))}
                </div>

                {/* Main panel */}
                <div className="etower-soft-card p-6 sm:p-8 shadow-xl relative min-h-[450px] flex flex-col">
                    <div className="relative z-10 flex-1 flex flex-col">
                        <div className="mb-6">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 text-white">{currentStep.title}</h1>
                            <p className="text-sm text-white/55">{currentStep.subtitle}</p>
                        </div>

                        <div className="flex-1">
                            {currentStep.content}
                        </div>

                        {/* Navigation Footer */}
                        <div className="flex items-center justify-between mt-8 pt-5 border-t border-[rgba(0,255,65,0.18)]">
                            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className={cn("etower-soft-btn etower-soft-btn--ghost", step === 0 && "opacity-30 cursor-not-allowed")}>
                                <ChevronLeft className="w-3.5 h-3.5" /> Back
                            </button>

                            {isLast ? (
                                <button onClick={handleFinish} disabled={submitting} className="etower-soft-btn etower-soft-btn--primary disabled:opacity-50">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
                                    {submitting ? "Submitting…" : "Submit application"}
                                </button>
                            ) : (
                                <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={!canProceed} className={cn("etower-soft-btn", canProceed ? "etower-soft-btn--primary" : "etower-soft-btn--ghost opacity-50 cursor-not-allowed")}>
                                    Continue <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-between items-center text-[11px] text-white/40">
                    <span>Member setup</span>
                    <span>Step {step + 1} of {steps.length}</span>
                </div>
            </div>

            <style jsx global>{`
                .custom-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scroll::-webkit-scrollbar-thumb {
                    background: color-mix(in oklch, var(--primary) 30%, transparent);
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
}
