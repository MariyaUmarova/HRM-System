import fs from "node:fs";
import vm from "node:vm";

const sourcePath = "docs/references/v7_4/ivideon-recruit-standalone-v7_4.html";
const outputPath = "src/lib/recruit-content/generated-preview.json";
const html = fs.readFileSync(sourcePath, "utf8");

function balancedExpression(text, start, open, close) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
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
  throw new Error(`Unable to parse expression at ${start}`);
}

function extractWindowArray(name) {
  const marker = `window.${name}`;
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing ${marker}`);
  const start = html.indexOf("[", markerIndex);
  if (start < 0) throw new Error(`${marker} has no array`);
  return JSON.parse(balancedExpression(html, start, "[", "]"));
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
];

function extractWorkflow() {
  const marker = "const WORKFLOW_ROUTE =";
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) throw new Error("Missing WORKFLOW_ROUTE");
  const start = html.indexOf("[", markerIndex);
  if (start < 0) throw new Error("WORKFLOW_ROUTE has no array");
  const expression = balancedExpression(html, start, "[", "]");
  const source = vm.runInNewContext(`(${expression})`, Object.create(null), { timeout: 1000 });
  const byTitle = new Map(source.map((step) => [step.title, step]));
  return APPROVED_WORKFLOW_ORDER.map((title, index) => {
    const step = byTitle.get(title);
    if (!step) throw new Error(`Missing approved workflow stage: ${title}`);
    return { ...step, n: String(index + 1).padStart(2, "0") };
  });
}

const adaptationScenarioIds = new Set(["first-day", "adaptation-risk"]);
const adaptationScriptIds = new Set([
  "adaptation-checkin",
  "adaptation-risk-alignment",
  "newcomer-buddy-intro",
]);
const adaptationChecklistIds = new Set(["first-day-checklist", "adaptation-risk-checklist"]);
const includedTemplateIds = new Set(["offer-template", "recruitment-request", "recruitment-source"]);
const includedToolIds = new Set(["candidate-interview-analyzer", "offer-builder"]);

const snapshot = {
  workflow: extractWorkflow(),
  articles: extractWindowArray("ARTICLES").filter((item) => item.category !== "Адаптация"),
  scenarios: extractWindowArray("SCENARIOS").filter(
    (item) => item.category !== "Адаптация" && !adaptationScenarioIds.has(item.id),
  ),
  scripts: extractWindowArray("SCRIPTS").filter(
    (item) => item.category !== "Адаптация" && !adaptationScriptIds.has(item.id),
  ),
  templates: extractWindowArray("TEMPLATES")
    .filter((item) => includedTemplateIds.has(item.id))
    .map((template) => ({
      ...template,
      file: template.file?.startsWith("data:") ? undefined : template.file,
      previewImage: undefined,
      toolId: undefined,
      toolButtonLabel: undefined,
      toolFirst: undefined,
    })),
  checklists: extractWindowArray("CHECKLISTS").filter(
    (item) => !adaptationChecklistIds.has(item.id) && item.stage !== "Адаптация",
  ),
  tools: extractWindowArray("TOOLS").filter((item) => includedToolIds.has(item.id)),
};

fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Generated ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
