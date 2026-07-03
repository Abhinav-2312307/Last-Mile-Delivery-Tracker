import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { approveUser, rejectUser } from "@/app/(dashboard)/admin/dashboard/actions";
import { ShieldCheck, UserX, UserCheck } from "lucide-react";

export default async function AdminApprovalsPage() {
  await requireSession(["ADMIN"]);

  const pendingUsers = await prisma.user.findMany({
    where: { isApproved: false },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Security queue</p>
          <h1>Pending Access Approvals</h1>
          <p>Review self-registered manager and field agent account applications.</p>
        </div>
      </div>

      <section className="data-section">
        {pendingUsers.length === 0 ? (
          <div className="empty-state">
            <ShieldCheck size={36} className="text-success" />
            <h3>Queue is clear</h3>
            <p>No pending account authorization requests at this time.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Contact Info</th>
                  <th>Requested Role</th>
                  <th>Note / Justification</th>
                  <th>Applied On</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong>
                    </td>
                    <td>
                      <span>{user.email}</span>
                      <small className="muted">{user.phone || "No phone"}</small>
                    </td>
                    <td>
                      <span className="role-badge">{user.role}</span>
                    </td>
                    <td>
                      <p className="approval-reason-text">
                        {user.approvalNote || <em className="muted">No justification note provided.</em>}
                      </p>
                    </td>
                    <td>
                      <time className="text-xs">
                        {user.createdAt.toLocaleDateString("en-IN")}
                      </time>
                    </td>
                    <td>
                      <div className="flex-row-end gap-2">
                        <form action={approveUser.bind(null, user.id)}>
                          <button className="button button-small button-success flex items-center gap-1">
                            <UserCheck size={14} /> Approve
                          </button>
                        </form>
                        <form action={rejectUser.bind(null, user.id)}>
                          <button className="button button-small button-danger flex items-center gap-1">
                            <UserX size={14} /> Reject
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
