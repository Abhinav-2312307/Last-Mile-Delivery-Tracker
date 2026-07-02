import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { dashboardPathForRole } from "@/lib/auth/authorization";

export default async function PortalPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  redirect(dashboardPathForRole(session.user.role));
}
