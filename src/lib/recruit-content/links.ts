import type { RecruitContentKind, RecruitReference } from "./types";

export const RECRUIT_KIND_LABELS: Record<RecruitContentKind, string> = {
  playbook: "Рабочая ситуация",
  article: "Инструкция",
  script: "Скрипт",
  template: "Шаблон",
  checklist: "Чек-лист",
  tool: "Помощник",
};

export function contentHref(reference: RecruitReference): string {
  if (reference.kind === "tool") {
    if (reference.id === "candidate-interview-analyzer") return "/interview-analysis";
    if (reference.id === "offer-builder") return "/offer-center";
    return "/tools";
  }
  if (reference.kind === "page") {
    if (reference.id === "adaptation") return "/backlog/adaptation";
    if (reference.id === "process") return "/workflow";
    return `/${reference.id}`;
  }
  return `/materials/${reference.kind}/${reference.id}`;
}
