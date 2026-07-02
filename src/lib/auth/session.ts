import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/authorization";

export async function requireSession(allowedRoles?: readonly AppRole[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    redirect("/portal");
  }

  return session;
}
