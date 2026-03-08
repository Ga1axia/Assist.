"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import {
    Code2,
    Sun,
    Moon,
    CheckCircle2,
    Circle,
    ExternalLink,
    Send,
    ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mockClientProject = {
    name: "Weather Dashboard",
    status: "In Progress",
    lastUpdate: "March 2, 2026",
    description:
        "A real-time weather dashboard with interactive maps and forecasts, built by The Generator for Seven Hills Foundation.",
    milestones: [
        { name: "Project Setup", status: "complete" },
        { name: "UI Design", status: "complete" },
        { name: "API Integration", status: "in_progress" },
        { name: "Testing & QA", status: "pending" },
        { name: "Deployment", status: "pending" },
    ],
    demoUrl: null,
};

export default function ClientPortalPage() {
    const { theme, setTheme } = useTheme();
    const [feedback, setFeedback] = useState("");
    const [submitted, setSubmitted] = useState(false);

    return (
        <div className="min-h-screen">
            {/* Nav - Generator branding */}
            <nav className="border-b border-[#c7d28a]/20 sticky top-0 z-10 bg-[#006644]/95 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-[#c7d28a] flex items-center justify-center">
                            <Code2 className="w-4 h-4 text-[#006644]" />
                        </div>
                        <div>
                            <span className="font-bold text-[#c7d28a]">THE GENERATOR</span>
                            <span className="text-[#c7d28a]/80 text-xs ml-1.5">Client Portal</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 rounded-lg hover:bg-[#c7d28a]/20 text-[#c7d28a] transition-colors"
                    >
                        <Sun className="w-4 h-4 hidden dark:block" />
                        <Moon className="w-4 h-4 dark:hidden" />
                    </button>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                            {mockClientProject.name}
                        </h1>
                        <span
                            className={cn(
                                "text-xs px-3 py-1 rounded-full font-semibold generator-pill generator-pill-dark"
                            )}
                        >
                            {mockClientProject.status}
                        </span>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Last updated: {mockClientProject.lastUpdate}
                    </p>
                </div>

                {/* Progress Summary */}
                <div className="bg-card/60 border border-[#006644]/40 rounded-xl p-6 mb-6 backdrop-blur-sm">
                    <h2 className="font-semibold text-lg mb-3 text-[#c7d28a]">Project Overview</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {mockClientProject.description}
                    </p>
                </div>

                {/* Milestones */}
                <div className="bg-card/60 border border-[#006644]/40 rounded-xl p-6 mb-6 backdrop-blur-sm">
                    <h2 className="font-semibold text-lg mb-5 text-[#c7d28a]">Key Milestones</h2>
                    <div className="space-y-3">
                        {mockClientProject.milestones.map((milestone, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-3 rounded-xl bg-[#006644]/20 border border-[#c7d28a]/20"
                            >
                                {milestone.status === "complete" ? (
                                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                                ) : milestone.status === "in_progress" ? (
                                    <div className="w-5 h-5 rounded-full border-2 border-[#c7d28a] border-t-transparent animate-spin flex-shrink-0" />
                                ) : (
                                    <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                )}
                                <span
                                    className={cn(
                                        "text-sm font-medium flex-1",
                                        milestone.status === "complete" && "line-through text-muted-foreground"
                                    )}
                                >
                                    {milestone.name}
                                </span>
                                <span
                                    className={cn(
                                        "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                                        milestone.status === "complete" && "bg-success/10 text-success",
                                        milestone.status === "in_progress" && "bg-[#c7d28a]/20 text-[#c7d28a]",
                                        milestone.status === "pending" && "bg-secondary text-muted-foreground"
                                    )}
                                >
                                    {milestone.status.replace("_", " ")}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Demo Link */}
                {mockClientProject.demoUrl && (
                    <div className="bg-card/60 border border-[#006644]/40 rounded-xl p-6 mb-6 backdrop-blur-sm">
                        <h2 className="font-semibold text-lg mb-3 text-[#c7d28a]">Demo</h2>
                        <a
                            href={mockClientProject.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="generator-link flex items-center gap-2 text-[#c7d28a] hover:underline text-sm"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View Live Demo
                        </a>
                    </div>
                )}

                {/* Feedback Form */}
                <div className="bg-card/60 border border-[#006644]/40 rounded-xl p-6 backdrop-blur-sm">
                    <h2 className="font-semibold text-lg mb-3 text-[#c7d28a]">Share Feedback</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Help us improve! Your feedback will be shared with the project team.
                    </p>
                    {submitted ? (
                        <div className="p-4 rounded-xl bg-success/10 text-success text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Thanks for your feedback! The team will review it shortly.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <textarea
                                rows={4}
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Share your thoughts, suggestions, or concerns..."
                                className="w-full px-4 py-3 rounded-xl bg-[#093b26]/50 border border-[#006644]/50 focus:border-[#c7d28a]/60 text-sm resize-none text-foreground focus:outline-none"
                            />
                            <button
                                onClick={() => setSubmitted(true)}
                                disabled={!feedback.trim()}
                                className="generator-button px-5 py-2.5 text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Submit Feedback
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
