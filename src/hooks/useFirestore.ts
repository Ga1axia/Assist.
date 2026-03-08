"use client";

import { useState, useEffect } from "react";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    where,
    limit,
    getDocs,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    type QueryConstraint,
    type DocumentData,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ──────────────────────────────────────
// Generic real-time collection hook
// ──────────────────────────────────────
function useCollection<T extends { id: string }>(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    transform?: (doc: DocumentData, id: string) => T,
    enabled: boolean = true
) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const q = query(collection(db, collectionName), ...constraints);
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const items = snapshot.docs.map((d) => {
                    const raw = d.data();
                    if (transform) return transform(raw, d.id);
                    return { id: d.id, ...raw } as T;
                });
                setData(items);
                setLoading(false);
            },
            (err) => {
                console.error(`Firestore error (${collectionName}):`, err);
                setError(err.message);
                setLoading(false);
            }
        );
        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionName, enabled]);

    return { data, loading, error };
}

// Helper to convert Firestore Timestamps to readable strings
function formatTimestamp(ts: unknown): string {
    if (!ts) return "";
    if (ts instanceof Timestamp) {
        return ts.toDate().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }
    if (typeof ts === "string") return ts;
    return "";
}

function timeAgo(ts: unknown): string {
    if (!ts) return "";
    let date: Date;
    if (ts instanceof Timestamp) {
        date = ts.toDate();
    } else if (typeof ts === "string") {
        return ts;
    } else {
        return "";
    }
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return formatTimestamp(ts);
}

// ──────────────────────────────────────
// Activity Feed
// ──────────────────────────────────────
export interface FeedItem {
    id: string;
    type: string;
    actorId: string;
    actorName: string;
    description: string;
    targetId: string | null;
    targetName: string | null;
    pinned: boolean;
    pinnedBy: string | null;
    createdAt: string;
    _createdAt: unknown; // raw timestamp for sorting
}

export function useFeed(enabled: boolean = true) {
    const result = useCollection<FeedItem>(
        "activityFeed",
        [orderBy("createdAt", "desc"), limit(50)],
        (raw, id) => ({
            id,
            type: raw.type || "milestone_update",
            actorId: raw.actorId || "",
            actorName: raw.actorName || "Unknown",
            description: raw.description || "",
            targetId: raw.targetId || null,
            targetName: raw.targetName || null,
            pinned: raw.pinned || false,
            pinnedBy: raw.pinnedBy || null,
            createdAt: timeAgo(raw.createdAt),
            _createdAt: raw.createdAt,
        }),
        enabled
    );

    const togglePin = async (itemId: string, currentlyPinned: boolean, userId: string) => {
        await updateDoc(doc(db, "activityFeed", itemId), {
            pinned: !currentlyPinned,
            pinnedBy: !currentlyPinned ? userId : null,
        });
    };

    return { ...result, togglePin };
}

// ──────────────────────────────────────
// Events
// ──────────────────────────────────────
export interface EventItem {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    type: string;
    status: string;
    attendees: string[];
    maxAttendees: number | null;
    tags: string[];
    featured: boolean;
    createdBy: string;
    createdAt: string;
}

export function useEvents(enabled: boolean = true) {
    const result = useCollection<EventItem>(
        "events",
        [orderBy("createdAt", "desc")],
        (raw, id) => ({
            id,
            title: raw.title || "",
            description: raw.description || "",
            date: formatTimestamp(raw.date) || formatTimestamp(raw.createdAt),
            time: raw.time || "",
            location: raw.location || "",
            type: raw.type || "meeting",
            status: raw.status || "upcoming",
            attendees: raw.attendees || [],
            maxAttendees: raw.maxAttendees || null,
            tags: raw.tags || [],
            featured: raw.featured || false,
            createdBy: raw.createdBy || "",
            createdAt: formatTimestamp(raw.createdAt),
        }),
        enabled
    );

    const createEvent = async (event: Omit<EventItem, "id" | "createdAt" | "attendees">) => {
        await addDoc(collection(db, "events"), {
            ...event,
            attendees: [],
            createdAt: serverTimestamp(),
        });
    };

    const rsvp = async (eventId: string, userId: string) => {
        await updateDoc(doc(db, "events", eventId), {
            attendees: arrayUnion(userId),
        });
    };

    const cancelRsvp = async (eventId: string, userId: string) => {
        await updateDoc(doc(db, "events", eventId), {
            attendees: arrayRemove(userId),
        });
    };

    return { ...result, createEvent, rsvp, cancelRsvp };
}

