import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contentHref } from "@/lib/recruit-content/links";

function readWorkspacePage(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), "src/app/(workspace)", relativePath), "utf8");
}

describe("Recruit helper links", () => {
  it("routes interview analysis to the existing working page", () => {
    expect(contentHref({ kind: "tool", id: "candidate-interview-analyzer" })).toBe("/interview-analysis");
  });

  it("routes offer builder to the existing working page", () => {
    expect(contentHref({ kind: "tool", id: "offer-builder" })).toBe("/offer-center");
  });

  it("keeps the interview helper wired to InterviewAnalysisPrototype", () => {
    const page = readWorkspacePage("interview-analysis/page.tsx");
    expect(page).toContain('import { InterviewAnalysisPrototype } from "@/components/interview-analysis/InterviewAnalysisPrototype"');
    expect(page).toContain("<InterviewAnalysisPrototype />");
    expect(page).not.toContain("PlaceholderScreen");
  });

  it("keeps the offer helper wired to OfferCenterBuilder", () => {
    const page = readWorkspacePage("offer-center/page.tsx");
    expect(page).toContain('import { OfferCenterBuilder } from "@/components/offer-center/OfferCenterBuilder"');
    expect(page).toContain("<OfferCenterBuilder />");
    expect(page).not.toContain("PlaceholderScreen");
  });
});
