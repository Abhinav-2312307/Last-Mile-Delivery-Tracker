import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

import {
  canAccessPath,
  dashboardPathForRole,
  type AppRole,
} from "@/lib/auth/authorization";

export default withAuth(
  function middleware(request) {
    const role = request.nextauth.token?.role as AppRole | undefined;
    const pathname = request.nextUrl.pathname;

    if (!canAccessPath(role, pathname)) {
      if (!role) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.redirect(
        new URL(dashboardPathForRole(role), request.url),
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  },
);

export const config = {
  matcher: [
    "/customer/:path*",
    "/agent/dashboard/:path*",
    "/manager/dashboard/:path*",
    "/admin/dashboard/:path*",
  ],
};
