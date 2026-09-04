import { describe, expect, it } from "vitest";
import { contentHref } from "@/lib/recruit-content/links";
import { getRecruitContent } from "@/lib/recruit-content/source";
import type { RecruitReference } from "@/lib/recruit-content/types";

const ALLOWED_EXACT_ROUTES = new Set([
  "/workflow",
  "/backlog/adaptation",
  "/interview-analysis",
  "/offer-center",
  "/tools",
]);

function isKnownProductRoute(href: string): boolean {
  return ALLOWED_EXACT_ROUTES.has(href) || href.startsWith("/materials/");
}

function collectReferences(): RecruitReference[] {
  const snapshot = getRecruitContent();
  return [
    ...snapshot.workflow.flatMap((step) => [step.primary, ...step.related]),
    ...snapshot.articles.flatMap((article) => (article.related ?? []).map((id) => ({ kind: "article" as const, id }))),
    ...snapshot.scenarios.flatMap((scenario) => [
      ...(scenario.scripts ?? []).map((id) => ({ kind: "script" as const, id })),
      ...(scenario.templates ?? []).map((id) => ({ kind: "template" as const, id })),
    ]),
    ...snapshot.tools.map((tool) => ({ kind: "tool" as const, id: tool.id })),
    ...snapshot.templates.map((template) => ({ kind: "template" as const, id: template.id })),
    ...snapshot.checklists.map((checklist) => ({ kind: "checklist" as const, id: checklist.id })),
  ];
}

describe("Recruit link integrity", () => {
  it("keeps every content-derived CTA on a known product route family", () => {
    const hrefs = collectReferences().map(contentHref);

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).toMatch(/^\//);
      expect(href).not.toContain("undefined");
      expect(href).not.toContain("null");
      expect(isKnownProductRoute(href)).toBe(true);
    }
  });

  it("keeps the only approved helper routes explicit", () => {
    expect(contentHref({ kind: "tool", id: "candidate-interview-analyzer" })).toBe("/interview-analysis");
    expect(contentHref({ kind: "tool", id: "offer-builder" })).toBe("/offer-center");
  });
});
