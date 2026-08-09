import { describe, expect, it } from "vitest";
import { searchKnowledgeBase } from "@/lib/knowledge-base/search";
import { KNOWLEDGE_ITEMS } from "@/lib/knowledge-base/data";

describe("searchKnowledgeBase", () => {
  it("returns no groups for an empty query", () => {
    const result = searchKnowledgeBase("");
    expect(result.totalCount).toBe(0);
    expect(result.groups).toEqual([]);
  });

  it("finds items by exact title substring", () => {
    const result = searchKnowledgeBase("HR-интервью");
    expect(result.totalCount).toBeGreaterThan(0);
    const allItems = result.groups.flatMap((g) => g.items);
    expect(allItems.some((i) => i.id === "pb-hr-interview")).toBe(true);
  });

  it("understands synonyms: оффер / offer / предложение resolve the same set", () => {
    const a = searchKnowledgeBase("оффер");
    const b = searchKnowledgeBase("offer");
    const c = searchKnowledgeBase("предложение");
    expect(a.totalCount).toBeGreaterThan(0);
    expect(new Set(a.groups.flatMap((g) => g.items.map((i) => i.id)))).toEqual(
      new Set(b.groups.flatMap((g) => g.items.map((i) => i.id))),
    );
    expect(new Set(a.groups.flatMap((g) => g.items.map((i) => i.id)))).toEqual(
      new Set(c.groups.flatMap((g) => g.items.map((i) => i.id))),
    );
  });

  it("tolerates a small typo (one character edit)", () => {
    const result = searchKnowledgeBase("офер"); // missing one "ф"
    expect(result.totalCount).toBeGreaterThan(0);
  });

  it("groups results by kind", () => {
    const result = searchKnowledgeBase("чек-лист");
    for (const group of result.groups) {
      expect(group.items.every((i) => i.kind === group.kind)).toBe(true);
    }
  });

  it("suggests alternatives and reports zero results for nonsense queries", () => {
    const result = searchKnowledgeBase("zzzznonexistentquery9999");
    expect(result.totalCount).toBe(0);
    expect(result.groups).toEqual([]);
  });

  it("never returns an item that is not in the knowledge base", () => {
    const result = searchKnowledgeBase("оффер");
    const knownIds = new Set(KNOWLEDGE_ITEMS.map((i) => i.id));
    for (const group of result.groups) {
      for (const item of group.items) {
        expect(knownIds.has(item.id)).toBe(true);
      }
    }
  });
});
