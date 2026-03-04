"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useInquiries, useResources, useProjects, useMembers } from "@/hooks/useFirestore";
import { isAdmin } from "@/lib/roles";
import { getRoleLabel, ALL_ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    MessageSquare,
    Users,
    Send,
    ThumbsUp,
    ThumbsDown,
    Shield,
    FileText,
    BookOpen,
    Loader2,
    Megaphone,
    Link2,
    Plus,
} from "lucide-react";

type AdminTab = "announcements" | "invites" | "inquiries" | "pitches" | "resources" | "profiles";

export default function AdminPage() {
    const { profile, user } = useAuth();
    const { data: inquiries, loading: inquiriesLoading, replyToInquiry, publishToFaq } = useInquiries();
    const { data: resources, loading: resourcesLoading, approveResource, rejectResource } = useResources(false);
    const { data: projects, loading: projectsLoading } = useProjects();
    const { data: members, loading: membersLoading } = useMembers();

    const [activeTab, setActiveTab] = useState<AdminTab>("announcements");
    const [replyText, setReplyText] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    // Announcement state
    const [announcementTitle, setAnnouncementTitle] = useState("");
    const [announcementBody, setAnnouncementBody] = useState("");
    const [announcementSending, setAnnouncementSending] = useState(false);

    // Invite link state
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("resident");
    const [inviteSending, setInviteSending] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const userIsAdmin = isAdmin(profile?.role);
    const loading = inquiriesLoading || resourcesLoading || projectsLoading || membersLoading;

    const pendingInquiries = inquiries.filter((i) => i.status === "pending");
    const pendingResources = resources.filter((r) => !r.approved);
    const pendingPitches = projects.filter((p) => p.status === "ideation");

    if (!userIsAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in relative z-10 hud-panel bg-card/40 border border-destructive/40 scanlines p-8 text-center max-w-lg mx-auto mt-20">
                <Shield className="w-16 h-16 text-destructive mb-6" />
                <h1 className="text-2xl font-black uppercase tracking-tighter text-destructive mb-2">ACCESS DENIED</h1>
                <p className="text-sm font-mono text-muted-foreground mb-4">You do not have the required clearance level to access the Command Center.</p>
                <div className="text-[10px] font-mono text-destructive/80 uppercase tracking-widest border border-destructive/20 bg-destructive/5 px-4 py-2">
                    ERROR CODE: 403_FORBIDDEN
                </div>
            </div>
        );
    }

    const tabs: { key: AdminTab; label: string; icon: React.ReactNode; count?: number }[] = [
        { key: "announcements", label: "BROADCASTS", icon: <Megaphone className="w-4 h-4" /> },
        { key: "invites", label: "CREDENTIALS", icon: <Link2 className="w-4 h-4" /> },
        { key: "inquiries", label: "COMMUNICATIONS", icon: <MessageSquare className="w-4 h-4" />, count: pendingInquiries.length },
        { key: "pitches", label: "PROPOSALS", icon: <FileText className="w-4 h-4" />, count: pendingPitches.length },
        { key: "resources", label: "DATA LOGS", icon: <BookOpen className="w-4 h-4" />, count: pendingResources.length },
        { key: "profiles", label: "ROSTER", icon: <Users className="w-4 h-4" />, count: members.length },
    ];

    const handleReply = async (inquiryId: string) => {
        if (!replyText.trim()) return;
        await replyToInquiry(inquiryId, replyText, profile?.displayName || "HIGH COMMAND");
        setReplyText("");
        setReplyingTo(null);
    };

    const handlePublishFaq = async (inquiryId: string, question: string, reply: string) => {
        await publishToFaq(inquiryId, question, reply);
    };

    // ── Announcements ──
    const handleCreateAnnouncement = async () => {
        if (!announcementTitle.trim() || !announcementBody.trim()) return;
        setAnnouncementSending(true);
        try {
            await addDoc(collection(db, "activityFeed"), {
                type: "announcement",
                actorId: user?.uid || "",
                actorName: profile?.displayName || "HIGH COMMAND",
                description: announcementBody,
                targetId: null,
                targetName: announcementTitle,
                pinned: true,
                pinnedBy: user?.uid || "",
                createdAt: serverTimestamp(),
            });
            await addDoc(collection(db, "announcements"), {
                title: announcementTitle,
                body: announcementBody,
                createdBy: user?.uid || "",
                createdByName: profile?.displayName || "HIGH COMMAND",
                createdAt: serverTimestamp(),
            });
            setAnnouncementTitle("");
            setAnnouncementBody("");
        } catch (err) {
            console.error("Announcement error:", err);
        } finally {
            setAnnouncementSending(false);
        }
    };

    // ── Invite Links ──
    const handleCreateInvite = async () => {
        if (!inviteEmail.trim()) return;
        setInviteSending(true);
        try {
            const inviteCode = crypto.randomUUID().slice(0, 8);
            await addDoc(collection(db, "invites"), {
                email: inviteEmail,
                role: inviteRole,
                code: inviteCode,
                createdBy: user?.uid || "",
                createdByName: profile?.displayName || "HIGH COMMAND",
                used: false,
                createdAt: serverTimestamp(),
            });
            setInviteEmail("");
        } catch (err) {
            console.error("Invite error:", err);
        } finally {
            setInviteSending(false);
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] animate-fade-in space-y-6 relative z-10 max-w-5xl mx-auto">
            {/* Header */}
            <div className="border-b border-border/50 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-primary/80 uppercase tracking-widest mb-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        SYSTEM_MODULE / SECURE_NET
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase relative group inline-block">
                        COMMAND <span className="gradient-text-cyber">CENTER</span>
                        <div className="absolute -top-1 -right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
                    </h1>
                </div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/70 bg-primary/5 px-3 py-1.5 border border-primary/20 flex items-center gap-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(203,247,2,0.1)_50%,transparent_75%)] bg-[length:4px_4px]" />
                    CLEARANCE: HIGH COMMAND
                </div>
            </div>

            {/* Tabs (Frequency Switcher) */}
            <div className="flex gap-2 w-full overflow-x-auto custom-scroll pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            "flex items-center gap-2.5 px-5 py-3 hud-panel-sm text-[10px] font-mono font-bold uppercase tracking-widest whitespace-nowrap transition-all border shrink-0",
                            activeTab === tab.key
                                ? "bg-primary text-primary-foreground border-primary glow-border shadow-[0_0_15px_rgba(203,247,2,0.3)]"
                                : "bg-card/40 border-border/40 text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className={cn(
                                "text-[9px] px-1.5 py-0.5 border",
                                activeTab === tab.key
                                    ? "bg-background/20 border-background/40 text-primary-foreground"
                                    : "bg-primary/10 border-primary/30 text-primary animate-pulse"
                            )}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 flex-1">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest animate-pulse">DECRYPTING COMM SECRETS...</span>
                </div>
            )}

            {!loading && (
                <div className="flex-1 space-y-6">
                    {/* ── Announcements Tab ── */}
                    {activeTab === "announcements" && (
                        <div className="hud-panel bg-card/60 border border-primary/40 p-6 sm:p-8 scanlines relative">
                            <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-r from-transparent to-primary/50" />
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-3 uppercase tracking-tight relative z-10 text-primary border-b border-primary/20 pb-4">
                                <Megaphone className="w-5 h-5" /> TRANSMIT GLOBAL BROADCAST
                            </h3>
                            <div className="space-y-5 relative z-10">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest ml-1">TRANSMISSION HEADER</label>
                                    <input type="text" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder="e.g. ALL UNITS STANDBY..." className="w-full px-4 py-3 hud-panel-sm bg-background/60 border border-border/50 focus:border-primary/50 text-sm font-mono uppercase transition-colors focus:outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest ml-1">PAYLOAD</label>
                                    <textarea value={announcementBody} onChange={(e) => setAnnouncementBody(e.target.value)} placeholder="Enter briefing details..." rows={4} className="w-full px-4 py-3 hud-panel-sm bg-background/60 border border-border/50 focus:border-primary/50 text-sm font-mono transition-colors focus:outline-none resize-none" />
                                </div>
                                <div className="pt-2 flex items-center justify-between">
                                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-relaxed max-w-sm border-l-2 border-primary/30 pl-3">
                                        BROADCASTS ARE AUTO-PINNED TO THE GLOBAL TELEMETRY FEED FOR MAXIMUM VISIBILITY.
                                    </p>
                                    <button
                                        onClick={handleCreateAnnouncement}
                                        disabled={announcementSending || !announcementTitle.trim() || !announcementBody.trim()}
                                        className="hud-panel bg-primary text-primary-foreground px-8 py-3.5 text-xs font-mono font-bold uppercase tracking-widest hover:brightness-110 transition-all glow-border disabled:opacity-50 flex items-center gap-3"
                                    >
                                        {announcementSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        {announcementSending ? "TRANSMITTING..." : "EXECUTE BROADCAST"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Invite Links Tab ── */}
                    {activeTab === "invites" && (
                        <div className="hud-corners bg-card/60 border border-border/40 p-6 sm:p-8 relative">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-3 uppercase tracking-tight relative z-10 border-b border-border/40 pb-4">
                                <Link2 className="w-5 h-5 text-primary" /> GENERATE ACCESS CREDENTIALS
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-4 relative z-10 items-end">
                                <div className="flex-1 space-y-1.5 w-full">
                                    <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest ml-1">OPERATIVE EMAIL</label>
                                    <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="name@babson.edu..." className="w-full px-4 py-3 hud-panel-sm bg-background/60 border border-border/50 focus:border-primary/50 text-sm font-mono lowercase transition-colors focus:outline-none" />
                                </div>
                                <div className="w-full sm:w-48 space-y-1.5">
                                    <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest ml-1">CLEARANCE LEVEL</label>
                                    <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full px-4 py-3 hud-panel-sm bg-card border border-border/50 focus:border-primary/50 text-sm font-mono uppercase transition-colors focus:outline-none">
                                        {ALL_ROLES.filter((r) => r.value !== "alumni").map((r) => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleCreateInvite}
                                    disabled={inviteSending || !inviteEmail.trim()}
                                    className="w-full sm:w-auto hud-panel-sm bg-primary text-primary-foreground px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest hover:brightness-110 transition-all glow-border disabled:opacity-50 flex items-center justify-center gap-2 h-[46px]"
                                >
                                    {inviteSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    GENERATE
                                </button>
                            </div>
                            <div className="mt-8 p-4 bg-background/50 border border-border/40 relative z-10 flex items-start gap-3">
                                <div className="mt-0.5"><Link2 className="w-4 h-4 text-muted-foreground" /></div>
                                <div>
                                    <div className="text-[10px] font-mono font-bold text-foreground uppercase tracking-widest mb-1">SECURE PROTOCOL</div>
                                    <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                                        Generating an invite mints a one-time secure token. Distribute this token to the recruit to bypass the firewall and grant them the designated clearance level inside the network.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Inquiries Tab ── */}
                    {activeTab === "inquiries" && (
                        <div className="space-y-4">
                            {inquiries.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 hud-panel bg-card/40 border border-border/40 scanlines">
                                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-4 relative z-10" />
                                    <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest relative z-10">NO COMMS WAITING IN QUEUE.</p>
                                </div>
                            ) : inquiries.map((inquiry, i) => (
                                <div key={inquiry.id} className={cn("group p-5 transition-all relative flex flex-col scanlines", i % 2 === 0 ? 'hud-panel' : 'hud-corners', inquiry.status === "pending" ? "bg-warning/5 border border-warning/30" : "bg-card/60 border border-border/40")}>
                                    <div className="flex items-start justify-between mb-3 relative z-10">
                                        <h3 className="font-bold text-base leading-tight pr-4">{inquiry.question}</h3>
                                        <span className={cn("text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 border hud-panel-sm whitespace-nowrap", inquiry.status === "pending" ? "bg-warning/20 border-warning text-warning animate-pulse" : inquiry.status === "answered" ? "bg-success/10 border-success/30 text-success" : "bg-primary/10 border-primary/30 text-primary")}>
                                            {inquiry.status}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4 relative z-10 bg-background/50 p-2 border border-border/40">
                                        <span className="text-foreground shrink-0">{inquiry.askedBy}</span>
                                        <div className="w-1 h-1 bg-border rotate-45" />
                                        <span className="shrink-0">{inquiry.category}</span>
                                        <div className="w-1 h-1 bg-border rotate-45 hidden sm:block" />
                                        <span className="shrink-0">{inquiry.date}</span>
                                    </div>

                                    {inquiry.reply && (
                                        <div className="bg-background border border-border/50 p-4 mb-4 relative z-10">
                                            <div className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <div className="w-1 h-1 bg-primary rotate-45" /> RESPONSE COMPILED BY: {inquiry.repliedBy}
                                            </div>
                                            <p className="text-sm font-mono text-muted-foreground leading-relaxed"><span className="text-primary/50 mr-2">&gt;</span>{inquiry.reply}</p>
                                        </div>
                                    )}

                                    <div className="relative z-10 mt-auto">
                                        {inquiry.status === "pending" && (
                                            replyingTo === inquiry.id ? (
                                                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
                                                    <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="INITIALIZE RESPONSE..." className="flex-1 px-4 py-2.5 hud-panel-sm bg-background border border-border/50 focus:border-primary/50 text-sm font-mono uppercase transition-colors focus:outline-none" />
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleReply(inquiry.id)} className="flex-1 sm:flex-none px-6 py-2.5 hud-panel-sm bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all glow-border">TRANSMIT</button>
                                                        <button onClick={() => setReplyingTo(null)} className="flex-1 sm:flex-none px-6 py-2.5 hud-panel-sm border border-border/50 text-muted-foreground text-xs font-bold uppercase tracking-widest hover:text-foreground hover:bg-accent transition-colors">ABORT</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={() => setReplyingTo(inquiry.id)} className="w-full py-2.5 hud-panel-sm border border-warning/50 text-warning text-xs font-bold font-mono uppercase tracking-widest hover:bg-warning/10 transition-colors mt-2">INITIALIZE RESPONSE PROTOCOL</button>
                                            )
                                        )}
                                        {inquiry.status === "answered" && inquiry.reply && (
                                            <button onClick={() => handlePublishFaq(inquiry.id, inquiry.question, inquiry.reply!)} className="w-full py-2.5 hud-panel-sm border border-success/50 text-success text-xs font-bold font-mono uppercase tracking-widest hover:bg-success/10 transition-colors mt-2">PUSH TO PUBLIC GLOBAL FAQ</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Pitches Tab ── */}
                    {activeTab === "pitches" && (
                        <div className="space-y-4">
                            {projects.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 hud-panel bg-card/40 border border-border/40 scanlines">
                                    <FileText className="w-12 h-12 text-muted-foreground/30 mb-4 relative z-10" />
                                    <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest relative z-10">NO OUTSTANDING PROPOSALS.</p>
                                </div>
                            ) : projects.map((project, i) => (
                                <div key={project.id} className={cn("group p-5 transition-all relative flex flex-col scanlines", i % 2 === 0 ? 'hud-corners' : 'hud-panel', "bg-card/60 border border-border/40 hover:border-primary/40")}>
                                    <div className="flex items-start justify-between mb-3 relative z-10">
                                        <h3 className="font-bold text-lg uppercase tracking-tight">{project.name}</h3>
                                        <span className={cn("text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 border hud-panel-sm whitespace-nowrap", project.status === "ideation" ? "bg-warning/20 border-warning text-warning animate-pulse" : "bg-success/10 border-success/30 text-success")}>
                                            {project.status === "ideation" ? "PRE-AWAITING CLEARANCE" : project.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-mono text-muted-foreground leading-relaxed mb-4 relative z-10"><span className="text-primary/50 mr-2">&gt;</span>{project.description}</p>
                                    <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest relative z-10 bg-background/50 p-2.5 border border-border/40">
                                        <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-primary/70" /> {project.teamMembers.length} UNITS</span>
                                        <div className="w-px h-3 bg-border" />
                                        <span>LAST SYNC: {project.updatedAt}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Resources Tab ── */}
                    {activeTab === "resources" && (
                        <div className="space-y-4">
                            {resources.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 hud-panel bg-card/40 border border-border/40 scanlines">
                                    <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-4 relative z-10" />
                                    <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest relative z-10">NO DATA LOGS REQUIRE REVIEW.</p>
                                </div>
                            ) : resources.map((resource, i) => (
                                <div key={resource.id} className={cn("group p-5 transition-all relative flex flex-col scanlines", i % 2 === 0 ? 'hud-panel' : 'hud-corners', "bg-card/60 border border-border/40 hover:border-primary/40")}>
                                    <div className="flex items-start justify-between mb-3 relative z-10">
                                        <h3 className="font-bold text-base uppercase tracking-tight pr-4">{resource.title}</h3>
                                        <span className={cn("text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 border hud-panel-sm whitespace-nowrap", resource.approved ? "bg-success/10 border-success/30 text-success" : "bg-warning/20 border-warning text-warning animate-pulse")}>
                                            {resource.approved ? "VERIFIED" : "AWAITING CLEARANCE"}
                                        </span>
                                    </div>
                                    <p className="text-xs font-mono text-muted-foreground leading-relaxed mb-4 line-clamp-2 relative z-10"><span className="text-primary/50 mr-2">&gt;</span>{resource.description}</p>

                                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4 relative z-10 bg-background/50 p-2 border border-border/40">
                                        <span className="text-foreground shrink-0">SOURCE: {resource.uploadedBy}</span>
                                        <div className="w-1 h-1 bg-border rotate-45 hidden sm:block" />
                                        <span className="shrink-0">SYNC: {resource.date}</span>
                                        <div className="w-1 h-1 bg-border rotate-45 hidden sm:block" />
                                        <span className="shrink-0 border border-border/50 px-1.5 bg-card">TYPE: {resource.type}</span>
                                    </div>

                                    {!resource.approved && (
                                        <div className="flex gap-3 relative z-10 mt-2">
                                            <button onClick={() => approveResource(resource.id)} className="flex-1 py-2.5 hud-panel-sm bg-success/10 border border-success/30 text-success text-xs font-mono font-bold uppercase tracking-widest hover:bg-success hover:text-success-foreground transition-all flex items-center justify-center gap-2">
                                                <ThumbsUp className="w-3.5 h-3.5" /> AUTHORIZE
                                            </button>
                                            <button onClick={() => rejectResource(resource.id)} className="flex-1 py-2.5 hud-panel-sm bg-destructive/10 border border-destructive/30 text-destructive text-xs font-mono font-bold uppercase tracking-widest hover:bg-destructive hover:text-destructive-foreground transition-all flex items-center justify-center gap-2">
                                                <ThumbsDown className="w-3.5 h-3.5" /> PURGE
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Members Tab ── */}
                    {activeTab === "profiles" && (
                        <div className="space-y-4">
                            {members.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 hud-panel bg-card/40 border border-border/40 scanlines">
                                    <Users className="w-12 h-12 text-muted-foreground/30 mb-4 relative z-10" />
                                    <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest relative z-10">DB EMPTY.</p>
                                </div>
                            ) : members.map((member, i) => (
                                <div key={member.id} className={cn("group p-4 transition-all relative flex flex-col sm:flex-row items-center gap-4 scanlines", i % 2 === 0 ? 'hud-panel-sm' : 'hud-corners', "bg-card/60 border border-border/40 hover:border-primary/40")}>
                                    <div className="w-12 h-12 hud-corners bg-background flex items-center justify-center font-black text-lg border border-border/50 text-muted-foreground shrink-0 relative z-10">
                                        {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0 text-center sm:text-left relative z-10 w-full">
                                        <p className="font-bold font-mono tracking-tight uppercase truncate">{member.name}</p>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">
                                            <span className="truncate">{member.email}</span>
                                            <div className="w-1 h-1 bg-border rotate-45 hidden sm:block" />
                                            <span className="text-primary/80">{getRoleLabel(member.role)}</span>
                                            <div className="w-1 h-1 bg-border rotate-45 hidden sm:block" />
                                            <span className="truncate">SPEC: {member.standoutSkill}</span>
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-auto relative z-10 mt-3 sm:mt-0 space-y-1.5">
                                        <div className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-widest text-center sm:text-left ml-1">ASSIGN CLEARANCE</div>
                                        <select
                                            value={member.role}
                                            onChange={async (e) => {
                                                try {
                                                    await updateDoc(doc(db, "users", member.id), { role: e.target.value });
                                                } catch (err) {
                                                    console.error("Role update error:", err);
                                                }
                                            }}
                                            className="w-full sm:w-40 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-2 hud-panel-sm bg-background/80 border border-border/50 text-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-pointer appearance-none"
                                        >
                                            {ALL_ROLES.map((r) => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
