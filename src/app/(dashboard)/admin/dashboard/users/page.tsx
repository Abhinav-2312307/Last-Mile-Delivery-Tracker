import { createStaffUser, toggleUser } from "../actions";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export default async function UsersPage() {
  const session = await requireSession(["ADMIN"]);
  const users = await prisma.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });
  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">Access control</p><h1>Users and roles</h1><p>Create operational accounts and control access.</p></div></div>
      <section className="data-section"><details className="creation-panel"><summary className="button button-primary">Add user</summary><form action={createStaffUser} className="form-grid user-form"><label>Name<input name="name" required /></label><label>Email<input name="email" type="email" required /></label><label>Phone<input name="phone" required /></label><label>Role<select name="role"><option>CUSTOMER</option><option>AGENT</option><option>MANAGER</option><option>ADMIN</option></select></label><label>Temporary password<input name="password" type="password" minLength={8} required /></label><button className="button button-primary">Create account</button></form></details>
        <div className="table-wrap"><table><thead><tr><th>Name</th><th>Contact</th><th>Role</th><th>Status</th><th>Action</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><strong>{user.name}</strong><small>{user.createdAt.toLocaleDateString("en-IN")}</small></td><td>{user.email}<small>{user.phone}</small></td><td>{user.role}</td><td>{user.isActive ? "Active" : "Disabled"}</td><td>{user.id !== session.user.id && <form action={toggleUser.bind(null, user.id, !user.isActive)}><button className={`button button-small ${user.isActive ? "button-danger" : "button-secondary"}`}>{user.isActive ? "Disable" : "Enable"}</button></form>}</td></tr>)}</tbody></table></div>
      </section>
    </>
  );
}
