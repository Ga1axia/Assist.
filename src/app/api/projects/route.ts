export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireRole, getUidFromHeaders } from "@/lib/auth-helpers";

// GET /api/projects - List projects
export async function GET(req: Request) {
    try {
        const uid = getUidFromHeaders(req.headers);
        await requireRole(uid, ["admin", "eboard", "lead", "member"]);

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        let query: FirebaseFirestore.Query = adminDb.collection("projects");
        if (status) {
            query = query.where("status", "==", status);
        }

        const snapshot = await query.get();
        const projects = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ projects });
    } catch (error) {
        const err = error as Error;
        console.error("GET /api/projects error:", err);
        return NextResponse.json(
            { error: err.message },
            { status: err.message.includes("Forbidden") ? 403 : 500 }
        );
    }
}

// POST /api/projects - Create project pitch
export async function POST(req: Request) {
    try {
        const uid = getUidFromHeaders(req.headers);
        await requireRole(uid, ["admin", "eboard", "lead", "member"]);

        const body = await req.json();
        const { name, description, teamMembers } = body;

        if (!name || !description) {
            return NextResponse.json(
                { error: "Missing required fields: name, description" },
                { status: 400 }
            );
        }

        const projectData = {
            name,
            description,
            status: "ideation",
            clientView: {
                visible: false,
                statusLabel: "In Progress",
                lastUpdate: new Date().toISOString(),
                demoUrl: null,
                feedbackFormUrl: null,
            },
            internalView: {
                milestones: [],
                notes: [],
            },
            teamMembers: teamMembers || [{ uid, role: "lead" }],
            clientId: null,
            githubUrl: null,
            featured: false,
            videoUrl: null,
            images: [],
            reflections: [],
            caseStudy: {
                draft: null,
                approved: false,
                publishedAt: null,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const docRef = await adminDb.collection("projects").add(projectData);

        // Create activity feed entry
        await adminDb.collection("activityFeed").add({
            type: "project_create",
            actorId: uid,
            actorName: "User",
            targetId: docRef.id,
            targetName: name,
            description: `Created new project: ${name}`,
            pinned: false,
            pinnedBy: null,
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, projectId: docRef.id });
    } catch (error) {
        const err = error as Error;
        console.error("POST /api/projects error:", err);
        return NextResponse.json(
            { error: err.message },
            { status: err.message.includes("Forbidden") ? 403 : 500 }
        );
    }
}
