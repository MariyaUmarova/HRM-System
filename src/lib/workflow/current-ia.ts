import type { WorkflowStageId } from "./stages";

const EXACT_CURRENT_IA_REPLACEMENTS: Partial<Record<WorkflowStageId, Record<string, string>>> = {
  briefing: {
    "Провести структурированный бриф по скрипту базы знаний.":
      "Провести структурированный бриф по рабочему скрипту.",
    "Откройте базу знаний → «Скрипт брифа» и держите его под рукой во время созвона.":
      "Откройте раздел «Скрипты», найдите материалы по брифу и держите нужный текст под рукой во время созвона.",
  },
  sourcing: {
    "Откройте базу знаний → «AI-помощник по поиску» для карты поиска и вариантов запросов.":
      "Используйте согласованный профиль вакансии и сформируйте карту поиска: каналы, компании-доноры, синонимы должности и варианты запросов.",
  },
  "candidate-presentation": {
    "В базе знаний откройте шаблон «Представление кандидата заказчику».":
      "Откройте «ИИ-анализ интервью», проверьте подтверждённые факты, риски и открытые вопросы и используйте их для представления кандидата заказчику.",
  },
};

export function currentWorkflowText(stageId: WorkflowStageId, text: string): string {
  return EXACT_CURRENT_IA_REPLACEMENTS[stageId]?.[text] ?? text;
}

export function currentWorkflowTexts(stageId: WorkflowStageId, items: string[]): string[] {
  return items.map((item) => currentWorkflowText(stageId, item));
}

export const REMOVED_WORKFLOW_UI_REFERENCES = [
  "AI-помощник по поиску",
  "база знаний → «Скрипт брифа»",
  "В базе знаний откройте шаблон «Представление кандидата заказчику»",
] as const;
