import { KNOWLEDGE_ITEMS } from "./data";
import type { KnowledgeItem, KnowledgeKind } from "./types";

/** Synonym groups so "оффер" / "offer" / "предложение" resolve to the same query. */
const SYNONYM_GROUPS: string[][] = [
  ["оффер", "offer", "предложение"],
  ["вакансия", "позиция", "роль"],
  ["интервью", "собеседование"],
  ["кандидат", "соискатель"],
  ["чек-лист", "чеклист", "checklist"],
  ["адаптация", "онбординг", "onboarding"],
  ["резюме", "cv"],
  ["заказчик", "менеджер", "нанимающий менеджер"],
];

function expandWithSynonyms(term: string): string[] {
  const lower = term.toLowerCase();
  const group = SYNONYM_GROUPS.find((g) => g.includes(lower));
  return group ? group : [lower];
}

/** Simple Levenshtein distance for typo tolerance on short words. */
function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function fuzzyIncludes(haystack: string, needle: string): boolean {
  const words = haystack.toLowerCase().split(/[\s,.;:()«»"'—-]+/).filter(Boolean);
  if (haystack.toLowerCase().includes(needle)) return true;
  return words.some((w) => w.length > 3 && needle.length > 3 && levenshtein(w, needle) <= 1);
}

export interface SearchResultGroup {
  kind: KnowledgeKind;
  items: KnowledgeItem[];
}

export interface SearchResult {
  query: string;
  groups: SearchResultGroup[];
  totalCount: number;
  suggestions: string[];
}

export function searchKnowledgeBase(rawQuery: string): SearchResult {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return { query: rawQuery, groups: [], totalCount: 0, suggestions: [] };
  }

  const terms = expandWithSynonyms(query);

  const matches = KNOWLEDGE_ITEMS.filter((item) => {
    const haystacks = [item.title, item.summary, item.category, ...item.tags];
    return terms.some((term) => haystacks.some((h) => fuzzyIncludes(h, term)));
  });

  const byKind = new Map<KnowledgeKind, KnowledgeItem[]>();
  for (const item of matches) {
    const list = byKind.get(item.kind) ?? [];
    list.push(item);
    byKind.set(item.kind, list);
  }

  const groups: SearchResultGroup[] = Array.from(byKind.entries()).map(([kind, items]) => ({ kind, items }));

  const suggestions =
    matches.length === 0
      ? Array.from(new Set(KNOWLEDGE_ITEMS.flatMap((i) => i.tags))).filter((tag) => tag.startsWith(query[0] ?? "")).slice(0, 5)
      : [];

  return { query: rawQuery, groups, totalCount: matches.length, suggestions };
}
