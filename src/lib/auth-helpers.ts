import { getUserRole } from "./firebase-admin";

export type UserRole = "admin" | "eboard" | "lead" | "member" | "alumni" | "client";

export async function requireRole(uid: string, allowedRoles: UserRole[]) {
    const userRole = await getUserRole(uid);
    if (!allowedRoles.includes(userRole as UserRole)) {
        throw new Error(
            `Forbidden: Requires one of [${allowedRoles.join(", ")}]`
        );
    }
    return userRole as UserRole;
}

export function getUidFromHeaders(headers: Headers): string {
    const uid = headers.get("x-user-uid");
    if (!uid) {
        throw new Error("Unauthorized: No user UID in headers");
    }
    return uid;
}
