import { PortalShell } from "@/components/dashboard/portal-shell";
import { requireSession } from "@/lib/auth/session";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession(["CUSTOMER"]);
  return (
    <PortalShell role="CUSTOMER" userName={session.user.name ?? "Customer"}>
      {children}
    </PortalShell>
  );
}
