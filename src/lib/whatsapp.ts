import axios from "axios";

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_API_TOKEN;

export async function sendWhatsAppMessage(
    recipient: string,
    text: string,
    type: "individual" | "group" = "individual"
) {
    const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;

    const payload = {
        messaging_product: "whatsapp",
        to: type === "group" ? recipient : recipient.replace(/\D/g, ""),
        type: "text",
        text: { body: text },
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error: unknown) {
        const axiosErr = error as { response?: { data?: unknown }; message?: string };
        console.error("WhatsApp API Error:", axiosErr.response?.data || axiosErr.message);
        throw new Error("Failed to send WhatsApp message");
    }
}

export async function verifyWebhook(
    mode: string,
    token: string,
    challenge: string
) {
    const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return challenge;
    }
    throw new Error("Webhook verification failed");
}

export function parseIncomingMessage(body: Record<string, unknown>) {
    const entry = (body.entry as Array<Record<string, unknown>>)?.[0];
    const change = (entry?.changes as Array<Record<string, unknown>>)?.[0];
    const value = change?.value as Record<string, unknown>;
    const messages = value?.messages as Array<Record<string, unknown>>;
    const message = messages?.[0];

    if (!message) return null;

    const contacts = value?.contacts as Array<Record<string, unknown>>;
    const profile = contacts?.[0]?.profile as Record<string, unknown>;

    return {
        from: message.from as string,
        messageId: message.id as string,
        text: (message.text as Record<string, string>)?.body,
        timestamp: message.timestamp as string,
        name: profile?.name as string,
    };
}
