import { UserRole } from "@/contexts/auth-context";

// Roles that have admin/eboard access to the Admin Center
export const ADMIN_ROLES: UserRole[] = ["president", "vice-president", "community-manager"];

// All roles in the organization
export const ALL_ROLES: { value: UserRole; label: string }[] = [
    { value: "resident", label: "Resident" },
    { value: "associate", label: "Associate" },
    { value: "marketing", label: "Marketing" },
    { value: "events", label: "Events" },
    { value: "finance", label: "Finance" },
    { value: "vice-president", label: "Vice President" },
    { value: "president", label: "President" },
    { value: "community-manager", label: "Community Manager" },
    { value: "alumni", label: "Alumni" },
];

export function isAdmin(role: string | undefined): boolean {
    return ADMIN_ROLES.includes(role as UserRole);
}

export function getRoleLabel(role: string): string {
    const found = ALL_ROLES.find((r) => r.value === role);
    return found?.label || role;
}
