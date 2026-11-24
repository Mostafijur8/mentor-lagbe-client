import type { Role } from "@/types";

// These helpers keep role-based navigation consistent while the backend enforces real permissions.
export function getRoleHome(role: Role) {
  return `/dashboard/${role}` as const;
}

export function isDashboardPathAllowed(pathname: string, role: Role) {
  if (pathname.startsWith("/dashboard/profile")) return true;
  return pathname.startsWith(`/dashboard/${role}`) || pathname === "/dashboard";
}
