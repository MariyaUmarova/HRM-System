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
