"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      className="icon-button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      title="Sign out"
      type="button"
    >
      <LogOut aria-hidden="true" size={18} />
      <span className="sr-only">Sign out</span>
    </button>
  );
}
