export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireRole, getUidFromHeaders } from "@/lib/auth-helpers";

// POST /api/action-items
export async function POST(req: Request) {
    try {
        const uid = getUidFromHeaders(req.headers);
        await requireRole(uid, ["admin", "eboard"]);

        const body = await req.json();
        const { title, description, deadline, type, link } = body;

        if (!title || !description || !deadline || !type) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const itemData = {
            title,
            description,
            deadline,
            type,
            link: link || null,
            completedBy: [],
            createdBy: uid,
            createdAt: new Date(),
        };

        const docRef = await adminDb.collection("actionItems").add(itemData);

        // Create activity feed entry
        await adminDb.collection("activityFeed").add({
            type: "announcement",
            actorId: uid,
            actorName: "System",
            targetId: docRef.id,
            targetName: title,
            description: `Created new Action Item: ${title}`,
            pinned: false,
            pinnedBy: null,
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, itemId: docRef.id });
    } catch (error) {
        const err = error as Error;
        console.error("POST /api/action-items error:", err);
        return NextResponse.json(
            { error: err.message },
            { status: err.message.includes("Forbidden") ? 403 : 500 }
        );
    }
}
