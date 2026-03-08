"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isAdmin as checkAdmin } from "@/lib/roles";
import { Loader2, Database, CheckCircle2, AlertTriangle } from "lucide-react";

const SEED_DATA = {
    events: [
        {
            title: "Weekly Standup",
            description: "Regular sync meeting to discuss project updates and blockers.",
            time: "5:00 PM",
            location: "Olin 102",
            type: "meeting",
            status: "upcoming",
            attendees: [],
            maxAttendees: null,
            tags: ["weekly", "standup"],
            featured: false,
        },
        {
            title: "Spring Hackathon 2026",
            description: "48-hour hackathon focused on building tools for Seven Hills Foundation.",
            time: "10:00 AM",
            location: "Babson Innovation Hub",
            type: "hackathon",
            status: "upcoming",
            attendees: [],
            maxAttendees: 40,
            tags: ["hackathon", "seven-hills"],
            featured: true,
        },
        {
            title: "Intro to React Workshop",
            description: "Beginner-friendly workshop covering React fundamentals, hooks, and component design.",
            time: "3:00 PM",
            location: "Zoom",
            type: "workshop",
            status: "upcoming",
            attendees: [],
            maxAttendees: 25,
            tags: ["workshop", "react", "beginner"],
            featured: false,
        },
    ],
    resources: [
        {
            title: "Getting Started with Next.js",
            description: "Official Generator guide to building apps with Next.js, including routing, data fetching, and deployment.",
            type: "guide",
            tier: "official",
            phase: "beginner",
            topics: ["Next.js", "React", "Web Dev"],
            views: 142,
            uploadedBy: "E-Board",
            approved: true,
        },
        {
            title: "Git & GitHub Workflow",
            description: "Step-by-step guide for branches, PRs, and code reviews following The Generator conventions.",
            type: "guide",
            tier: "official",
            phase: "beginner",
            topics: ["Git", "GitHub", "Collaboration"],
            views: 98,
            uploadedBy: "E-Board",
            approved: true,
        },
        {
            title: "Python Data Analysis Cheatsheet",
            description: "Quick reference for Pandas, NumPy, and Matplotlib for data projects.",
            type: "cheatsheet",
            tier: "community",
            phase: "intermediate",
            topics: ["Python", "Data Science", "Pandas"],
            views: 67,
            uploadedBy: "Community Member",
            approved: true,
        },
        {
            title: "Firebase Authentication Guide",
            description: "How to implement Firebase Auth with Google sign-in and email/password in React apps.",
            type: "guide",
            tier: "official",
            phase: "intermediate",
            topics: ["Firebase", "Auth", "React"],
            views: 55,
            uploadedBy: "E-Board",
            approved: true,
        },
    ],
    projects: [
        {
            name: "Accessibility Checker",
            description: "Browser extension that checks web pages for WCAG compliance and suggests accessibility improvements.",
            status: "in-progress",
            teamMembers: [
                { uid: "system", role: "lead", name: "Project Lead" },
            ],
            githubUrl: "https://github.com/the-generator/a11y-checker",
            liveUrl: null,
            milestoneProgress: 45,
            notes: [],
            clientVisible: true,
        },
        {
            name: "Seven Hills Volunteer Portal",
            description: "Platform connecting Babson students with volunteer opportunities at Seven Hills Foundation.",
            status: "complete",
            teamMembers: [
                { uid: "system", role: "lead", name: "Project Lead" },
                { uid: "system2", role: "developer", name: "Developer" },
            ],
            githubUrl: "https://github.com/the-generator/volunteer-portal",
            liveUrl: "https://volunteer.sevenhills.org",
            milestoneProgress: 100,
            notes: [],
            clientVisible: true,
        },
    ],
    activityFeed: [
        {
            type: "milestone_update",
            actorName: "System",
            actorId: "system",
            description: "Accessibility Checker reached 45% milestone progress",
            targetId: null,
            targetName: "Accessibility Checker",
            pinned: false,
            pinnedBy: null,
        },
        {
            type: "resource_upload",
            actorName: "E-Board",
            actorId: "system",
            description: "uploaded Getting Started with Next.js to the Resource Library",
            targetId: null,
            targetName: null,
            pinned: true,
            pinnedBy: "system",
        },
        {
            type: "event_created",
            actorName: "E-Board",
            actorId: "system",
            description: "created Spring Hackathon 2026",
            targetId: null,
            targetName: null,
            pinned: false,
            pinnedBy: null,
        },
    ],
    inquiries: [
        {
            question: "How do I join a project team?",
            category: "general",
            status: "answered",
            askedBy: "Anonymous",
            reply: "Check out the Projects page and reach out to the team lead. You can also pitch your own project during our weekly meetings!",
            repliedBy: "E-Board",
        },
        {
            question: "When are the club meetings?",
            category: "events",
            status: "pending",
            askedBy: "Anonymous",
            reply: null,
            repliedBy: null,
        },
    ],
    faq: [
        {
            question: "How do I join The Generator?",
            answer: "The Generator accepts new members each semester. Reach out to E-Board or attend one of our info sessions to get started.",
        },
        {
            question: "Do I need coding experience to join?",
            answer: "Not at all! The Generator welcomes members of all skill levels. We have resources and workshops for complete beginners.",
        },
        {
            question: "What kind of projects does The Generator work on?",
            answer: "We build real-world applications primarily for our partner organization, Seven Hills Foundation. Projects range from web apps to data dashboards.",
        },
    ],
};

