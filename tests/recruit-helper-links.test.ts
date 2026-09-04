import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contentHref } from "@/lib/recruit-content/links";
import { getRecruitContent } from "@/lib/recruit-content/source";

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

  it("keeps exactly the two Product Owner-approved helpers from the Recruit source", () => {
    const { tools } = getRecruitContent();
    expect(tools.map(({ id, title, buttonLabel }) => ({ id, title, buttonLabel }))).toEqual([
      {
        id: "candidate-interview-analyzer",
        title: "ИИ-анализ интервью",
        buttonLabel: "Проанализировать кандидата",
      },
      {
        id: "offer-builder",
        title: "Конструктор оффера",
        buttonLabel: "Создать оффер",
      },
    ]);
  });

  it("keeps the Helpers catalog source-facing without extra explanatory copy", () => {
    const page = readWorkspacePage("tools/page.tsx");
    expect(page).toContain("Сделать прямо сейчас");
    expect(page).toContain("Интерактивные помощники");
    expect(page).not.toContain("<strong>Важно:</strong>");
  });

  it("keeps the interview helper wired to the working local analyzer and advanced prototype", () => {
    const page = readWorkspacePage("interview-analysis/page.tsx");
    expect(page).toContain('import { LocalInterviewTextAnalyzer } from "@/components/interview-analysis/LocalInterviewTextAnalyzer"');
    expect(page).toContain("<LocalInterviewTextAnalyzer />");
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
