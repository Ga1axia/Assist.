export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { adminDb } from "@/lib/firebase-admin";

// POST /api/whatsapp/send-dm - Send WhatsApp DM
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, message } = body;

        if (!userId || !message) {
            return NextResponse.json({ error: "Missing userId or message" }, { status: 400 });
        }

        const userDoc = await adminDb.collection("users").doc(userId).get();
        const phoneNumber = userDoc.data()?.whatsappNumber;

        if (!phoneNumber) {
            return NextResponse.json({ error: "User has no WhatsApp number" }, { status: 400 });
        }

        const result = await sendWhatsAppMessage(phoneNumber, message, "individual");

        // Log message
        await adminDb.collection("whatsappMessages").add({
            type: "inquiry_response",
            recipients: [{ userId, phoneNumber, deliveryStatus: "sent" }],
            content: message,
            groupId: null,
            scheduledFor: null,
            sentAt: new Date(),
            createdBy: "system",
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error("Send DM error:", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}
