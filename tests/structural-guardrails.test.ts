import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * CLAUDE.md non-negotiable rule: "Do not create vacancy lists, candidate lists,
 * candidate cards, or a duplicate funnel in the portal." These tests scan the
 * actual source tree so a future addition trips a red test, not just a review
 * comment.
 */

const SRC_DIR = join(__dirname, "..", "src");

const FORBIDDEN_PATTERNS = [
  /candidate\s*list/i,
  /vacancy\s*list/i,
  /candidatecard/i,
  /vacancycard/i,
  /\bfunnelboard\b/i,
  /\bkanbanboard\b/i,
  /pipeline\s*board/i,
];

const FORBIDDEN_ADAPTER_METHODS = ["listVacancies", "listCandidates", "getVacancies", "getCandidates"];

/** Strips comments so doc-comments that *describe* the rule don't trip the rule itself. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...walk(full));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

describe("structural guardrails: no duplicate ATS screens", () => {
  const files = walk(SRC_DIR);

  it("scans at least the expected number of source files", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it("contains no candidate/vacancy list, card, or funnel/kanban components", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const content = stripComments(readFileSync(file, "utf-8"));
      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(content)) offenders.push(`${file}: matched ${pattern}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("the Huntflow adapter interface exposes only single-object lookups, never a list method", () => {
    const typesFile = stripComments(readFileSync(join(SRC_DIR, "lib/adapters/types.ts"), "utf-8"));
    for (const method of FORBIDDEN_ADAPTER_METHODS) {
      expect(typesFile.includes(method), `types.ts should not declare ${method}`).toBe(false);
    }
    expect(typesFile).toMatch(/getVacancyRef\(externalId: string\): Promise<HuntflowVacancyRef \| null>/);
    expect(typesFile).toMatch(/getCandidateRef\(externalId: string\): Promise<HuntflowCandidateRef \| null>/);
  });

  it("the home area never renders a standalone vacancy/candidate list widget", () => {
    const recruiterHome = readFileSync(join(SRC_DIR, "components/home/RecruiterHome.tsx"), "utf-8");
    const leadHome = readFileSync(join(SRC_DIR, "components/home/LeadHome.tsx"), "utf-8");
    for (const content of [recruiterHome, leadHome]) {
      expect(content).not.toMatch(/vacancies\.map|candidates\.map/i);
    }
  });

  it("workflow detail stays inside the current Recruit IA and visual system", () => {
    const detail = readFileSync(join(SRC_DIR, "components/workflow/StageDetail.tsx"), "utf-8");
    const route = readFileSync(join(SRC_DIR, "app/(workspace)/workflow/[stage]/page.tsx"), "utf-8");

    expect(detail).not.toContain("@/lib/knowledge-base/data");
    expect(detail).not.toContain("/knowledge-base/");
    expect(detail).toContain('className="rr-detail-hero"');
    expect(detail).toContain('className="rr-panel"');
    expect(detail).toContain('href="/workflow"');
    expect(detail).toContain('href="/search"');
    expect(route).toContain('{ label: "Главная", href: "/" }');
    expect(route).not.toContain('{ label: "Моя работа", href: "/" }');
  });

  it("legacy knowledge-base routes redirect into the current Recruit IA", () => {
    const indexRoute = readFileSync(join(SRC_DIR, "app/(workspace)/knowledge-base/page.tsx"), "utf-8");
    const itemRoute = readFileSync(join(SRC_DIR, "app/(workspace)/knowledge-base/[id]/page.tsx"), "utf-8");

    expect(indexRoute).toContain('redirect("/scenarios")');
    expect(itemRoute).toContain("referenceForId(getRecruitContent(), id)");
    expect(itemRoute).toContain('redirect(reference ? contentHref(reference) : "/scenarios")');
    expect(itemRoute).not.toContain("KnowledgeItemDetail");
    expect(itemRoute).not.toContain("@/lib/knowledge-base/data");
  });

  it("direct adaptation workflow access stays in the explicit backlog", () => {
    const route = readFileSync(join(SRC_DIR, "app/(workspace)/workflow/[stage]/page.tsx"), "utf-8");
    expect(route).toContain('if (stage.id === "adaptation") redirect("/backlog/adaptation")');
  });
});
