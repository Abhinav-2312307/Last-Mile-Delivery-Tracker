import { PortalShell } from "@/components/dashboard/portal-shell";
import { requireSession } from "@/lib/auth/session";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession(["MANAGER"]);
  return (
    <PortalShell role="MANAGER" userName={session.user.name ?? "Manager"}>
      {children}
    </PortalShell>
  );
}
