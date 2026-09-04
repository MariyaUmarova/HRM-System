import type {
  RecruitContentSnapshot,
  RecruitReference,
} from "./types";

export type RecruitCatalogItem =
  | RecruitContentSnapshot["articles"][number]
  | RecruitContentSnapshot["scenarios"][number]
  | RecruitContentSnapshot["scripts"][number]
  | RecruitContentSnapshot["templates"][number]
  | RecruitContentSnapshot["checklists"][number]
  | RecruitContentSnapshot["tools"][number];

export function findRecruitItem(
  snapshot: RecruitContentSnapshot,
  reference: RecruitReference,
): RecruitCatalogItem | null {
  if (reference.kind === "page") return null;
  const collection =
    reference.kind === "article"
      ? snapshot.articles
      : reference.kind === "playbook"
        ? snapshot.scenarios
        : reference.kind === "script"
          ? snapshot.scripts
          : reference.kind === "template"
            ? snapshot.templates
            : reference.kind === "checklist"
              ? snapshot.checklists
              : snapshot.tools;
  return collection.find((item) => item.id === reference.id) ?? null;
}

export function referenceForId(snapshot: RecruitContentSnapshot, id: string): RecruitReference | null {
  if (snapshot.scenarios.some((item) => item.id === id)) return { kind: "playbook", id };
  if (snapshot.articles.some((item) => item.id === id)) return { kind: "article", id };
  if (snapshot.scripts.some((item) => item.id === id)) return { kind: "script", id };
  if (snapshot.templates.some((item) => item.id === id)) return { kind: "template", id };
  if (snapshot.checklists.some((item) => item.id === id)) return { kind: "checklist", id };
  if (snapshot.tools.some((item) => item.id === id)) return { kind: "tool", id };
  return null;
}

export function referenceIsAvailable(
  snapshot: RecruitContentSnapshot,
  reference: RecruitReference,
): boolean {
  if (reference.kind === "page") return reference.id === "process" || reference.id === "adaptation";
  return Boolean(findRecruitItem(snapshot, reference));
}

export function routePrimaryReference(
  snapshot: RecruitContentSnapshot,
  step: RecruitContentSnapshot["workflow"][number],
): RecruitReference {
  if (step.title.toLocaleLowerCase("ru-RU").includes("адаптац")) {
    return { kind: "page", id: "adaptation", label: "В бэклоге" };
  }
  if (referenceIsAvailable(snapshot, step.primary)) return step.primary;
  return step.related.find((reference) => referenceIsAvailable(snapshot, reference)) ?? {
    kind: "page",
    id: "process",
  };
}
