export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireRole, getUidFromHeaders } from "@/lib/auth-helpers";

// GET /api/resources - List resources
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");
        const tier = searchParams.get("tier");
        const phase = searchParams.get("phase");
        const status = searchParams.get("status");

        let query: FirebaseFirestore.Query = adminDb.collection("resources");

        if (tier) query = query.where("tier", "==", tier);
        if (phase) query = query.where("phase", "==", phase);
        if (status) query = query.where("status", "==", status);
        else query = query.where("status", "==", "approved");

        const snapshot = await query.get();
        let resources = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        if (search) {
            const lower = search.toLowerCase();
            resources = resources.filter((r: Record<string, unknown>) =>
                (r.title as string)?.toLowerCase().includes(lower)
            );
        }

        return NextResponse.json({ resources });
    } catch (error) {
        console.error("GET /api/resources error:", error);
        return NextResponse.json(
            { error: "Failed to fetch resources" },
            { status: 500 }
        );
    }
}

// POST /api/resources - Upload resource (pending approval)
export async function POST(req: Request) {
    try {
        const uid = getUidFromHeaders(req.headers);
        await requireRole(uid, ["admin", "eboard", "lead", "member"]);

        const body = await req.json();
        const { title, description, type, phase, topics, fileUrl, externalUrl } = body;

        if (!title || !description) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const userRole = await requireRole(uid, [
            "admin",
            "eboard",
            "lead",
            "member",
        ]);

        const resourceData = {
            title,
            description,
            type: type || "guide",
            tier: userRole === "admin" || userRole === "eboard" ? "official" : "community",
            phase: phase || "beginner",
            topics: topics || [],
            fileUrl: fileUrl || null,
            externalUrl: externalUrl || null,
            uploadedBy: uid,
            approvedBy: null,
            status: "pending",
            views: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const docRef = await adminDb.collection("resources").add(resourceData);

        return NextResponse.json({ success: true, resourceId: docRef.id });
    } catch (error) {
        const err = error as Error;
        console.error("POST /api/resources error:", err);
        return NextResponse.json(
            { error: err.message },
            { status: err.message.includes("Forbidden") ? 403 : 500 }
        );
    }
}
