export type KnowledgeKind = "playbook" | "article" | "checklist" | "template" | "script" | "tool";

export const KNOWLEDGE_KIND_LABELS: Record<KnowledgeKind, string> = {
  playbook: "Плейбук",
  article: "Статья",
  checklist: "Чек-лист",
  template: "Шаблон",
  script: "Скрипт",
  tool: "Помощник",
};

export interface KnowledgeSection {
  heading: string;
  paragraphs: string[];
}

export interface KnowledgeItemBase {
  id: string;
  kind: KnowledgeKind;
  title: string;
  category: string;
  summary: string;
  tags: string[];
  owner: string;
  version: string;
  reviewedAt: string;
}

export interface ArticleItem extends KnowledgeItemBase {
  kind: "playbook" | "article";
  sections: KnowledgeSection[];
}

export interface ChecklistItem extends KnowledgeItemBase {
  kind: "checklist";
  points: string[];
}

export interface TemplateItem extends KnowledgeItemBase {
  kind: "template" | "script";
  content: string;
}

export interface ToolItem extends KnowledgeItemBase {
  kind: "tool";
  helperDescription: string;
  inputs: string[];
  mockNotice: string;
}

export type KnowledgeItem = ArticleItem | ChecklistItem | TemplateItem | ToolItem;
