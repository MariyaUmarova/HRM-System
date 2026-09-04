import { describe, expect, it } from "vitest";
import { getRecruitContent } from "@/lib/recruit-content/source";
import { contentHref } from "@/lib/recruit-content/links";
import type { RecruitReference } from "@/lib/recruit-content/types";

const STATIC_DESTINATIONS = new Set([
  "/backlog/adaptation",
  "/workflow",
  "/tools",
  "/interview-analysis",
  "/offer-center",
]);

function isSupportedDestination(reference: RecruitReference): boolean {
  const href = contentHref(reference);
  if (STATIC_DESTINATIONS.has(href)) return true;
  if (reference.kind === "page") return false;
  return href === `/materials/${reference.kind}/${reference.id}`;
}

describe("Recruit CTA routing", () => {
  it("keeps every workflow CTA on a supported product destination", () => {
    const { workflow } = getRecruitContent();
    const references = workflow.flatMap((step) => [step.primary, ...step.related]);

    for (const reference of references) {
      expect(isSupportedDestination(reference), `${reference.kind}:${reference.id} -> ${contentHref(reference)}`).toBe(true);
    }
  });

  it("keeps every approved helper CTA on its working HRM implementation", () => {
    const { tools } = getRecruitContent();
    expect(tools.map((tool) => [tool.id, contentHref({ kind: "tool", id: tool.id })])).toEqual([
      ["candidate-interview-analyzer", "/interview-analysis"],
      ["offer-builder", "/offer-center"],
    ]);
  });

  it("does not silently route unknown helpers back into the approved catalog", () => {
    expect(contentHref({ kind: "tool", id: "legacy-constructor" })).toBe("/tools");
    expect(getRecruitContent().tools.some((tool) => tool.id === "legacy-constructor")).toBe(false);
  });
});
