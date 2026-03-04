import { NextResponse } from "next/server";
import { verifyWebhook, parseIncomingMessage } from "@/lib/whatsapp";

// GET - Webhook verification
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode") || "";
    const token = searchParams.get("hub.verify_token") || "";
    const challenge = searchParams.get("hub.challenge") || "";

    try {
        const verifiedChallenge = await verifyWebhook(mode, token, challenge);
        return new Response(verifiedChallenge, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
}

// POST - Incoming message handling
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const message = parseIncomingMessage(body);

        if (message) {
            console.log("Received WhatsApp message:", message);
            // TODO: Implement auto-response logic or log to admin
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ success: true }); // Always return 200 to WhatsApp
    }
}
