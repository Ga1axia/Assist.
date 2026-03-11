"use client";

import { useState } from "react";
import {
    dummyFeed,
    dummyEvents,
    dummyMembers,
    dummyResources,
    dummyProjects,
    dummyInquiries,
    dummyFaq,
    dummyActionItems,
    dummyStartups,
    dummyDashboardStats,
} from "@/data/dummy";

// ──────────────────────────────────────
// Types (same as before for compatibility)
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
    _createdAt: unknown;
}

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
    updatedAt: string;
    createdAt: string;
    clientVisible: boolean;
}

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

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    createdAt: string;
}

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

export interface StartupItem {
    id: string;
    name: string;
    description: string;
    founders: string;
    foundedYear: string;
    website: string | null;
    createdAt: string;
}

// No-op helpers for mutations (demo mode)
const noop = async (..._args: unknown[]) => {};
const noopStr = async (_: string) => {};
const noopStrStr = async (_1: string, _2: string) => {};
const noopStrStrStr = async (_1: string, _2: string, _3: string) => {};

// ──────────────────────────────────────
// Hooks – return dummy data, no loading, no-op mutations
// ──────────────────────────────────────
export function useFeed(_enabled: boolean = true) {
    return {
        data: dummyFeed as FeedItem[],
        loading: false,
        error: null as string | null,
        togglePin: noop as (itemId: string, currentlyPinned: boolean, userId: string) => Promise<void>,
    };
}

export function useEvents(_enabled: boolean = true) {
    return {
        data: dummyEvents as EventItem[],
        loading: false,
        error: null as string | null,
        createEvent: noop as (event: Omit<EventItem, "id" | "createdAt" | "attendees">) => Promise<void>,
        rsvp: noopStrStr,
        cancelRsvp: noopStrStr,
    };
}

export function useMembers(_enabled: boolean = true) {
    return {
        data: dummyMembers as MemberItem[],
        loading: false,
        error: null as string | null,
    };
}

export function useResources(onlyApproved = true, _enabled = true) {
    const data = onlyApproved
        ? (dummyResources as ResourceItem[]).filter((r) => r.approved)
        : (dummyResources as ResourceItem[]);
    return {
        data,
        loading: false,
        error: null as string | null,
        createResource: noop as (r: Partial<ResourceItem> & { uploadedById: string }) => Promise<void>,
        approveResource: noopStr,
        rejectResource: noopStr,
    };
}

export function useProjects(_enabled: boolean = true) {
    return {
        data: dummyProjects as ProjectItem[],
        loading: false,
        error: null as string | null,
        createProject: noop as (p: Partial<ProjectItem>) => Promise<void>,
        updateProject: noop as (id: string, updates: Partial<ProjectItem>) => Promise<void>,
    };
}

export function useInquiries(_enabled: boolean = true) {
    return {
        data: dummyInquiries as InquiryItem[],
        loading: false,
        error: null as string | null,
        replyToInquiry: noopStrStrStr,
        publishToFaq: noopStrStrStr,
    };
}

export function useFAQ(_enabled: boolean = true) {
    return {
        data: dummyFaq as FAQItem[],
        loading: false,
        error: null as string | null,
    };
}

export function useActionItems(_enabled: boolean = true) {
    return {
        data: dummyActionItems as ActionItem[],
        loading: false,
        error: null as string | null,
        completeActionItem: noop as (itemId: string, userId: string, currentlyCompleted: boolean) => Promise<void>,
    };
}

export function useStartups(_enabled: boolean = true) {
    return {
        data: dummyStartups as StartupItem[],
        loading: false,
        error: null as string | null,
    };
}

export function useDashboardStats() {
    const [stats] = useState(dummyDashboardStats);
    return { stats, loading: false };
}