// ──────────────────────────────────────
// Members (reads from `users` collection)
// ──────────────────────────────────────
export interface MemberItem {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    photoURL: string | null;
    standoutSkill: string;
    projects: number;
    uploads: number;
    attendance: string;
    joinDate: string;
    linkedin: string | null;
    bio: string | null;
    skills: string[];
    openToMentorship: boolean;
}

export function useMembers(enabled: boolean = true) {
    const result = useCollection<MemberItem>(
        "users",
        [orderBy("createdAt", "desc")],
        (raw, id) => ({
            id,
            name: raw.displayName || "Unknown",
            email: raw.email || "",
            role: raw.role || "member",
            status: raw.status || (raw.onboarded ? "approved" : "pending"),
            photoURL: raw.photoURL || null,
            standoutSkill: raw.standoutSkill || "—",
            projects: raw.engagementMetrics?.projectsCompleted || raw.projects?.length || 0,
            uploads: raw.engagementMetrics?.uploadsCount || 0,
            attendance: raw.engagementMetrics?.attendanceRate
                ? `${raw.engagementMetrics.attendanceRate}%`
                : "—",
            joinDate: formatTimestamp(raw.joinDate) || formatTimestamp(raw.createdAt),
            linkedin: raw.linkedin || raw.alumni?.linkedinUrl || null,
            bio: raw.bio || null,
            skills: raw.skills || [],
            openToMentorship: raw.openToMentorship || false,
        }),
        enabled
    );
    return { ...result, data: result.data.filter((m) => m.status !== "removed") };
}

// ──────────────────────────────────────
// Resources
// ──────────────────────────────────────
export interface ResourceItem {
    id: string;
    title: string;
    description: string;
    type: string;
    tier: string;
    phase: string;
    topics: string[];
    views: number;
    uploadedBy: string;
    date: string;
    fileUrl: string | null;
    approved: boolean;
}

export function useResources(onlyApproved = true, enabled = true) {
    const result = useCollection<ResourceItem>(
        "resources",
        [orderBy("createdAt", "desc")],
        (raw, id) => ({
            id,
            title: raw.title || "",
            description: raw.description || "",
            type: raw.type || "guide",
            tier: raw.tier || "community",
            phase: raw.phase || "beginner",
            topics: raw.topics || [],
            views: raw.views || 0,
            uploadedBy: raw.uploadedBy || "",
            date: formatTimestamp(raw.createdAt),
            fileUrl: raw.fileUrl || null,
            approved: raw.approved ?? false,
        }),
        enabled
    );

    // Filter client-side to avoid composite index requirement
    const filteredData = onlyApproved ? result.data.filter((r) => r.approved) : result.data;

    const createResource = async (resource: Partial<ResourceItem> & { uploadedById: string }) => {
        await addDoc(collection(db, "resources"), {
            ...resource,
            approved: false,
            views: 0,
            createdAt: serverTimestamp(),
        });
    };

    const approveResource = async (resourceId: string) => {
        await updateDoc(doc(db, "resources", resourceId), { approved: true });
    };

    const rejectResource = async (resourceId: string) => {
        await deleteDoc(doc(db, "resources", resourceId));
    };

    return { ...result, data: filteredData, createResource, approveResource, rejectResource };
}

// ──────────────────────────────────────
// Projects
// ──────────────────────────────────────
export interface ProjectTask {
    id: string;
    title: string;
    completed: boolean;
}

