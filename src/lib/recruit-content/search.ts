import { contentHref, RECRUIT_KIND_LABELS } from "./links";
import { getRecruitContent } from "./source";
import type { RecruitContentKind } from "./types";

export interface RecruitSearchResult {
  id: string;
  kind: RecruitContentKind;
  title: string;
  summary: string;
  meta: string;
  href: string;
  score: number;
}

function normalise(value: string): string {
  return value.toLocaleLowerCase("ru-RU").replaceAll("ё", "е").replace(/\s+/g, " ").trim();
}

function tokens(value: string): string[] {
  return normalise(value).split(/[^a-zа-я0-9]+/i).filter(Boolean);
}

function scoreText(query: string, title: string, haystack: string, kind: RecruitContentKind): number {
  const q = normalise(query);
  if (!q) return 0;
  const qTokens = tokens(q);
  const titleNormal = normalise(title);
  const titleTokens = tokens(titleNormal);
  const allTokens = tokens(haystack);
  let score = 0;

  if (titleNormal.includes(q)) score += 8;
  for (const token of qTokens) {
    if (titleTokens.some((candidate) => candidate === token || (token.length >= 4 && candidate.startsWith(token)))) {
      score += 2;
    }
    if (allTokens.some((candidate) => candidate === token || (token.length >= 4 && candidate.startsWith(token)))) {
      score += 1;
    }
  }
  if (kind === "playbook") score += 1;
  return score;
}

export function searchRecruitContent(query: string): RecruitSearchResult[] {
  const snapshot = getRecruitContent();
  const candidates: Array<Omit<RecruitSearchResult, "score"> & { haystack: string }> = [];

  for (const item of snapshot.scenarios) {
    candidates.push({
      id: item.id,
      kind: "playbook",
      title: item.title,
      summary: item.summary ?? "",
      meta: [item.category, item.stage].filter(Boolean).join(" · "),
      href: contentHref({ kind: "playbook", id: item.id }),
      haystack: JSON.stringify(item),
    });
  }
  for (const item of snapshot.articles) {
    candidates.push({
      id: item.id,
      kind: "article",
      title: item.title,
      summary: item.summary ?? "",
      meta: [item.category, item.type].filter(Boolean).join(" · "),
      href: contentHref({ kind: "article", id: item.id }),
      haystack: JSON.stringify(item),
    });
  }
  for (const item of snapshot.scripts) {
    candidates.push({
      id: item.id,
      kind: "script",
      title: item.title,
      summary: item.text,
      meta: [item.category, item.channel].filter(Boolean).join(" · "),
      href: contentHref({ kind: "script", id: item.id }),
      haystack: JSON.stringify(item),
    });
  }
  for (const item of snapshot.templates) {
    candidates.push({
      id: item.id,
      kind: "template",
      title: item.title,
      summary: item.description ?? "",
      meta: item.type ?? RECRUIT_KIND_LABELS.template,
      href: contentHref({ kind: "template", id: item.id }),
      haystack: JSON.stringify(item),
    });
  }
  for (const item of snapshot.checklists) {
    candidates.push({
      id: item.id,
      kind: "checklist",
      title: item.title,
      summary: item.items.slice(0, 3).join(" · "),
      meta: item.stage ?? RECRUIT_KIND_LABELS.checklist,
      href: contentHref({ kind: "checklist", id: item.id }),
      haystack: JSON.stringify(item),
    });
  }
  for (const item of snapshot.tools) {
    candidates.push({
      id: item.id,
      kind: "tool",
      title: item.title,
      summary: item.description ?? "",
      meta: RECRUIT_KIND_LABELS.tool,
      href: contentHref({ kind: "tool", id: item.id }),
      haystack: JSON.stringify(item),
    });
  }

  return candidates
    .map((item) => ({
      id: item.id,
      kind: item.kind,
      title: item.title,
      summary: item.summary,
      meta: item.meta,
      href: item.href,
      score: scoreText(query, item.title, item.haystack, item.kind),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "ru"))
    .slice(0, 20);
}
