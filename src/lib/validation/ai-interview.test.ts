import { describe, expect, it } from "vitest";
import {
  giftSuggestionSchema,
  interviewExtractionSchema,
  interviewTurnSchema,
} from "@/lib/validation/ai-interview";

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

describe("giftSuggestionSchema", () => {
  it("accepts a suggestion with just a name", () => {
    expect(giftSuggestionSchema.safeParse({ name: "A cold brew maker" }).success).toBe(true);
  });

  it("accepts a fully specified suggestion", () => {
    const result = giftSuggestionSchema.safeParse({
      name: "A Nintendo Switch carrying case",
      description: "They mentioned loving their Switch.",
      category: "Tech",
      budgetLevel: "25_to_75",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing name", () => {
    expect(giftSuggestionSchema.safeParse({ description: "no name here" }).success).toBe(false);
  });

  it("rejects an invalid budgetLevel (no fabricated price tiers)", () => {
    const result = giftSuggestionSchema.safeParse({
      name: "A gift card",
      budgetLevel: "one million dollars",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown fields (e.g. a fabricated product link/price)", () => {
    const result = giftSuggestionSchema.safeParse({
      name: "A gift card",
      productUrl: "https://example.com/product/123",
      price: 49.99,
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

  it("accepts a turn with both an extraction and a gift suggestion", () => {
    const result = interviewTurnSchema.safeParse({
      message: "Nintendo Switch fan, noted! What colors do you like?",
      topic: "tech and gaming",
      isComplete: false,
      completionPercentage: 40,
      extractedFields: { techAndGaming: ["Nintendo Switch"] },
      giftSuggestion: { name: "A Nintendo Switch carrying case", category: "Tech" },
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
