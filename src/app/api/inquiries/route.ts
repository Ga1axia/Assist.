export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// GET /api/inquiries - List inquiries (E-Board only)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const status = searchParams.get("status");

        let query: FirebaseFirestore.Query = adminDb.collection("inquiries");
        if (category) query = query.where("category", "==", category);
        if (status) query = query.where("status", "==", status);

        const snapshot = await query.orderBy("createdAt", "desc").get();
        const inquiries = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ inquiries });
    } catch (error) {
        console.error("GET /api/inquiries error:", error);
        return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
    }
}

// POST /api/inquiries - Create new inquiry
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { question, category, askedBy } = body;

        if (!question || !category) {
            return NextResponse.json({ error: "Missing question or category" }, { status: 400 });
        }

        const inquiryData = {
            question,
            category,
            askedBy: askedBy || null,
            status: "pending",
            response: null,
            aiTags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const docRef = await adminDb.collection("inquiries").add(inquiryData);
        return NextResponse.json({ success: true, inquiryId: docRef.id });
    } catch (error) {
        console.error("POST /api/inquiries error:", error);
        return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 });
    }
}
