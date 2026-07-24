import { describe, expect, it } from "vitest";
import { interviewExtractionSchema, interviewTurnSchema } from "@/lib/validation/ai-interview";

describe("interviewExtractionSchema", () => {
  it("accepts a fully empty object", () => {
    expect(interviewExtractionSchema.safeParse({}).success).toBe(true);
  });

  it("accepts the known optional fields", () => {
    const result = interviewExtractionSchema.safeParse({
      interests: ["hiking", "board games"],
      sizes: { shirt: "M" },
      introduction: "I love cozy weekends.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown fields (no address/phone/financial data can be smuggled in)", () => {
    const result = interviewExtractionSchema.safeParse({
      interests: ["reading"],
      phoneNumber: "555-1234",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a chip list over the size cap", () => {
    const result = interviewExtractionSchema.safeParse({
      interests: Array.from({ length: 21 }, (_, i) => `item-${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown keys inside sizes", () => {
    const result = interviewExtractionSchema.safeParse({
      sizes: { shirt: "M", homeAddress: "123 Main St" },
    });
    expect(result.success).toBe(false);
  });
});

describe("interviewTurnSchema", () => {
  it("accepts a well-formed turn", () => {
    const result = interviewTurnSchema.safeParse({
      message: "What are your favorite colors?",
      topic: "favorite colors",
      isComplete: false,
      completionPercentage: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a completionPercentage out of range", () => {
    const result = interviewTurnSchema.safeParse({
      message: "Hi",
      topic: "intro",
      isComplete: false,
      completionPercentage: 150,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a response missing a required field", () => {
    const result = interviewTurnSchema.safeParse({
      topic: "intro",
      isComplete: false,
      completionPercentage: 0,
    });
    expect(result.success).toBe(false);
  });
});
