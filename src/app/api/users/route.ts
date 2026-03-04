export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// GET /api/users - List users
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role");
        const search = searchParams.get("search");

        let query: FirebaseFirestore.Query = adminDb.collection("users");
        if (role) query = query.where("role", "==", role);

        const snapshot = await query.get();
        let users = snapshot.docs.map((doc) => ({
            uid: doc.id,
            ...doc.data(),
        }));

        if (search) {
            const lower = search.toLowerCase();
            users = users.filter(
                (u: Record<string, unknown>) =>
                    (u.displayName as string)?.toLowerCase().includes(lower) ||
                    (u.email as string)?.toLowerCase().includes(lower)
            );
        }

        return NextResponse.json({ users });
    } catch (error) {
        console.error("GET /api/users error:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
