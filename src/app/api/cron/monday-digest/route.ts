export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { adminDb } from "@/lib/firebase-admin";

// POST /api/cron/monday-digest - Weekly digest
export async function GET(req: Request) {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch data for digest
        const projectsSnapshot = await adminDb
            .collection("projects")
            .where("status", "!=", "complete")
            .get();
        const activeProjects = projectsSnapshot.size;

        const resourcesSnapshot = await adminDb
            .collection("resources")
            .where("status", "==", "approved")
            .get();
        const totalResources = resourcesSnapshot.size;

        const message = `Good morning from The Generator! 🌟 Here's your weekly digest:

📊 Active Projects: ${activeProjects}
📚 Total Resources: ${totalResources}
🔗 View dashboard: https://code-os.vercel.app

Have a productive week! 💪`;

        const mainGroupId = process.env.WHATSAPP_MAIN_GROUP_ID;
        if (mainGroupId) {
            await sendWhatsAppMessage(mainGroupId, message, "group");
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Monday digest error:", error);
        return NextResponse.json({ error: "Failed to send digest" }, { status: 500 });
    }
}
