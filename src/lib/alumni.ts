import type { ResidencyType } from "@/lib/member-residency";
import { parseClubRole, parseResidency } from "@/lib/member-residency";

export function isAlumniUser(
    role: string | undefined,
    residency: ResidencyType | string | undefined
): boolean {
    return role === "alumni" || residency === "alumni";
}

export function isAlumniRecord(raw: Record<string, unknown>): boolean {
    return isAlumniUser(parseClubRole(raw), parseResidency(raw));
}

export function resolveLinkedinFromAccount(raw: Record<string, unknown>): string | null {
    const top = raw.linkedin;
    if (typeof top === "string" && top.trim()) return top.trim();
    const legacy = raw.alumni;
    if (legacy && typeof legacy === "object" && legacy !== null) {
        const url = (legacy as { linkedinUrl?: unknown }).linkedinUrl;
        if (typeof url === "string" && url.trim()) return url.trim();
    }
    return null;
}

export function resolveAccountEmail(raw: Record<string, unknown>): string {
    return typeof raw.email === "string" ? raw.email : "";
}

/** Alumni default to open for mentorship unless explicitly set to false. */
export function resolveOpenToMentorship(raw: Record<string, unknown>): boolean {
    if (!isAlumniRecord(raw)) return raw.openToMentorship === true;

    if (typeof raw.openToMentorship === "boolean") return raw.openToMentorship;

    const legacy = raw.alumni;
    if (legacy && typeof legacy === "object" && legacy !== null) {
        const enabled = (legacy as { mentorshipEnabled?: unknown }).mentorshipEnabled;
        if (typeof enabled === "boolean") return enabled;
    }

    return true;
}

/** When marking someone alumni, opt them into mentorship unless they opted out. */
export function mentorshipPatchForAlumniStatus(
    role: string,
    residency: ResidencyType,
    existingOpenToMentorship?: boolean
): { openToMentorship: true } | null {
    if (!isAlumniUser(role, residency)) return null;
    if (existingOpenToMentorship === false) return null;
    return { openToMentorship: true };
}
