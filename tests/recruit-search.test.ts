import { describe, expect, it } from "vitest";
import { searchRecruitContent } from "@/lib/recruit-content/search";

describe("Recruit global search", () => {
  it("finds approved workflow stages and links directly to stage detail", () => {
    const results = searchRecruitContent("Провожу бриф");
    const stage = results.find((item) => item.kind === "workflow" && item.id === "briefing");

    expect(stage).toBeDefined();
    expect(stage?.title).toBe("Провожу бриф");
    expect(stage?.meta).toBe("Этап 2");
    expect(stage?.href).toBe("/workflow/briefing");
  });

  it("keeps approved helpers searchable alongside workflow stages", () => {
    const results = searchRecruitContent("анализ интервью");

    expect(results.some((item) => item.kind === "tool" && item.href === "/interview-analysis")).toBe(true);
    expect(results.some((item) => item.kind === "workflow" && item.id === "hr-interview")).toBe(true);
  });

  it("keeps adaptation search results in backlog", () => {
    const result = searchRecruitContent("Сопровождаю адаптацию").find(
      (item) => item.kind === "workflow" && item.id === "adaptation",
    );

    expect(result?.href).toBe("/backlog/adaptation");
    expect(result?.meta).toBe("В бэклоге");
  });

  it("does not index hidden adaptation content while the vertical is backlog", () => {
    const results = searchRecruitContent("контрольные точки первой недели");
    expect(results.some((item) => item.kind === "workflow" && item.id === "adaptation")).toBe(false);
  });

  it("does not index the removed sourcing helper wording", () => {
    const results = searchRecruitContent("AI-помощник по поиску");
    expect(results.some((item) => item.kind === "workflow" && item.id === "sourcing")).toBe(false);
  });
});
