export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// GET /api/faq - List published FAQs
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");

        let query: FirebaseFirestore.Query = adminDb.collection("faq");
        if (category) query = query.where("category", "==", category);

        const snapshot = await query.orderBy("createdAt", "desc").get();
        const faqs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ faqs });
    } catch (error) {
        console.error("GET /api/faq error:", error);
        return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
    }
}
