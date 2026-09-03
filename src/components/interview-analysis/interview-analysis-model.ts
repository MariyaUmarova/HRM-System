import { splitEmploymentCriteria } from "./employment-criteria-guard";

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

export type InterviewMaterialType =
  | "transcript"
  | "summary"
  | "notes"
  | "audio"
  | "video"
  | "feedback";

export type InterviewFileKind = "audio" | "video";

export interface InterviewFileDescriptor {
  id: string;
  name: string;
  size: number;
  kind: InterviewFileKind;
}

export interface LocalInterviewAnalysisInput {
  criteria: string;
  notes?: string;
  summary?: string;
  feedback?: string;
  importantChecks?: string;
  vacancyTitle?: string;
}

export const INTERVIEW_MATERIAL_OPTIONS: Array<{
  id: InterviewMaterialType;
  label: string;
  description: string;
}> = [
  {
    id: "transcript",
    label: "Полный транскрипт",
    description: "Текст разговора со спикерами или без разметки.",
  },
  {
    id: "summary",
    label: "Короткая сводка",
    description: "Несколько абзацев с основными тезисами встречи.",
  },
  {
    id: "notes",
    label: "Заметки и конспект",
    description: "Свободные записи рекрутера по ходу интервью.",
  },
  {
    id: "audio",
    label: "Аудиозапись",
    description: "MP3, M4A, WAV, WebM, MPEG или OGG.",
  },
  {
    id: "video",
    label: "Видеозапись",
    description: "MP4, MOV или WebM: речь и отдельные визуальные наблюдения.",
  },
  {
    id: "feedback",
    label: "Другие отзывы",
    description: "Комментарии заказчика или другого интервьюера.",
  },
];

export const INTERVIEW_TYPES = [
  "Первичный звонок",
  "HR-интервью",
  "Интервью с заказчиком",
  "Техническое интервью",
  "Финальное интервью",
  "Видеоинтервью",
  "Другое",
] as const;

export const INTERVIEW_MEDIA_ACCEPT =
  ".mp3,.m4a,.wav,.webm,.mp4,.mov,.mpeg,.mpga,.ogg,audio/*,video/mp4,video/quicktime,video/webm";

