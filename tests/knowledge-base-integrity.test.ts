import { describe, expect, it } from "vitest";
import { KNOWLEDGE_ITEMS, KNOWLEDGE_CATEGORIES } from "@/lib/knowledge-base/data";
import { WORKFLOW_STAGES } from "@/lib/workflow/stages";

describe("knowledge base integrity", () => {
  it("has unique ids across all kinds", () => {
    const ids = KNOWLEDGE_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every item belongs to a declared category", () => {
    for (const item of KNOWLEDGE_ITEMS) {
      expect((KNOWLEDGE_CATEGORIES as readonly string[]).includes(item.category), item.id).toBe(true);
    }
  });

  it("every workflow stage's related knowledge ids exist in the knowledge base", () => {
    const knownIds = new Set(KNOWLEDGE_ITEMS.map((i) => i.id));
    for (const stage of WORKFLOW_STAGES) {
      for (const relatedId of stage.relatedKnowledgeIds) {
        expect(knownIds.has(relatedId), `${stage.title} references missing id ${relatedId}`).toBe(true);
      }
    }
  });

  it("courses, tests, exams and learning progress are not part of the product (out of scope)", () => {
    const forbidden = ["course", "exam", "quiz", "learning progress", "курс", "экзамен", "тест "];
    for (const item of KNOWLEDGE_ITEMS) {
      const haystack = `${item.title} ${item.summary}`.toLowerCase();
      for (const term of forbidden) {
        expect(haystack.includes(term), `${item.id} mentions "${term}"`).toBe(false);
      }
    }
  });
});
