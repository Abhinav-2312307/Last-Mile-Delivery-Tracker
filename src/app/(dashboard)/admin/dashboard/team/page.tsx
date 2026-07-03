import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { Users, Shield, Bike } from "lucide-react";

export default async function AdminTeamPage() {
  await requireSession(["ADMIN"]);

  // Fetch agents and their profile details
  const agents = await prisma.agentProfile.findMany({
    include: {
      user: true,
      zones: {
        include: {
          zone: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch managers
  const managers = await prisma.user.findMany({
    where: { role: "MANAGER", isActive: true },
    orderBy: { name: "asc" },
  });

  // Count active deliveries for agents
  const agentOrderCounts = await prisma.order.groupBy({
    by: ["assignedAgentId"],
    where: {
      status: {
        in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"],
      },
    },
    _count: true,
  });

  const activeOrdersMap = new Map(
    agentOrderCounts.map((group) => [group.assignedAgentId, group._count])
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Staff management</p>
          <h1>Operations Directory</h1>
          <p>Review system managers and track field agent task load and zone coverage.</p>
        </div>
      </div>

      {/* Managers Section */}
      <section className="data-section">
        <div className="section-title flex items-center gap-2">
          <Shield size={20} className="text-accent" />
          <h2>Operations Managers ({managers.length})</h2>
        </div>
        {managers.length === 0 ? (
          <p className="muted text-sm my-4">No active system managers registered.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Manager Name</th>
                  <th>Email Account</th>
                  <th>Phone Contact</th>
                  <th>Operational Status</th>
                </tr>
              </thead>
              <tbody>
                {managers.map((manager) => (
                  <tr key={manager.id}>
                    <td>
                      <strong>{manager.name}</strong>
                    </td>
                    <td>{manager.email}</td>
                    <td>{manager.phone || "No phone contact"}</td>
                    <td>
                      <span className="status-pill status-active">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Agents Section */}
      <section className="data-section mt-6">
        <div className="section-title flex items-center gap-2">
          <Bike size={20} className="text-accent" />
          <h2>Delivery Field Agents ({agents.length})</h2>
        </div>
        {agents.length === 0 ? (
          <p className="muted text-sm my-4">No registered delivery field agents found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee Code</th>
                  <th>Agent Name</th>
                  <th>Contact Info</th>
                  <th>Availability</th>
                  <th>Coverage Zones</th>
                  <th className="text-center">Active Workload</th>
                  <th className="text-center">Limit</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => {
                  const activeCount = activeOrdersMap.get(agent.userId) || 0;
                  return (
                    <tr key={agent.id}>
                      <td>
                        <code>{agent.employeeCode}</code>
                      </td>
                      <td>
                        <strong>{agent.user.name}</strong>
                      </td>
                      <td>
                        <span>{agent.user.email}</span>
                        <small className="muted">{agent.user.phone || "No phone contact"}</small>
                      </td>
                      <td>
                        <span className={`status-pill availability-${agent.availability.toLowerCase()}`}>
                          {agent.availability.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        {agent.zones.map((za) => za.zone.code).join(", ") || (
                          <em className="muted">No coverage zones assigned</em>
                        )}
                      </td>
                      <td className="text-center font-semibold">
                        {activeCount} orders
                      </td>
                      <td className="text-center muted">
                        {agent.maxActiveOrders}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
