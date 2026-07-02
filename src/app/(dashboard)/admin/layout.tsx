import { PortalShell } from "@/components/dashboard/portal-shell";
import { requireSession } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession(["ADMIN"]);
  return (
    <PortalShell role="ADMIN" userName={session.user.name ?? "Admin"}>
      {children}
    </PortalShell>
  );
}
