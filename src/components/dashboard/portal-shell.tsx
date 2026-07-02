import {
  BarChart3,
  Bike,
  Boxes,
  CircleDollarSign,
  LayoutDashboard,
  MapPinned,
  PackagePlus,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";

import type { AppRole } from "@/lib/auth/authorization";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const navigation: Record<AppRole, NavItem[]> = {
  CUSTOMER: [
    { href: "/customer", label: "Overview", icon: LayoutDashboard },
    { href: "/customer/orders/new", label: "Book delivery", icon: PackagePlus },
  ],
  AGENT: [
    { href: "/agent", label: "Assignments", icon: Bike },
  ],
  MANAGER: [
    { href: "/manager", label: "Overview", icon: BarChart3 },
    { href: "/manager/orders", label: "Dispatch", icon: Boxes },
  ],
  ADMIN: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: Boxes },
    { href: "/admin/zones", label: "Locations", icon: MapPinned },
    { href: "/admin/rates", label: "Rate cards", icon: CircleDollarSign },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/notifications", label: "Notifications", icon: Settings },
  ],
};

export function PortalShell({
  role,
  userName,
  children,
}: {
  role: AppRole;
  userName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="portal">
      <aside className="sidebar">
        <Link className="sidebar-brand" href="/portal">
          <span className="brand-mark">LM</span>
          <span>
            <strong>Last-Mile</strong>
            <small>Delivery Tracker</small>
          </span>
        </Link>
        <nav className="sidebar-nav" aria-label="Portal navigation">
          {navigation[role].map(({ href, label, icon: Icon }) => (
            <Link href={href} key={href}>
              <Icon aria-hidden="true" size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div>
            <strong>{userName}</strong>
            <span>{role.toLowerCase()}</span>
          </div>
          <SignOutButton />
        </div>
      </aside>
      <div className="portal-main">
        <header className="mobile-header">
          <Link className="sidebar-brand" href="/portal">
            <span className="brand-mark">LM</span>
            <strong>Last-Mile</strong>
          </Link>
          <SignOutButton />
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
