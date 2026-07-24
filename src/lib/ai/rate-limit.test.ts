import { afterEach, describe, expect, it, vi } from "vitest";
import { checkAndRecordAiUsage } from "@/lib/ai/rate-limit";

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock("@/lib/supabase/service-role", () => ({
  createServiceRoleClient: () => ({ from: mockFrom }),
}));

function countQuery(count: number, error: unknown = null) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    gte: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.gte.mockResolvedValue({ count, error });
  return query;
}

function insertQuery(error: unknown = null) {
  return { insert: vi.fn().mockResolvedValue({ error }) };
}

describe("checkAndRecordAiUsage — signed-in users", () => {
  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.AI_DAILY_USER_LIMIT;
  });

  it("allows and records usage under the daily limit", async () => {
    process.env.AI_DAILY_USER_LIMIT = "5";
    const count = countQuery(2);
    const insert = insertQuery();
    mockFrom.mockReturnValueOnce(count).mockReturnValueOnce(insert);

    const result = await checkAndRecordAiUsage({ userId: "user-1" }, "ai_interview");

    expect(result.allowed).toBe(true);
    expect(insert.insert).toHaveBeenCalledWith({ user_id: "user-1", feature_name: "ai_interview" });
  });

  it("denies at the configured daily limit without recording another event", async () => {
    process.env.AI_DAILY_USER_LIMIT = "5";
    const count = countQuery(5);
    mockFrom.mockReturnValueOnce(count);

    const result = await checkAndRecordAiUsage({ userId: "user-1" }, "ai_interview");

    expect(result.allowed).toBe(false);
    expect(mockFrom).toHaveBeenCalledTimes(1); // count only — no insert call
  });

  it("denies just below vs. right at the boundary correctly", async () => {
    process.env.AI_DAILY_USER_LIMIT = "3";
    const belowLimit = countQuery(2);
    const insert = insertQuery();
    mockFrom.mockReturnValueOnce(belowLimit).mockReturnValueOnce(insert);
    expect((await checkAndRecordAiUsage({ userId: "user-1" }, "ai_interview")).allowed).toBe(true);

    vi.clearAllMocks();
    const atLimit = countQuery(3);
    mockFrom.mockReturnValueOnce(atLimit);
    expect((await checkAndRecordAiUsage({ userId: "user-1" }, "ai_interview")).allowed).toBe(false);
  });

  it("fails closed when the count query errors", async () => {
    const count = countQuery(0, { message: "db unreachable" });
    mockFrom.mockReturnValueOnce(count);

    const result = await checkAndRecordAiUsage({ userId: "user-1" }, "ai_interview");

    expect(result.allowed).toBe(false);
  });

  it("falls back to a safe default limit when AI_DAILY_USER_LIMIT is unset", async () => {
    const count = countQuery(0);
    const insert = insertQuery();
    mockFrom.mockReturnValueOnce(count).mockReturnValueOnce(insert);

    const result = await checkAndRecordAiUsage({ userId: "user-1" }, "ai_interview");

    expect(result.allowed).toBe(true);
  });
});

describe("checkAndRecordAiUsage — anonymous guests", () => {
  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.AI_DAILY_GUEST_LIMIT;
  });

  it("is metered separately from signed-in users, keyed by anonymous_session_hash", async () => {
    process.env.AI_DAILY_GUEST_LIMIT = "5";
    const count = countQuery(2);
    const insert = insertQuery();
    mockFrom.mockReturnValueOnce(count).mockReturnValueOnce(insert);

    const result = await checkAndRecordAiUsage(
      { anonymousHash: "hash-abc" },
      "ai_gift_assistant",
    );

    expect(result.allowed).toBe(true);
    expect(count.eq).toHaveBeenCalledWith("anonymous_session_hash", "hash-abc");
    expect(insert.insert).toHaveBeenCalledWith({
      anonymous_session_hash: "hash-abc",
      feature_name: "ai_gift_assistant",
    });
  });

  it("denies a guest at the configured guest limit", async () => {
    process.env.AI_DAILY_GUEST_LIMIT = "2";
    const count = countQuery(2);
    mockFrom.mockReturnValueOnce(count);

    const result = await checkAndRecordAiUsage({ anonymousHash: "hash-abc" }, "ai_gift_assistant");

    expect(result.allowed).toBe(false);
  });

  it("uses a tighter default guest limit than the signed-in default", async () => {
    const count = countQuery(25); // over a reasonable guest default, under the signed-in default
    mockFrom.mockReturnValueOnce(count);

    const result = await checkAndRecordAiUsage({ anonymousHash: "hash-abc" }, "ai_gift_assistant");

    expect(result.allowed).toBe(false);
  });
});
