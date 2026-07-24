import { describe, expect, it } from "vitest";
import { mergeChipList } from "@/lib/interview/apply-updates";

describe("mergeChipList", () => {
  it("appends new items after existing ones", () => {
    expect(mergeChipList(["hiking"], ["board games"])).toEqual(["hiking", "board games"]);
  });

  it("de-duplicates case-insensitively, keeping the original casing", () => {
    expect(mergeChipList(["Hiking"], ["hiking", "Board Games"])).toEqual([
      "Hiking",
      "Board Games",
    ]);
  });

  it("trims whitespace and drops blank entries", () => {
    expect(mergeChipList([], ["  reading  ", "   ", ""])).toEqual(["reading"]);
  });

  it("caps the merged list at 60 items", () => {
    const existing = Array.from({ length: 58 }, (_, i) => `existing-${i}`);
    const incoming = ["new-1", "new-2", "new-3", "new-4"];
    const merged = mergeChipList(existing, incoming);
    expect(merged).toHaveLength(60);
    expect(merged.slice(-2)).toEqual(["new-1", "new-2"]);
  });
});