export interface ProjectItem {
    id: string;
    name: string;
    description: string;
    status: string;
    teamMembers: { uid: string; role: string; name?: string }[];
    githubUrl: string | null;
    liveUrl: string | null;
    coverImage: string | null;
    gallery: string[];
    content: string;
    tasks: ProjectTask[];
    updatedAt: string;
    createdAt: string;
    clientVisible: boolean;
}

export function useProjects(enabled: boolean = true) {
    const result = useCollection<ProjectItem>(
        "projects",
        [orderBy("createdAt", "desc")],
        (raw, id) => ({
            id,
            name: raw.name || "",
            description: raw.description || "",
            status: raw.status || "ideation",
            teamMembers: raw.teamMembers || [],
            githubUrl: raw.githubUrl || null,
            liveUrl: raw.liveUrl || null,
            coverImage: raw.coverImage || null,
            gallery: raw.gallery || [],
            content: raw.content || "",
            tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
            updatedAt: timeAgo(raw.updatedAt) || timeAgo(raw.createdAt),
            createdAt: formatTimestamp(raw.createdAt),
            clientVisible: raw.clientVisible ?? true,
        }),
        enabled
    );

    const createProject = async (project: Partial<ProjectItem>) => {
        const { tasks, ...rest } = project;
        await addDoc(collection(db, "projects"), {
            ...rest,
            tasks: tasks || [],
            status: project.status || "published",
            clientVisible: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    };

    const updateProject = async (projectId: string, updates: Partial<ProjectItem>) => {
        await updateDoc(doc(db, "projects", projectId), {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    };

    const addProjectTask = async (projectId: string, title: string) => {
        const project = result.data.find((p) => p.id === projectId);
        const currentTasks = project?.tasks || [];
        const newTask: ProjectTask = {
            id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            title: title.trim(),
            completed: false,
        };
        await updateDoc(doc(db, "projects", projectId), {
            tasks: [...currentTasks, newTask],
            updatedAt: serverTimestamp(),
        });
    };

    const updateProjectTask = async (projectId: string, taskId: string, updates: Partial<ProjectTask>) => {
        const project = result.data.find((p) => p.id === projectId);
        const tasks = (project?.tasks || []).map((t) =>
            t.id === taskId ? { ...t, ...updates } : t
        );
        await updateDoc(doc(db, "projects", projectId), {
            tasks,
            updatedAt: serverTimestamp(),
        });
    };

    const removeProjectTask = async (projectId: string, taskId: string) => {
        const project = result.data.find((p) => p.id === projectId);
        const tasks = (project?.tasks || []).filter((t) => t.id !== taskId);
        await updateDoc(doc(db, "projects", projectId), {
            tasks,
            updatedAt: serverTimestamp(),
        });
    };

    return { ...result, createProject, updateProject, addProjectTask, updateProjectTask, removeProjectTask };
}

// ──────────────────────────────────────
// Inquiries (Admin)
// ──────────────────────────────────────
export interface InquiryItem {
    id: string;
    question: string;
    category: string;
    status: string;
    date: string;
    askedBy: string;
    reply: string | null;
    repliedBy: string | null;
}

export function useInquiries(enabled: boolean = true) {
    const result = useCollection<InquiryItem>(
        "inquiries",
        [orderBy("createdAt", "desc")],
        (raw, id) => ({
            id,
            question: raw.question || "",
            category: raw.category || "general",
            status: raw.status || "pending",
            date: formatTimestamp(raw.createdAt),
            askedBy: raw.askedBy || "Anonymous",
            reply: raw.reply || null,
            repliedBy: raw.repliedBy || null,
        }),
        enabled
    );

    const replyToInquiry = async (inquiryId: string, reply: string, repliedBy: string) => {
        await updateDoc(doc(db, "inquiries", inquiryId), {
            reply,
            repliedBy,
            status: "answered",
        });
    };

    const publishToFaq = async (inquiryId: string, question: string, answer: string) => {
        await addDoc(collection(db, "faq"), {
            question,
            answer,
            sourceInquiryId: inquiryId,
            createdAt: serverTimestamp(),
        });
        await updateDoc(doc(db, "inquiries", inquiryId), {
            status: "published",
        });
    };

    return { ...result, replyToInquiry, publishToFaq };
}

// ──────────────────────────────────────
// FAQ (Public)
// ──────────────────────────────────────
export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    createdAt: string;
}

export function useFAQ(enabled: boolean = true) {
    return useCollection<FAQItem>(
        "faq",
        [orderBy("createdAt", "desc")],
        (raw, id) => ({
            id,
            question: raw.question || "",
            answer: raw.answer || "",
            createdAt: formatTimestamp(raw.createdAt),
        }),
        enabled
    );
}

// ──────────────────────────────────────
// Action Items (Upcoming Deadlines)
// ──────────────────────────────────────
export interface ActionItem {
    id: string;
    title: string;
    description: string;
    deadline: string;
    type: "form" | "external";
    link: string | null;
    completedBy: string[];
    createdAt: string;
    createdBy: string;
}

export function useActionItems(enabled: boolean = true) {
    const result = useCollection<ActionItem>(
        "actionItems",
        [orderBy("createdAt", "desc")],
        (raw, id) => ({
            id,
            title: raw.title || "",
            description: raw.description || "",
            deadline: raw.deadline || "",
            type: raw.type || "external",
            link: raw.link || null,
            completedBy: raw.completedBy || [],
            createdAt: formatTimestamp(raw.createdAt),
            createdBy: raw.createdBy || "",
        }),
        enabled
    );

    const completeActionItem = async (itemId: string, userId: string, currentlyCompleted: boolean) => {
        const itemRef = doc(db, "actionItems", itemId);
        await updateDoc(itemRef, {
            completedBy: currentlyCompleted ? arrayRemove(userId) : arrayUnion(userId)
        });
    };

    return { ...result, completeActionItem };
}

// ──────────────────────────────────────
// Startups (Alumni Gallery)
// ──────────────────────────────────────
export interface StartupItem {
    id: string;
    name: string;
    description: string;
    founders: string;
    foundedYear: string;
    website: string | null;
    createdAt: string;
}

export function useStartups(enabled: boolean = true) {
    return useCollection<StartupItem>(
        "startups",
        [orderBy("createdAt", "desc")],
        (raw, id) => ({
            id,
            name: raw.name || "Unknown Startup",
            description: raw.description || "",
            founders: raw.founders || "",
            foundedYear: raw.foundedYear || "",
            website: raw.website || null,
            createdAt: formatTimestamp(raw.createdAt),
        }),
        enabled
    );
}

// ──────────────────────────────────────
// Dashboard Stats (aggregated counts)
// ──────────────────────────────────────
export function useDashboardStats() {
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalMembers: 0,
        totalResources: 0,
        activeProjects: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchCounts() {
            try {
                const [projectsSnap, usersSnap, resourcesSnap] = await Promise.all([
                    getDocs(collection(db, "projects")),
                    getDocs(collection(db, "users")),
                    getDocs(collection(db, "resources")),
                ]);

                if (!cancelled) {
                    const activeCount = projectsSnap.docs.filter(
                        (d) => d.data().status !== "complete"
                    ).length;
                    const approvedCount = resourcesSnap.docs.filter(
                        (d) => d.data().approved === true
                    ).length;
                    setStats({
                        totalProjects: projectsSnap.size,
                        totalMembers: usersSnap.size,
                        totalResources: approvedCount,
                        activeProjects: activeCount,
                    });
                    setLoading(false);
                }
            } catch (err) {
                console.error("Dashboard stats error:", err);
                setLoading(false);
            }
        }

        fetchCounts();
        return () => { cancelled = true; };
    }, []);

    return { stats, loading };
}
