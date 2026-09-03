export type RecruitContentKind = "playbook" | "article" | "script" | "template" | "checklist" | "tool";

export interface RecruitReference {
  kind: RecruitContentKind | "page";
  id: string;
  label?: string;
}

export interface WorkflowRouteStep {
  n: string;
  title: string;
  description: string;
  primary: RecruitReference;
  related: RecruitReference[];
}

export interface ArticleTable {
  headers?: string[];
  rows?: string[][];
}

export interface ArticleExample {
  title: string;
  text: string;
}

export interface ArticleSection {
  title: string;
  text?: string;
  bullets?: string[];
  callout?: { title?: string; text?: string };
  table?: ArticleTable;
  examples?: ArticleExample[];
}

export interface RecruitArticle {
  id: string;
  title: string;
  category?: string;
  type?: string;
  stage?: string;
  audience?: string[];
  summary?: string;
  sections: ArticleSection[];
  sourceFiles?: string[];
  sourceConfidence?: string;
  owner?: string;
  status?: string;
  version?: string;
  lastReviewed?: string;
  nextReview?: string;
  related?: string[];
}

export interface RecruitScenario {
  id: string;
  title: string;
  category?: string;
  type?: string;
  stage?: string;
  audience?: string[];
  scenario?: string;
  summary?: string;
  trigger?: string;
  firstActions?: string[];
  steps?: string[];
  checklist?: string[];
  scripts?: string[];
  templates?: string[];
  huntflowActions?: string[];
  sla?: string;
  escalation?: string;
  responsibleRole?: string;
  mistakes?: string[];
  completionCriteria?: string;
  sourceFiles?: string[];
  sourceConfidence?: string;
  owner?: string;
  status?: string;
  version?: string;
  lastReviewed?: string;
  nextReview?: string;
  related?: string[];
  expectedResult?: string;
  beforeYouStart?: string[];
  systemActions?: Record<string, string[]>;
  verification?: string[];
  recommendations?: string[];
  entryCondition?: string;
  participants?: string[];
  processEnd?: string;
}

export interface RecruitScript {
  id: string;
  title: string;
  category?: string;
  channel?: string;
  tone?: string;
  text: string;
  sourceFiles?: string[];
  sourceConfidence?: string;
  owner?: string;
  status?: string;
  version?: string;
  lastReviewed?: string;
  nextReview?: string;
  scenarioId?: string;
  related?: string[];
}

export interface RecruitChecklist {
  id: string;
  title: string;
  stage?: string;
  items: string[];
  owner?: string;
  status?: string;
  version?: string;
  lastReviewed?: string;
  nextReview?: string;
  sourceFiles?: string[];
  sourceConfidence?: string;
  related?: string[];
}

export interface RecruitTemplate {
  id: string;
  title: string;
  type?: string;
  description?: string;
  file?: string;
  previewImage?: string;
  downloadLabel?: string;
  downloadName?: string;
  articleId?: string;
  owner?: string;
  status?: string;
  toolId?: string;
  toolButtonLabel?: string;
  toolFirst?: boolean;
}

export interface RecruitTool {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  buttonLabel?: string;
  generator?: string;
}

export interface RecruitContentSnapshot {
  workflow: WorkflowRouteStep[];
  articles: RecruitArticle[];
  scenarios: RecruitScenario[];
  scripts: RecruitScript[];
  templates: RecruitTemplate[];
  checklists: RecruitChecklist[];
  tools: RecruitTool[];
}