export default function SeedPage() {
    const { profile } = useAuth();
    const [seeding, setSeeding] = useState(false);
    const [results, setResults] = useState<{ collection: string; count: number; status: "success" | "error" }[]>([]);
    const [done, setDone] = useState(false);

    const handleSeed = async () => {
        if (!confirm("This will add seed data to your Firestore database. Continue?")) return;
        setSeeding(true);
        setResults([]);

        const newResults: typeof results = [];

        for (const [collName, items] of Object.entries(SEED_DATA)) {
            try {
                for (const item of items) {
                    await addDoc(collection(db, collName), {
                        ...item,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    });
                }
                newResults.push({ collection: collName, count: items.length, status: "success" });
            } catch (err) {
                console.error(`Error seeding ${collName}:`, err);
                newResults.push({ collection: collName, count: 0, status: "error" });
            }
            setResults([...newResults]);
        }

        setSeeding(false);
        setDone(true);
    };

    const userIsAdmin = checkAdmin(profile?.role);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    <Database className="w-7 h-7 text-primary" />
                    Initialize Database
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">Seed your Firestore with sample data for all collections.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-semibold mb-3">Collections to seed:</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                    {Object.entries(SEED_DATA).map(([name, items]) => (
                        <div key={name} className="bg-accent rounded-lg px-3 py-2 text-sm">
                            <span className="font-medium">{name}</span>
                            <span className="text-muted-foreground ml-1.5">({items.length} docs)</span>
                        </div>
                    ))}
                </div>

                {results.length > 0 && (
                    <div className="space-y-2 mb-6">
                        {results.map((r) => (
                            <div key={r.collection} className="flex items-center gap-2 text-sm">
                                {r.status === "success" ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4 text-destructive" />
                                )}
                                <span className="font-medium">{r.collection}</span>
                                <span className="text-muted-foreground">— {r.count} documents added</span>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={handleSeed}
                    disabled={seeding || done}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
                >
                    {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                    {done ? "Database Seeded ✓" : seeding ? "Seeding..." : "Seed Database"}
                </button>

                {done && (
                    <p className="mt-3 text-sm text-muted-foreground">
                        All collections have been initialized! Navigate to other pages to see the data.
                    </p>
                )}
            </div>
        </div>
    );
}
