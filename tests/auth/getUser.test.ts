import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const serverGetUser = vi.fn();
const bearerGetUser = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({ auth: { getUser: serverGetUser } }),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ auth: { getUser: bearerGetUser } }),
}));

const env = { ...process.env };

function setSupabaseEnv() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
}

async function load() {
  return await import("@/lib/auth/getUser");
}

beforeEach(() => {
  vi.resetModules();
  serverGetUser.mockReset();
  bearerGetUser.mockReset();
  process.env = { ...env };
  delete process.env.DEMO_MODE;
  setSupabaseEnv();
});

afterEach(() => {
  process.env = { ...env };
});

describe("getUser (API routes)", () => {
  it("returns the verified user from the session cookie", async () => {
    serverGetUser.mockResolvedValue({ data: { user: { id: "u-1", email: "a@b.com" } }, error: null });
    const { getUser } = await load();
    await expect(getUser(new Request("http://x/api"))).resolves.toEqual({ userId: "u-1", email: "a@b.com" });
  });

  it("throws AuthError when there is no session (no shared guest user)", async () => {
    serverGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no session" } });
    const { getUser, AuthError } = await load();
    await expect(getUser(new Request("http://x/api"))).rejects.toBeInstanceOf(AuthError);
  });

  it("verifies Bearer tokens with Supabase", async () => {
    bearerGetUser.mockResolvedValue({ data: { user: { id: "u-2", email: "c@d.com" } }, error: null });
    const { getUser } = await load();
    const req = new Request("http://x/api", { headers: { authorization: "Bearer good-token" } });
    await expect(getUser(req)).resolves.toEqual({ userId: "u-2", email: "c@d.com" });
    expect(bearerGetUser).toHaveBeenCalledWith("good-token");
  });

  it("rejects an invalid or expired Bearer token", async () => {
    bearerGetUser.mockResolvedValue({ data: { user: null }, error: { message: "jwt expired" } });
    const { getUser, AuthError } = await load();
    const req = new Request("http://x/api", { headers: { authorization: "Bearer bad" } });
    await expect(getUser(req)).rejects.toBeInstanceOf(AuthError);
  });

  it("ignores the old x-user-id header and never trusts raw tokens as ids", async () => {
    serverGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no session" } });
    const { getUser, AuthError } = await load();
    const req = new Request("http://x/api", { headers: { "x-user-id": "victim-id" } });
    await expect(getUser(req)).rejects.toBeInstanceOf(AuthError);
  });

  it("fails closed when Supabase is not configured (even outside production)", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const { getUser, AuthError } = await load();
    await expect(getUser(new Request("http://x/api"))).rejects.toBeInstanceOf(AuthError);
  });

  it("demo mode is only honoured when explicitly enabled and never in production", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.DEMO_MODE = "true";
    (process.env as Record<string, string>).NODE_ENV = "production";
    let mod = await load();
    await expect(mod.getUser(new Request("http://x/api"))).rejects.toBeInstanceOf(mod.AuthError);

    vi.resetModules();
    (process.env as Record<string, string>).NODE_ENV = "development";
    mod = await load();
    await expect(mod.getUser(new Request("http://x/api"))).resolves.toMatchObject({ email: "demo@karyvo.local" });
  });
});

describe("server page helpers", () => {
  it("getServerUserId returns null when signed out", async () => {
    serverGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const { getServerUserId } = await load();
    await expect(getServerUserId()).resolves.toBeNull();
  });

  it("requireServerUserId redirects signed-out visitors to /login with next", async () => {
    serverGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const { requireServerUserId } = await load();
    await expect(requireServerUserId("/resume")).rejects.toThrow("NEXT_REDIRECT:/login?next=%2Fresume");
  });

  it("requireServerUserId returns the id for a signed-in user", async () => {
    serverGetUser.mockResolvedValue({ data: { user: { id: "u-9" } }, error: null });
    const { requireServerUserId } = await load();
    await expect(requireServerUserId("/resume")).resolves.toBe("u-9");
  });
});
