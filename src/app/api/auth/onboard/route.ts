export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split("Bearer ")[1];
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decodedToken = await verifyIdToken(token);
        const uid = decodedToken.uid;
        const body = await req.json();

        // Check if user already exists
        const userDoc = await adminDb.collection("users").doc(uid).get();
        if (userDoc.exists && body.onboarded !== true) {
            // If user exists but this isn't a completion request, update onboarding fields
            if (body.standoutSkill || body.bio || body.skills || body.interests) {
                await adminDb.collection("users").doc(uid).set({
                    standoutSkill: body.standoutSkill || null,
                    bio: body.bio || null,
                    skills: body.skills || [],
                    interests: body.interests || [],
                    onboarded: body.onboarded ?? false,
                    updatedAt: new Date(),
                }, { merge: true });
                return NextResponse.json({ message: "User updated with onboarding data" });
            }
            return NextResponse.json({ message: "User already exists" });
        } else if (userDoc.exists && body.onboarded === true) {
            // Mark onboarding complete for existing user
            await adminDb.collection("users").doc(uid).set({
                standoutSkill: body.standoutSkill || null,
                bio: body.bio || null,
                skills: body.skills || [],
                interests: body.interests || [],
                displayName: body.displayName || null,
                onboarded: true,
                status: "pending",
                updatedAt: new Date(),
            }, { merge: true });
            return NextResponse.json({ message: "Onboarding complete" });
        }

        // Create new user document
        const userData = {
            uid,
            email: decodedToken.email || null,
            displayName: body.displayName || decodedToken.name || null,
            photoURL: body.photoURL || decodedToken.picture || null,
            role: "member",
            status: "pending",
            standoutSkill: body.standoutSkill || null,
            bio: body.bio || null,
            skills: body.skills || [],
            interests: body.interests || [],
            onboarded: body.onboarded ?? false,
            joinDate: new Date(),
            lastActive: new Date(),
            engagementMetrics: {
                attendanceRate: 0,
                pitchesSubmitted: 0,
                uploadsCount: 0,
                projectsCompleted: 0,
            },
            projects: [],
            alumni: {
                isAlumni: false,
                mentorshipEnabled: false,
                linkedinUrl: null,
                email: null,
            },
            whatsappNumber: null,
            preferences: {
                emailNotifications: true,
                whatsappNotifications: false,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await adminDb.collection("users").doc(uid).set(userData);

        // Create activity feed entry
        await adminDb.collection("activityFeed").add({
            type: "member_join",
            actorId: uid,
            actorName: userData.displayName || "New Member",
            targetId: null,
            targetName: null,
            description: `${userData.displayName || "New Member"} joined CODE`,
            pinned: false,
            pinnedBy: null,
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, user: userData });
    } catch (error) {
        console.error("Onboard error:", error);
        return NextResponse.json(
            { error: "Failed to onboard user" },
            { status: 500 }
        );
    }
}
