export type UserRole = "Admin" | "User";

export function isAdmin(role: string | null | undefined) {
  return role === "Admin";
}

export function canManageUsers(role: string | null | undefined) {
  return role === "Admin";
}

export function canViewAuditLogs(role: string | null | undefined) {
  return role === "Admin";
}
