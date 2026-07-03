export type AppRole = "CUSTOMER" | "AGENT" | "MANAGER" | "ADMIN";

const portalByRole: Record<AppRole, string> = {
  CUSTOMER: "/customer",
  AGENT: "/agent/dashboard",
  MANAGER: "/manager/dashboard",
  ADMIN: "/admin/dashboard",
};

const publicPaths = [
  "/",
  "/login",
  "/register",
  "/terms",
  "/privacy",
  "/contact",
  "/verify-email",
];

export function dashboardPathForRole(role: AppRole) {
  return portalByRole[role];
}

export function canAccessPath(role: AppRole | undefined, pathname: string) {
  // Public paths anyone can visit
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/register") ||
    pathname.startsWith("/api/auth/verify-email") ||
    pathname.startsWith("/api/auth/resend-verification")
  ) {
    return true;
  }

  // Dynamic login/register pages are public
  if (pathname.startsWith("/login/") || pathname.startsWith("/register/")) {
    return true;
  }

  // Portal landing pages (/admin, /manager, /agent) are public
  const portalLandingPages = ["/admin", "/manager", "/agent"];
  if (portalLandingPages.includes(pathname)) {
    return true;
  }

  if (!role) {
    return false;
  }

  // Customer accesses /customer/*
  if (role === "CUSTOMER") return pathname.startsWith("/customer");
  // Agent accesses /agent/dashboard/*
  if (role === "AGENT") return pathname.startsWith("/agent/dashboard");
  // Manager accesses /manager/dashboard/*
  if (role === "MANAGER") return pathname.startsWith("/manager/dashboard");
  // Admin accesses /admin/dashboard/*
  if (role === "ADMIN") return pathname.startsWith("/admin/dashboard");

  return false;
}
