import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type NewsletterSource = "popup" | "join-modal" | "landing";

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function emailToDocId(email: string): string {
    return normalizeEmail(email).replace(/[^a-z0-9@._-]/g, "_");
}

export async function subscribeToNewsletter(
    email: string,
    source: NewsletterSource
): Promise<{ alreadySubscribed: boolean }> {
    const normalized = normalizeEmail(email);
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        throw new Error("Please enter a valid email address.");
    }

    const ref = doc(db, "newsletterSubscribers", emailToDocId(normalized));
    await setDoc(
        ref,
        {
            email: normalized,
            source,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );

    return { alreadySubscribed: false };
}
