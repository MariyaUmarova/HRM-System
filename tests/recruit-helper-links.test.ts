import { describe, expect, it } from "vitest";
import { contentHref } from "@/lib/recruit-content/links";

 describe("Recruit helper links", () => {
  it("routes interview analysis to the existing working page", () => {
    expect(contentHref({ kind: "tool", id: "candidate-interview-analyzer" })).toBe("/interview-analysis");
  });

  it("routes offer builder to the existing working page", () => {
    expect(contentHref({ kind: "tool", id: "offer-builder" })).toBe("/offer-center");
  });
});