const AUDIO_EXTENSIONS = new Set(["mp3", "m4a", "wav", "webm", "mpeg", "mpga", "ogg"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm"]);
const MAX_MEDIA_BYTES = 500 * 1024 * 1024;

export function classifyInterviewFile(
  name: string,
  mimeType: string,
): InterviewFileKind | null {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";

  if (mimeType.startsWith("video/")) {
    return VIDEO_EXTENSIONS.has(extension) ? "video" : null;
  }

  if (mimeType.startsWith("audio/")) {
    return AUDIO_EXTENSIONS.has(extension) ? "audio" : null;
  }

  if (VIDEO_EXTENSIONS.has(extension) && extension !== "webm") return "video";
  if (AUDIO_EXTENSIONS.has(extension)) return "audio";
  return null;
}

export function validateInterviewFile(file: {
  name: string;
  type: string;
  size: number;
}): { kind: InterviewFileKind | null; error?: string } {
  const kind = classifyInterviewFile(file.name, file.type);

  if (!kind) {
    return {
      kind: null,
      error: "Формат не поддерживается. Используйте MP3, M4A, WAV, WebM, MPEG, OGG, MP4 или MOV.",
    };
  }

  if (file.size > MAX_MEDIA_BYTES) {
    return {
      kind: null,
      error: "Файл больше 500 МБ. Для длинных интервью потребуется облачная загрузка по частям.",
    };
  }

  return { kind };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

export const SYNTHETIC_INTERVIEW_NOTES = `Интервьюер: Расскажите о последнем опыте работы в технической поддержке.
Кандидат: Последние два года я работал во второй линии поддержки в команде из пяти инженеров.
Интервьюер: Приведите пример сложного обращения.
Кандидат: У клиента периодически пропадала связь с камерами. Я проверил журнал событий, воспроизвёл проблему на тестовом стенде и передал разработчикам точное время сбоя и шаги воспроизведения.
Интервьюер: Как вы общались с клиентом во время разбора?
Кандидат: Я объяснил, какие проверки мы проводим, согласовал временное решение и писал обновления раз в час до устранения проблемы.
Интервьюер: Какие метрики SLA были у команды?
Кандидат: Точные значения сейчас не помню.`;

export const SYNTHETIC_INTERVIEW_SUMMARY =
  "Два года во второй линии поддержки. Есть конкретный кейс диагностики и регулярной коммуникации с клиентом. Знание числовых SLA нужно проверить отдельно.";

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

const MATCH_STOP_WORDS = new Set([
  "который",
  "которая",
  "которые",
  "работа",
  "работы",
  "опыт",
  "навык",
  "навыки",
  "умение",
  "знание",
  "знания",
  "готовность",
  "кандидат",
  "клиент",
  "команда",
  "через",
  "после",
  "перед",
  "этого",
  "этой",
  "этот",
  "были",
  "была",
  "было",
  "есть",
  "для",
  "или",
  "при",
  "как",
  "что",
]);

function textTokens(value: string): string[] {
  return normalize(value)
    .toLocaleLowerCase("ru-RU")
    .replaceAll("ё", "е")
    .split(/[^a-zа-я0-9+#.-]+/i)
    .map((token) => token.replace(/^[.-]+|[.-]+$/g, ""))
    .filter((token) => token.length >= 3 && !MATCH_STOP_WORDS.has(token));
}

function tokensMatch(left: string, right: string): boolean {
  if (left === right) return true;
  if (left.length < 5 || right.length < 5) return false;
  const common = Math.min(6, left.length, right.length);
  return left.slice(0, common) === right.slice(0, common);
}

function statementScore(criterion: string, statement: string): number {
  const criterionTokens = textTokens(criterion);
  if (!criterionTokens.length) return 0;
  const statementTokens = textTokens(statement);
  const matched = criterionTokens.filter((criterionToken) =>
    statementTokens.some((statementToken) => tokensMatch(criterionToken, statementToken)),
  ).length;
  const phraseBonus = normalize(statement)
    .toLocaleLowerCase("ru-RU")
    .includes(normalize(criterion).toLocaleLowerCase("ru-RU"))
    ? 1
    : 0;
  return matched / criterionTokens.length + phraseBonus;
}

function splitStatements(value: string): string[] {
  return normalize(value)
    .replace(/([.!?])\s+/g, "$1\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 12);
}

function uniqueStatements(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = normalize(value).toLocaleLowerCase("ru-RU");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function evidenceText(statement: string): string {
  const cleaned = statement.replace(/^(кандидат|интервьюер|рекрутер|заказчик)\s*:\s*/i, "").trim();
  const clipped = cleaned.length > 360 ? `${cleaned.slice(0, 357).trimEnd()}…` : cleaned;
  return `«${clipped}»`;
}

function inputList(value: string): string[] {
  return normalize(value)
    .split(/\n|;/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

/**
 * Browser-safe deterministic preview for de-identified text.
 *
 * This is intentionally NOT an AI/model call. It finds lexical evidence for vacancy
 * criteria, exposes the exact supporting text, and turns missing evidence into questions.
 * Sensitive employment criteria are excluded before matching and can never become
 * supporting facts, conclusions or Huntflow criteria.
 */
export function createLocalInterviewAnalysis(input: LocalInterviewAnalysisInput): InterviewAnalysis {
  const criteriaSplit = splitEmploymentCriteria(input.criteria);
  const criteria = criteriaSplit.allowed.slice(0, 12);
  const checksSplit = splitEmploymentCriteria(input.importantChecks ?? "");
  const allowedChecks = checksSplit.allowed.slice(0, 12);
  const blockedCriteria = uniqueStatements([
    ...criteriaSplit.blocked,
    ...checksSplit.blocked,
  ]).slice(0, 12);
  const statements = uniqueStatements([
    ...splitStatements(input.notes ?? ""),
    ...splitStatements(input.summary ?? ""),
    ...splitStatements(input.feedback ?? ""),
  ]);

  const matches = criteria.map((criterion) => {
    const ranked = statements
      .map((statement) => ({ statement, score: statementScore(criterion, statement) }))
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    return {
      criterion,
      evidence: best && best.score >= 0.34 ? best.statement : null,
      score: best?.score ?? 0,
    };
  });

  const matched = matches.filter((item) => item.evidence);
  const unmatched = matches.filter((item) => !item.evidence);

  const facts: AnalysisItem[] = matched.slice(0, 6).map((item, index) => ({
    id: `local-fact-${index + 1}`,
    text: `По критерию «${item.criterion}» в материале найдено прямое текстовое свидетельство.`,
    evidence: evidenceText(item.evidence ?? ""),
  }));

  if (!facts.length) {
    statements.slice(0, 3).forEach((statement, index) => {
      facts.push({
        id: `local-fact-${index + 1}`,
        text: "В материале зафиксировано утверждение, которое рекрутеру нужно интерпретировать вручную.",
        evidence: evidenceText(statement),
      });
    });
  }

  const conclusions: AnalysisItem[] = matched.slice(0, 6).map((item, index) => ({
    id: `local-conclusion-${index + 1}`,
    text: `Критерий «${item.criterion}» предварительно поддерживается найденным свидетельством; окончательную оценку делает рекрутер.`,
    basis: `Факт ${Math.min(index + 1, Math.max(1, facts.length))}`,
  }));

  const risks: AnalysisItem[] = blockedCriteria.map((criterion, index) => ({
    id: `local-policy-block-${index + 1}`,
    text: `Критерий «${criterion}» исключён из автоматического сопоставления: чувствительные характеристики нельзя использовать для оценки кандидата.`,
  }));
  unmatched.slice(0, Math.max(0, 8 - risks.length)).forEach((item, index) => {
    risks.push({
      id: `local-risk-${index + 1}`,
      text: `В переданном тексте не найдено прямого подтверждения критерия «${item.criterion}». Это пробел в материале, а не отрицательная оценка кандидата.`,
    });
  });

  const questions: AnalysisItem[] = unmatched.slice(0, 8).map((item, index) => ({
    id: `local-question-${index + 1}`,
    text: `Уточнить критерий «${item.criterion}»: попросить конкретный пример, роль кандидата, действия и измеримый результат.`,
  }));

  const existingQuestionText = questions.map((item) => item.text.toLocaleLowerCase("ru-RU")).join(" ");
  allowedChecks.forEach((check) => {
    if (questions.length >= 10 || existingQuestionText.includes(check.toLocaleLowerCase("ru-RU"))) return;
    questions.push({
      id: `local-question-check-${questions.length + 1}`,
      text: `Дополнительно проверить: ${check}. Опирайтесь на конкретный пример из опыта, а не на общее самоописание.`,
    });
  });

  if (!questions.length) {
    questions.push({
      id: "local-question-review",
      text: "Попросить ещё один конкретный пример по самому критичному требованию вакансии и проверить роль кандидата, действия и результат.",
    });
  }

  const confirmedCriteria = matched.map((item) => `• ${item.criterion}`).join("\n");
  const missingCriteria = unmatched.map((item) => `• ${item.criterion}`).join("\n");
  const vacancy = input.vacancyTitle?.trim() ? ` по вакансии «${input.vacancyTitle.trim()}»` : "";
  const huntflowDraft = [
    `Локальный предварительный разбор обезличенного материала${vacancy}. Не является AI-оценкой или решением о найме.`,
    confirmedCriteria ? `\nВ тексте найдено прямое свидетельство по критериям:\n${confirmedCriteria}` : "",
    missingCriteria ? `\nТребует дополнительной проверки — прямое свидетельство не найдено:\n${missingCriteria}` : "",
    "\nПеред фиксацией в Huntflow рекрутер должен проверить цитаты, выводы и при необходимости переписать формулировки.",
  ]
    .filter(Boolean)
    .join("\n");

  return { facts, conclusions, risks, questions, huntflowDraft };
}
