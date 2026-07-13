"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { canPostAnnouncement } from "@/lib/roles";
import { useFeed } from "@/hooks/useFirestore";
import {
    Activity,
    Pin,
    Rocket,
    BookOpen,
    CheckCircle2,
    UserPlus,
    Clock,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LinkifyText } from "@/components/linkify-text";
import { PageHeader } from "@/components/page-header";

const typeIcons: Record<string, { icon: React.ReactNode; color: string; border: string }> = {
    milestone_update: { icon: <Rocket className="w-4 h-4" />, color: "text-[#00ff41] bg-[rgba(0,255,65,0.1)]", border: "border-[rgba(0,255,65,0.3)]" },
    resource_upload: { icon: <BookOpen className="w-4 h-4" />, color: "text-[#00ff41] bg-[rgba(0,255,65,0.08)]", border: "border-[rgba(0,255,65,0.25)]" },
    project_complete: { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-[#00ff41] bg-[rgba(0,255,65,0.12)]", border: "border-[rgba(0,255,65,0.35)]" },
    member_join: { icon: <UserPlus className="w-4 h-4" />, color: "text-white bg-white/5", border: "border-[rgba(0,255,65,0.2)]" },
};

export default function FeedPage() {
    const { profile } = useAuth();
    const { data: activities, loading, togglePin } = useFeed();
    const [filter, setFilter] = useState<"all" | "pinned">("all");
    const isEBoard = canPostAnnouncement(profile?.role);

    const filteredActivities = filter === "pinned" ? activities.filter((a) => a.pinned) : activities;

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] animate-fade-in relative z-10 max-w-4xl mx-auto">
            <PageHeader
                eyebrow="Activity"
                title="Member feed"
                description="Updates from projects, resources, and members across the community."
                actions={
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter("all")}
                            className={cn(
                                "etower-soft-btn px-4 py-2 text-xs",
                                filter === "all" ? "etower-btn--primary" : "etower-soft-btn etower-soft-btn--ghost"
                            )}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter("pinned")}
                            className={cn(
                                "etower-soft-btn px-4 py-2 text-xs flex items-center gap-2",
                                filter === "pinned" ? "etower-btn--primary" : "etower-soft-btn etower-soft-btn--ghost"
                            )}
                        >
                            <Pin className="w-3.5 h-3.5" />
                            Pinned
                        </button>
                    </div>
                }
            />

            {loading && (
                <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00ff41]" />
                    <span className="text-xs text-white/45 tracking-wide">Loading activity…</span>
                </div>
            )}

            {!loading && (
                <div className="flex-1 space-y-4">
                    {filteredActivities.map((activity) => {
                        const typeInfo = typeIcons[activity.type] || typeIcons.milestone_update;
                        return (
                            <div
                                key={activity.id}
                                className={cn(
                                    "etower-soft-card border p-5 sm:p-6 transition-all relative",
                                    activity.pinned
                                        ? "border-[rgba(0,255,65,0.5)] bg-[rgba(0,255,65,0.04)]"
                                        : "border-[rgba(0,255,65,0.25)]"
                                )}
                            >
                                {activity.pinned && (
                                    <div className="absolute top-4 right-4">
                                        <Pin className="w-4 h-4 text-[#00ff41] fill-[#00ff41]" />
                                    </div>
                                )}
                                <div className="flex items-start gap-4">
                                    <div
                                        className={cn(
                                            "w-12 h-12 flex items-center justify-center flex-shrink-0 border",
                                            typeInfo.color,
                                            typeInfo.border
                                        )}
                                    >
                                        {typeInfo.icon}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="text-xs font-bold bg-white/5 px-2 py-0.5 border border-[rgba(0,255,65,0.2)] text-white">
                                                {activity.actorName}
                                            </span>
                                            <span className="text-[10px] text-white/40 flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                {activity.createdAt}
                                            </span>
                                        </div>
                                        <p className="text-sm leading-relaxed text-white/65">
                                            <LinkifyText>{activity.description}</LinkifyText>
                                            {activity.targetName && (
                                                <span className="font-bold text-[#00ff41] ml-1">[{activity.targetName}]</span>
                                            )}
                                        </p>
                                    </div>
                                    {isEBoard && (
                                        <button
                                            onClick={() => togglePin(activity.id, activity.pinned, profile?.uid || "")}
                                            className={cn(
                                                "p-2.5 border transition-all flex-shrink-0",
                                                activity.pinned
                                                    ? "bg-[#00ff41] text-[#0a0a0a] border-[#00ff41]"
                                                    : "bg-transparent border-[rgba(0,255,65,0.25)] text-white/45 hover:text-[#00ff41] hover:border-[#00ff41]"
                                            )}
                                            title={activity.pinned ? "Unpin" : "Pin"}
                                        >
                                            <Pin className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {filteredActivities.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center py-24 etower-soft-card border border-[rgba(0,255,65,0.25)]">
                            <Activity className="w-16 h-16 text-white/20 mb-4" />
                            <p className="text-xs font-bold text-white/45 tracking-wide text-center max-w-sm leading-relaxed">
                                {filter === "pinned" ? "No pinned posts yet." : "No activity to show."}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
