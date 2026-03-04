"use client";

import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

interface Activity {
    id: string;
    type: "milestone_update" | "resource_upload" | "project_complete" | "member_join";
    actorId: string;
    actorName: string;
    targetId: string | null;
    targetName: string | null;
    description: string;
    pinned: boolean;
    pinnedBy: string | null;
    createdAt: Date;
}

export function useActivityFeed(limitCount = 20) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, "activityFeed"),
            orderBy("pinned", "desc"),
            orderBy("createdAt", "desc"),
            limit(limitCount)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Activity[];

            setActivities(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [limitCount]);

    return { activities, loading };
}
