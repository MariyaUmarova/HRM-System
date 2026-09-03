import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import type {
  RecruitArticle,
  RecruitChecklist,
  RecruitContentSnapshot,
  RecruitScenario,
  RecruitScript,
  RecruitTemplate,
  RecruitTool,
  WorkflowRouteStep,
} from "./types";

/**
 * Content authority for the Recruit experience.
 *
 * Do not rewrite or "improve" text here. The standalone HTML is intentionally
 * parsed as the source so wording, playbooks, scripts and checklists stay verbatim.
 * Product-only filtering below removes sections explicitly excluded from the HR Hub IA.
 */
export const RECRUIT_SOURCE_RELATIVE_PATH =
  "docs/references/v7_4/ivideon-recruit-standalone-v7_4.html";

let cachedSnapshot: RecruitContentSnapshot | null = null;
let cachedHtml: string | null = null;

function sourceHtml(): string {
  if (cachedHtml) return cachedHtml;
  const file = path.join(process.cwd(), RECRUIT_SOURCE_RELATIVE_PATH);
  cachedHtml = fs.readFileSync(file, "utf8");
  return cachedHtml;
}

function balancedExpression(text: string, start: number, open: string, close: string): string {
  let depth = 0;
  let quote: "'" | '"' | "`" | null = null;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }
    if (char === open) depth += 1;
    if (char === close) {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }

  throw new Error(`Unable to parse Recruit source expression starting at ${start}`);
}

function extractWindowArray<T>(name: string): T[] {
  const html = sourceHtml();
  const marker = `window.${name}`;
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Recruit source is missing ${marker}`);
  const start = html.indexOf("[", markerIndex);
  if (start < 0) throw new Error(`Recruit source ${marker} has no array payload`);
  return JSON.parse(balancedExpression(html, start, "[", "]")) as T[];
}

const APPROVED_WORKFLOW_ORDER = [
  "Получена новая вакансия",
  "Провожу бриф",
  "Ищу кандидатов",
  "Провожу HR-интервью",
  "Показываю кандидата заказчику",
  "Провожу совместное интервью с заказчиком",
  "Согласовываю оффер",
  "Делаю оффер кандидату",
  "Готовлю выход сотрудника",
  "Сопровождаю адаптацию",
] as const;

function extractWorkflow(): WorkflowRouteStep[] {
  const html = sourceHtml();
  const marker = "const WORKFLOW_ROUTE =";
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) throw new Error("Recruit source is missing WORKFLOW_ROUTE");
  const start = html.indexOf("[", markerIndex);
  if (start < 0) throw new Error("Recruit source WORKFLOW_ROUTE has no array payload");
  const expression = balancedExpression(html, start, "[", "]");

  // The repository-owned HTML is trusted, read-only product source. vm is used only
  // because WORKFLOW_ROUTE is a JS literal (single quotes), unlike the JSON arrays.
  const source = vm.runInNewContext(`(${expression})`, Object.create(null), {
    timeout: 1_000,
  }) as WorkflowRouteStep[];

  const byTitle = new Map(source.map((step) => [step.title, step]));
  return APPROVED_WORKFLOW_ORDER.map((title, index) => {
    const step = byTitle.get(title);
    if (!step) throw new Error(`Recruit source is missing approved workflow stage: ${title}`);
    return { ...step, n: String(index + 1).padStart(2, "0") };
  });
}

const ADAPTATION_SCENARIO_IDS = new Set(["first-day", "adaptation-risk"]);
const ADAPTATION_SCRIPT_IDS = new Set([
  "adaptation-checkin",
  "adaptation-risk-alignment",
  "newcomer-buddy-intro",
]);
const ADAPTATION_CHECKLIST_IDS = new Set(["first-day-checklist", "adaptation-risk-checklist"]);
const INCLUDED_TEMPLATE_IDS = new Set(["offer-template", "recruitment-request", "recruitment-source"]);
const INCLUDED_TOOL_IDS = new Set(["candidate-interview-analyzer", "offer-builder"]);

function sanitiseTemplate(template: RecruitTemplate): RecruitTemplate {
  // The Offer constructor is a working HR Hub helper, so the multi-megabyte data URI
  // from the old standalone prototype is deliberately not shipped into page payloads.
  const file = template.file?.startsWith("data:") ? undefined : template.file;
  return {
    ...template,
    file,
    previewImage: undefined,
    toolId: undefined,
    toolButtonLabel: undefined,
    toolFirst: undefined,
  };
}

export function getRecruitContent(): RecruitContentSnapshot {
  if (cachedSnapshot) return cachedSnapshot;

  const articles = extractWindowArray<RecruitArticle>("ARTICLES").filter(
    (item) => item.category !== "Адаптация",
  );
  const scenarios = extractWindowArray<RecruitScenario>("SCENARIOS").filter(
    (item) => item.category !== "Адаптация" && !ADAPTATION_SCENARIO_IDS.has(item.id),
  );
  const scripts = extractWindowArray<RecruitScript>("SCRIPTS").filter(
    (item) => item.category !== "Адаптация" && !ADAPTATION_SCRIPT_IDS.has(item.id),
  );
  const checklists = extractWindowArray<RecruitChecklist>("CHECKLISTS").filter(
    (item) => !ADAPTATION_CHECKLIST_IDS.has(item.id) && item.stage !== "Адаптация",
  );
  const templates = extractWindowArray<RecruitTemplate>("TEMPLATES")
    .filter((item) => INCLUDED_TEMPLATE_IDS.has(item.id))
    .map(sanitiseTemplate);
  const tools = extractWindowArray<RecruitTool>("TOOLS").filter((item) => INCLUDED_TOOL_IDS.has(item.id));

  cachedSnapshot = {
    workflow: extractWorkflow(),
    articles,
    scenarios,
    scripts,
    templates,
    checklists,
    tools,
  };
  return cachedSnapshot;
}

export function getRecruitSourceHtml(): string {
  return sourceHtml();
}
