export type AppRole = "CUSTOMER" | "AGENT" | "MANAGER" | "ADMIN";

const portalByRole: Record<AppRole, string> = {
  CUSTOMER: "/customer",
  AGENT: "/agent",
  MANAGER: "/manager",
  ADMIN: "/admin",
};

const publicPaths = ["/", "/login", "/register", "/verify-email"];

export function dashboardPathForRole(role: AppRole) {
  return portalByRole[role];
}

export function canAccessPath(role: AppRole | undefined, pathname: string) {
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/register") ||
    pathname.startsWith("/api/auth/verify-email") ||
    pathname.startsWith("/api/auth/resend-verification")
  ) {
    return true;
  }

  if (!role) {
    return false;
  }

  return pathname.startsWith(portalByRole[role]);
}
