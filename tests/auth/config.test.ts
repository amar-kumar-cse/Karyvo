import { describe, expect, it } from "vitest";
import { isAuthPage, isProtectedPath, safeNextPath } from "@/lib/auth/config";

describe("safeNextPath (open-redirect protection)", () => {
  it("keeps normal relative paths", () => {
    expect(safeNextPath("/resume")).toBe("/resume");
    expect(safeNextPath("/ats?tab=history")).toBe("/ats?tab=history");
  });

  it.each([
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "javascript:alert(1)",
    "evil.com",
    "/ok\nHeader: x",
  ])("rejects %j", (bad) => {
    expect(safeNextPath(bad)).toBe("/dashboard");
  });

  it("falls back when empty or null", () => {
    expect(safeNextPath(null)).toBe("/dashboard");
    expect(safeNextPath(undefined)).toBe("/dashboard");
    expect(safeNextPath("")).toBe("/dashboard");
  });
});

describe("route classification", () => {
  it("protects private pages and their sub-routes", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/resume/123")).toBe(true);
    expect(isProtectedPath("/interview")).toBe(true);
  });

  it("keeps marketing and auth pages public", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/pricing")).toBe(false);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/dashboardx")).toBe(false);
  });

  it("recognises login/signup pages", () => {
    expect(isAuthPage("/login")).toBe(true);
    expect(isAuthPage("/signup")).toBe(true);
    expect(isAuthPage("/reset-password")).toBe(false);
  });
});
