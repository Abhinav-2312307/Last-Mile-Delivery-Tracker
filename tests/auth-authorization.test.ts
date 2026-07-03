import { describe, expect, it } from "vitest";

import {
  canAccessPath,
  dashboardPathForRole,
} from "@/lib/auth/authorization";

describe("role authorization", () => {
  it.each([
    ["CUSTOMER", "/customer"],
    ["AGENT", "/agent/dashboard"],
    ["MANAGER", "/manager/dashboard"],
    ["ADMIN", "/admin/dashboard"],
  ] as const)("routes %s to its portal", (role, expectedPath) => {
    expect(dashboardPathForRole(role)).toBe(expectedPath);
  });

  it("allows a role to access only its own portal", () => {
    expect(canAccessPath("AGENT", "/agent/dashboard/orders/123")).toBe(true);
    expect(canAccessPath("AGENT", "/admin/dashboard/orders")).toBe(false);
    expect(canAccessPath("CUSTOMER", "/customer/orders/new")).toBe(true);
    expect(canAccessPath("CUSTOMER", "/manager/dashboard")).toBe(false);
  });

  it("allows public paths without a role", () => {
    expect(canAccessPath(undefined, "/login")).toBe(true);
    expect(canAccessPath(undefined, "/register")).toBe(true);
    expect(canAccessPath(undefined, "/")).toBe(true);
    expect(canAccessPath(undefined, "/terms")).toBe(true);
    expect(canAccessPath(undefined, "/privacy")).toBe(true);
    expect(canAccessPath(undefined, "/admin")).toBe(true);
    expect(canAccessPath(undefined, "/manager")).toBe(true);
    expect(canAccessPath(undefined, "/agent")).toBe(true);
  });
});
