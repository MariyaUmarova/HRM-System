export interface AnalysisItem {
  id: string;
  text: string;
  evidence?: string;
  basis?: string;
}

export interface InterviewAnalysis {
  facts: AnalysisItem[];
  conclusions: AnalysisItem[];
  risks: AnalysisItem[];
  questions: AnalysisItem[];
  huntflowDraft: string;
}

export const SYNTHETIC_INTERVIEW_NOTES = `Интервьюер: Расскажите о последнем опыте работы в технической поддержке.
Кандидат: Последние два года я работал во второй линии поддержки в команде из пяти инженеров.
Интервьюер: Приведите пример сложного обращения.
Кандидат: У клиента периодически пропадала связь с камерами. Я проверил журнал событий, воспроизвёл проблему на тестовом стенде и передал разработчикам точное время сбоя и шаги воспроизведения.
Интервьюер: Как вы общались с клиентом во время разбора?
Кандидат: Я объяснил, какие проверки мы проводим, согласовал временное решение и писал обновления раз в час до устранения проблемы.
Интервьюер: Какие метрики SLA были у команды?
Кандидат: Точные значения сейчас не помню.`;

export const SYNTHETIC_VACANCY_CRITERIA = `Опыт работы во второй линии поддержки
Системная диагностика технических проблем
Понятная коммуникация с клиентом
Работа с SLA и приоритетами обращений`;

const SYNTHETIC_RESULT: InterviewAnalysis = {
  facts: [
    {
      id: "fact-1",
      text: "Есть два года опыта во второй линии поддержки в команде из пяти инженеров.",
      evidence:
        "«Последние два года я работал во второй линии поддержки в команде из пяти инженеров».",
    },
    {
      id: "fact-2",
      text: "При разборе инцидента кандидат использовал журнал событий, тестовый стенд и подготовил шаги воспроизведения.",
      evidence:
        "«Я проверил журнал событий, воспроизвёл проблему на тестовом стенде и передал разработчикам точное время сбоя и шаги воспроизведения».",
    },
    {
      id: "fact-3",
      text: "Во время инцидента кандидат согласовал временное решение и регулярно информировал клиента.",
      evidence:
        "«Я объяснил, какие проверки мы проводим, согласовал временное решение и писал обновления раз в час».",
    },
  ],
  conclusions: [
    {
      id: "conclusion-1",
      text: "Опыт системной диагностики подтверждён конкретным примером из практики.",
      basis: "Факт 2",
    },
    {
      id: "conclusion-2",
      text: "Навык понятной коммуникации с клиентом частично подтверждён описанным сценарием.",
      basis: "Факт 3",
    },
  ],
  risks: [
    {
      id: "risk-1",
      text: "Знание числовых SLA и правил приоритизации не подтверждено: кандидат не вспомнил точные значения.",
      evidence: "«Точные значения сейчас не помню».",
    },
  ],
  questions: [
    {
      id: "question-1",
      text: "Уточнить, как кандидат определял приоритет обращения и контролировал срок реакции.",
    },
    {
      id: "question-2",
      text: "Попросить ещё один пример эскалации, где временное решение не сработало.",
    },
  ],
  huntflowDraft:
    "Кандидат подтвердил два года опыта во второй линии поддержки. Привёл конкретный пример диагностики: проверка журнала событий, воспроизведение на тестовом стенде и передача разработчикам шагов воспроизведения. Коммуникацию с клиентом описал через согласование временного решения и регулярные обновления.\n\nНужно дополнительно проверить знание SLA, подход к приоритизации обращений и опыт сложных эскалаций.",
};

function normalize(value: string): string {
  return value.replace(/\r\n/g, "\n").trim();
}

export function isSyntheticInterviewSample(notes: string, criteria: string): boolean {
  return (
    normalize(notes) === normalize(SYNTHETIC_INTERVIEW_NOTES) &&
    normalize(criteria) === normalize(SYNTHETIC_VACANCY_CRITERIA)
  );
}

export function createSyntheticInterviewResult(): InterviewAnalysis {
  return {
    facts: SYNTHETIC_RESULT.facts.map((item) => ({ ...item })),
    conclusions: SYNTHETIC_RESULT.conclusions.map((item) => ({ ...item })),
    risks: SYNTHETIC_RESULT.risks.map((item) => ({ ...item })),
    questions: SYNTHETIC_RESULT.questions.map((item) => ({ ...item })),
    huntflowDraft: SYNTHETIC_RESULT.huntflowDraft,
  };
}
