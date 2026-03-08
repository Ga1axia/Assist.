export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { adminDb } from "@/lib/firebase-admin";

// GET /api/cron/deadline-alerts - Daily deadline alerts
export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const projectsSnapshot = await adminDb
            .collection("projects")
            .where("status", "!=", "complete")
            .get();

        let alertsSent = 0;

        for (const doc of projectsSnapshot.docs) {
            const project = doc.data();
            const milestones = project.internalView?.milestones || [];

            for (const milestone of milestones) {
                if (milestone.status === "pending" || milestone.status === "in_progress") {
                    const dueDate = milestone.dueDate?.toDate?.() || new Date(milestone.dueDate);
                    if (dueDate && dueDate <= tomorrow && dueDate >= now) {
                        const message = `⏰ Deadline Alert

Project: ${project.name}
Milestone: ${milestone.name}
Due: Tomorrow

Link: https://the-generator.vercel.app/projects/${doc.id}`;

                        // Send to team members
                        for (const member of project.teamMembers || []) {
                            const userDoc = await adminDb.collection("users").doc(member.uid).get();
                            const phone = userDoc.data()?.whatsappNumber;
                            if (phone) {
                                await sendWhatsAppMessage(phone, message, "individual");
                                alertsSent++;
                            }
                        }
                    }
                }
            }
        }

        return NextResponse.json({ success: true, alertsSent });
    } catch (error) {
        console.error("Deadline alerts error:", error);
        return NextResponse.json({ error: "Failed to send alerts" }, { status: 500 });
    }
}
