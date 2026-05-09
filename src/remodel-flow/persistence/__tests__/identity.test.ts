import { describe, it, expect, vi, beforeEach } from "vitest";

const getSession = vi.fn();
const signInAnonymously = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => getSession(...args),
      signInAnonymously: (...args: unknown[]) => signInAnonymously(...args),
    },
  },
}));

import { ensureIdentity } from "../identity";

describe("ensureIdentity", () => {
  beforeEach(() => {
    getSession.mockReset();
    signInAnonymously.mockReset();
  });

  it("returns the userId when a session exists", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { id: "user-123", is_anonymous: false } } },
    });

    const result = await ensureIdentity();

    expect(result).toEqual({ userId: "user-123", isAnonymous: false });
    expect(signInAnonymously).not.toHaveBeenCalled();
  });

  it("returns null userId when no session exists and never calls signInAnonymously", async () => {
    getSession.mockResolvedValue({ data: { session: null } });

    const result = await ensureIdentity();

    expect(result).toEqual({ userId: null, isAnonymous: false });
    expect(signInAnonymously).not.toHaveBeenCalled();
  });

  it("returns null userId on unexpected error without mutating auth state", async () => {
    getSession.mockRejectedValue(new Error("network down"));

    const result = await ensureIdentity();

    expect(result).toEqual({ userId: null, isAnonymous: false });
    expect(signInAnonymously).not.toHaveBeenCalled();
  });
});
