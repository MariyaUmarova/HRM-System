import fs from "node:fs";
import path from "node:path";
import {
  getUploadedRecruitOverrides,
  UPLOADED_RECRUIT_REMOVED_IDS,
} from "./uploaded-overrides";
import type {
  RecruitArticle,
  RecruitChecklist,
  RecruitContentSnapshot,
  RecruitReference,
  RecruitScenario,
  RecruitScript,
  RecruitTemplate,
  RecruitTool,
  WorkflowRouteStep,
} from "./types";

/**
 * Historical baseline for the Recruit experience.
 *
 * The Product Owner's 2026-09-03 attachment is the wording authority. A deterministic
 * comparison proved that 106 selected objects are identical to this v7.4 baseline;
 * the 21 objects that differ are replaced below by attachment-derived overrides and
 * three historical-only objects are removed. Do not rewrite or "improve" this copy.
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

const REFERENCE_KINDS = new Set<RecruitReference["kind"]>([
  "playbook",
  "article",
  "script",
  "template",
  "checklist",
  "tool",
  "page",
]);

function decodeSingleQuoted(value: string): string {
  let result = "";
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char !== "\\") {
      result += char;
      continue;
    }

    index += 1;
    const escaped = value[index];
    if (escaped === undefined) throw new Error("Invalid trailing escape in Recruit workflow string");
    if (escaped === "n") result += "\n";
    else if (escaped === "r") result += "\r";
    else if (escaped === "t") result += "\t";
    else if (escaped === "b") result += "\b";
    else if (escaped === "f") result += "\f";
    else if (escaped === "v") result += "\v";
    else if (escaped === "0") result += "\0";
    else if (escaped === "u") {
      const hex = value.slice(index + 1, index + 5);
      if (!/^[0-9a-fA-F]{4}$/.test(hex)) throw new Error("Invalid Unicode escape in Recruit workflow string");
      result += String.fromCharCode(Number.parseInt(hex, 16));
      index += 4;
    } else if (escaped === "x") {
      const hex = value.slice(index + 1, index + 3);
      if (!/^[0-9a-fA-F]{2}$/.test(hex)) throw new Error("Invalid hex escape in Recruit workflow string");
      result += String.fromCharCode(Number.parseInt(hex, 16));
      index += 2;
    } else {
      result += escaped;
    }
  }
  return result;
}

function quotedProperty(source: string, key: string, required = true): string | undefined {
  const pattern = new RegExp(`${key}\\s*:\\s*'((?:\\\\.|[^'])*)'`);
  const match = source.match(pattern);
  if (!match) {
    if (required) throw new Error(`Recruit workflow object is missing ${key}`);
    return undefined;
  }
  return decodeSingleQuoted(match[1]);
}

function topLevelObjects(arrayExpression: string): string[] {
  const objects: string[] = [];
  let index = 1;
  while (index < arrayExpression.length - 1) {
    if (arrayExpression[index] !== "{") {
      index += 1;
      continue;
    }
    const object = balancedExpression(arrayExpression, index, "{", "}");
    objects.push(object);
    index += object.length;
  }
  return objects;
}

function objectProperty(source: string, key: string): string {
  const marker = new RegExp(`${key}\\s*:`).exec(source);
  if (!marker) throw new Error(`Recruit workflow object is missing ${key}`);
  const start = source.indexOf("{", marker.index + marker[0].length);
  if (start < 0) throw new Error(`Recruit workflow ${key} has no object payload`);
  return balancedExpression(source, start, "{", "}");
}

function arrayProperty(source: string, key: string): string {
  const marker = new RegExp(`${key}\\s*:`).exec(source);
  if (!marker) throw new Error(`Recruit workflow object is missing ${key}`);
  const start = source.indexOf("[", marker.index + marker[0].length);
  if (start < 0) throw new Error(`Recruit workflow ${key} has no array payload`);
  return balancedExpression(source, start, "[", "]");
}

function parseReference(source: string): RecruitReference {
  const kindValue = quotedProperty(source, "kind");
  if (!kindValue || !REFERENCE_KINDS.has(kindValue as RecruitReference["kind"])) {
    throw new Error(`Unsupported Recruit workflow reference kind: ${kindValue ?? "missing"}`);
  }

  const id = quotedProperty(source, "id");
  if (!id) throw new Error("Recruit workflow reference is missing id");
  const label = quotedProperty(source, "label", false);
  return {
    kind: kindValue as RecruitReference["kind"],
    id,
    ...(label ? { label } : {}),
  };
}

function parseWorkflowStep(source: string): WorkflowRouteStep {
  const n = quotedProperty(source, "n");
  const title = quotedProperty(source, "title");
  const description = quotedProperty(source, "description");
  if (!n || !title || !description) throw new Error("Recruit workflow stage has incomplete metadata");

  const primary = parseReference(objectProperty(source, "primary"));
  const related = topLevelObjects(arrayProperty(source, "related")).map(parseReference);
  return { n, title, description, primary, related };
}

function extractWorkflow(): WorkflowRouteStep[] {
  const html = sourceHtml();
  const marker = "const WORKFLOW_ROUTE =";
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) throw new Error("Recruit source is missing WORKFLOW_ROUTE");
  const start = html.indexOf("[", markerIndex);
  if (start < 0) throw new Error("Recruit source WORKFLOW_ROUTE has no array payload");
  const expression = balancedExpression(html, start, "[", "]");
  const source = topLevelObjects(expression).map(parseWorkflowStep);

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
const EMPTY_IDS = new Set<string>();

function sanitiseTemplate(template: RecruitTemplate): RecruitTemplate {
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

function applyAttachmentDelta<T extends { id: string }>(
  baseline: T[],
  overrides: T[],
  removedIds: ReadonlySet<string> = EMPTY_IDS,
): T[] {
  const overridesById = new Map(overrides.map((item) => [item.id, item]));
  return baseline
    .filter((item) => !removedIds.has(item.id))
    .map((item) => overridesById.get(item.id) ?? item);
}

export function getRecruitContent(): RecruitContentSnapshot {
  if (cachedSnapshot) return cachedSnapshot;

  const overrides = getUploadedRecruitOverrides();
  const articles = applyAttachmentDelta(
    extractWindowArray<RecruitArticle>("ARTICLES").filter((item) => item.category !== "Адаптация"),
    overrides.articles,
  );
  const scenarios = applyAttachmentDelta(
    extractWindowArray<RecruitScenario>("SCENARIOS").filter(
      (item) => item.category !== "Адаптация" && !ADAPTATION_SCENARIO_IDS.has(item.id),
    ),
    overrides.scenarios,
    UPLOADED_RECRUIT_REMOVED_IDS.scenarios,
  );
  const scripts = applyAttachmentDelta(
    extractWindowArray<RecruitScript>("SCRIPTS").filter(
      (item) => item.category !== "Адаптация" && !ADAPTATION_SCRIPT_IDS.has(item.id),
    ),
    overrides.scripts,
    UPLOADED_RECRUIT_REMOVED_IDS.scripts,
  );
  const checklists = applyAttachmentDelta(
    extractWindowArray<RecruitChecklist>("CHECKLISTS").filter(
      (item) => !ADAPTATION_CHECKLIST_IDS.has(item.id) && item.stage !== "Адаптация",
    ),
    overrides.checklists,
    UPLOADED_RECRUIT_REMOVED_IDS.checklists,
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
