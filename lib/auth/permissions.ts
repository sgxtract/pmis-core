export type UserRole = "Admin" | "Moderator" | "User";

export function isAdmin(role: string | null | undefined) {
  return role === "Admin";
}

export function isModerator(role: string | null | undefined) {
  return role === "Moderator";
}

export function canManageUsers(role: string | null | undefined) {
  return role === "Admin" || role === "Moderator";
}

export function canViewAuditLogs(role: string | null | undefined) {
  return role === "Admin" || role === "Moderator";
}
