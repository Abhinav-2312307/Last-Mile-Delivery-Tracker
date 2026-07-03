import { PortalShell } from "@/components/dashboard/portal-shell";
import { requireSession } from "@/lib/auth/session";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession(["AGENT"]);
  return (
    <PortalShell role="AGENT" userName={session.user.name ?? "Agent"}>
      {children}
    </PortalShell>
  );
}
