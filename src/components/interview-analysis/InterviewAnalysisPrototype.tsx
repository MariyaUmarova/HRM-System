"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import {
  createSyntheticInterviewResult,
  formatFileSize,
  INTERVIEW_MATERIAL_OPTIONS,
  INTERVIEW_MEDIA_ACCEPT,
  INTERVIEW_TYPES,
  isSyntheticInterviewSample,
  SYNTHETIC_INTERVIEW_NOTES,
  SYNTHETIC_INTERVIEW_SUMMARY,
  SYNTHETIC_VACANCY_CRITERIA,
  validateInterviewFile,
  type AnalysisItem,
  type InterviewAnalysis,
  type InterviewFileDescriptor,
  type InterviewMaterialType,
} from "./interview-analysis-model";

const INPUT_CLASS =
  "mt-2 min-h-32 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-6 text-foreground shadow-sm transition-colors placeholder:text-muted/70 focus:border-brand";

const ITEM_CLASS =
  "min-h-20 w-full resize-y rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm leading-6 text-foreground hover:border-border focus:border-brand focus:bg-surface";

type AnalysisSection = "facts" | "conclusions" | "risks" | "questions";
type InputStep = 1 | 2 | 3;

function ResultSection({
  title,
  description,
  tone,
  items,
  section,
  onChange,
}: {
  title: string;
  description: string;
  tone: "brand" | "success" | "warning" | "neutral";
  items: AnalysisItem[];
  section: AnalysisSection;
  onChange: (section: AnalysisSection, id: string, text: string) => void;
}) {
  const toneClasses = {
    brand: "border-brand/20 bg-brand-tint",
    success: "border-success/20 bg-success-tint",
    warning: "border-warning/20 bg-warning-tint",
    neutral: "border-border bg-background",
  }[tone];

  return (
    <section className={"rounded-2xl border p-4 " + toneClasses}>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <article key={item.id} className="rounded-xl border border-border/80 bg-surface p-3 shadow-sm">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                {title} {index + 1}
              </span>
              <textarea
                aria-label={title + " " + (index + 1)}
                className={ITEM_CLASS}
                value={item.text}
                onChange={(event) => onChange(section, item.id, event.target.value)}
              />
            </label>
            {item.basis && (
              <p className="mt-2 border-t border-border pt-2 text-xs leading-5 text-muted">
                <span className="font-semibold text-foreground">Основание:</span> {item.basis}
              </p>
            )}
            {item.evidence && (
              <blockquote className="mt-2 border-l-2 border-brand pl-3 text-xs leading-5 text-muted">
                <span className="font-semibold text-foreground">Доказательство из материала:</span>{" "}
                {item.evidence}
              </blockquote>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function StepButton({
  number,
  label,
  active,
  onClick,
}: {
  number: InputStep;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        active
          ? "flex min-w-0 items-center gap-2 rounded-xl border border-brand bg-brand-tint px-3 py-2 text-left text-xs font-semibold text-brand-dark"
          : "flex min-w-0 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-left text-xs font-medium text-muted hover:border-brand hover:text-brand"
      }
    >
      <span
        className={
          active
            ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white"
            : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background text-muted"
        }
      >
        {number}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

export function InterviewAnalysisPrototype() {
  const [activeStep, setActiveStep] = useState<InputStep>(1);
  const [vacancyTitle, setVacancyTitle] = useState("");
  const [interviewType, setInterviewType] = useState<(typeof INTERVIEW_TYPES)[number]>(
    "HR-интервью",
  );
  const [criteria, setCriteria] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState<InterviewMaterialType[]>([
    "transcript",
    "notes",
  ]);
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [feedback, setFeedback] = useState("");
  const [importantChecks, setImportantChecks] = useState("");
  const [files, setFiles] = useState<InterviewFileDescriptor[]>([]);
  const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState(
    "Используйте синтетический пример: реальные данные кандидатов пока не загружаются.",
  );

  function clearResult(nextStatus: string) {
    setAnalysis(null);
    setConfirmed(false);
    setStatus(nextStatus);
  }

  function loadSample() {
    setVacancyTitle("Инженер технической поддержки 2-й линии");
    setInterviewType("HR-интервью");
    setCriteria(SYNTHETIC_VACANCY_CRITERIA);
    setSelectedMaterials(["transcript", "summary", "notes"]);
    setNotes(SYNTHETIC_INTERVIEW_NOTES);
    setSummary(SYNTHETIC_INTERVIEW_SUMMARY);
    setFeedback("");
    setFiles([]);
    setActiveStep(2);
    clearResult("Синтетический пример загружен. Можно проверить разные источники и результат.");
  }

  function toggleMaterial(material: InterviewMaterialType) {
    setSelectedMaterials((current) =>
      current.includes(material)
        ? current.filter((item) => item !== material)
        : [...current, material],
    );
    clearResult("Состав материалов изменён. Результат нужно сформировать заново.");
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    const nextFiles: InterviewFileDescriptor[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach((file, index) => {
      const validation = validateInterviewFile(file);
      if (!validation.kind) {
        errors.push(`${file.name}: ${validation.error}`);
        return;
      }

      nextFiles.push({
        id: `${file.name}-${file.size}-${index}`,
        name: file.name,
        size: file.size,
        kind: validation.kind,
      });
    });

    setFiles((current) => [...current, ...nextFiles]);
    setConfirmed(false);
    setAnalysis(null);

    if (errors.length) {
      setStatus(errors.join(" "));
    } else {
      setStatus(
        "Формат распознан. В preview сохранены только имя, размер и тип; содержимое файла никуда не загружено.",
      );
    }
  }

  function showDemoResult() {
    if (!notes.trim() || !criteria.trim()) {
      setStatus("Для тестового результата заполните транскрипт и критерии вакансии.");
      return;
    }

    if (!isSyntheticInterviewSample(notes, criteria)) {
      clearResult(
        "Произвольный материал не отправлен: AI-медиапроцессинг ещё не подключён. Верните тестовый пример для проверки интерфейса.",
      );
      return;
    }

    setAnalysis(createSyntheticInterviewResult());
    setConfirmed(false);
    setActiveStep(3);
    setStatus(
      "Показан заранее подготовленный синтетический результат. Это не ответ AI и не рекомендация по найму.",
    );
  }

  function updateItem(section: AnalysisSection, id: string, text: string) {
    setAnalysis((current) => {
      if (!current) return current;
      return {
        ...current,
        [section]: current[section].map((item) =>
          item.id === id ? { ...item, text } : item,
        ),
      };
    });
    setConfirmed(false);
    setStatus("Результат изменён. Перед копированием подтвердите его ещё раз.");
  }

  function updateDraft(value: string) {
    setAnalysis((current) => (current ? { ...current, huntflowDraft: value } : current));
    setConfirmed(false);
    setStatus("Черновик изменён. Перед копированием подтвердите его ещё раз.");
  }

  async function copyDraft() {
    if (!analysis || !confirmed) return;
    try {
      await navigator.clipboard.writeText(analysis.huntflowDraft);
      setStatus("Подтверждённый черновик скопирован. В Huntflow ничего не отправлено.");
    } catch {
      setStatus("Не удалось скопировать автоматически. Выделите текст черновика вручную.");
    }
  }

  const hasTextMaterial = notes.trim() || summary.trim() || feedback.trim();

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Моя работа", href: "/" },
          { label: "Анализ интервью" },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Анализ интервью</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
            Один сценарий для транскрипта, аудио, видео, короткой сводки и заметок.
            Значимые выводы должны опираться на материал, а итог подтверждает рекрутер.
          </p>
        </div>
        <span className="rounded-full bg-warning-tint px-3 py-1 text-xs font-semibold text-warning">
          Безопасный preview
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-brand/20 bg-brand-tint p-4">
        <p className="text-sm font-semibold text-foreground">
          Вариативный вход готов; реальный медиапроцессинг ещё закрыт
        </p>
        <p className="mt-1 max-w-4xl text-xs leading-5 text-muted">
          Сейчас можно проверить все поля, форматы и синтетический результат. Выбранные
          аудио и видео не читаются, не загружаются и не сохраняются. Реальный облачный
          поток включим после выбора провайдера, срока хранения и правил доступа.
        </p>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <StepButton number={1} label="Вакансия" active={activeStep === 1} onClick={() => setActiveStep(1)} />
        <StepButton number={2} label="Материалы" active={activeStep === 2} onClick={() => setActiveStep(2)} />
        <StepButton number={3} label="Контекст и результат" active={activeStep === 3} onClick={() => setActiveStep(3)} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {activeStep === 1 && "1. Вакансия и критерии"}
                {activeStep === 2 && "2. Материалы интервью"}
                {activeStep === 3 && "3. Контекст анализа"}
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                Поля повторяют вариативность переданного HTML-прототипа.
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={loadSample}>
              Загрузить тестовый пример
            </Button>
          </div>

          {activeStep === 1 && (
            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-foreground">Название вакансии</span>
                <input
                  aria-label="Название вакансии"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-brand"
                  placeholder="Например: Инженер технической поддержки"
                  value={vacancyTitle}
                  onChange={(event) => {
                    setVacancyTitle(event.target.value);
                    clearResult("Вакансия изменена. Результат нужно сформировать заново.");
                  }}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-foreground">Тип интервью</span>
                <select
                  aria-label="Тип интервью"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-brand"
                  value={interviewType}
                  onChange={(event) =>
                    setInterviewType(event.target.value as (typeof INTERVIEW_TYPES)[number])
                  }
                >
                  {INTERVIEW_TYPES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-foreground">Критерии вакансии</span>
                <span className="ml-1 text-xs text-muted">(по одному на строку)</span>
                <textarea
                  aria-label="Критерии вакансии"
                  className={INPUT_CLASS}
                  placeholder="Опыт, навыки и обязательные требования конкретной вакансии"
                  value={criteria}
                  onChange={(event) => {
                    setCriteria(event.target.value);
                    clearResult("Критерии изменены. Результат нужно сформировать заново.");
                  }}
                />
              </label>

              <Button type="button" onClick={() => setActiveStep(2)} disabled={!criteria.trim()}>
                Перейти к материалам
              </Button>
            </div>
          )}

          {activeStep === 2 && (
            <div className="mt-5">
              <fieldset>
                <legend className="text-sm font-medium text-foreground">
                  Что есть после встречи
                </legend>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Можно выбрать несколько источников одновременно.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {INTERVIEW_MATERIAL_OPTIONS.map((option) => {
                    const selected = selectedMaterials.includes(option.id);
                    return (
                      <label
                        key={option.id}
                        className={
                          selected
                            ? "flex cursor-pointer gap-3 rounded-xl border border-brand bg-brand-tint p-3"
                            : "flex cursor-pointer gap-3 rounded-xl border border-border bg-background p-3"
                        }
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleMaterial(option.id)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
                        />
                        <span>
                          <span className="block text-xs font-semibold text-foreground">
                            {option.label}
                          </span>
                          <span className="mt-1 block text-[11px] leading-4 text-muted">
                            {option.description}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {(selectedMaterials.includes("transcript") || selectedMaterials.includes("notes")) && (
                <label className="mt-5 block">
                  <span className="text-sm font-medium text-foreground">
                    Заметки или транскрипт
                  </span>
                  <textarea
                    aria-label="Заметки или транскрипт"
                    className={INPUT_CLASS}
                    placeholder="Вставьте полный текст либо свободный конспект встречи"
                    value={notes}
                    onChange={(event) => {
                      setNotes(event.target.value);
                      clearResult("Материал изменён. Результат нужно сформировать заново.");
                    }}
                  />
                </label>
              )}

              {selectedMaterials.includes("summary") && (
                <label className="mt-5 block">
                  <span className="text-sm font-medium text-foreground">Короткая сводка</span>
                  <textarea
                    aria-label="Короткая сводка"
                    className={INPUT_CLASS}
                    placeholder="Основные тезисы, договорённости и сомнения"
                    value={summary}
                    onChange={(event) => {
                      setSummary(event.target.value);
                      clearResult("Сводка изменена. Результат нужно сформировать заново.");
                    }}
                  />
                </label>
              )}

              {selectedMaterials.includes("feedback") && (
                <label className="mt-5 block">
                  <span className="text-sm font-medium text-foreground">
                    Отзывы других участников
                  </span>
                  <textarea
                    aria-label="Отзывы других участников"
                    className={INPUT_CLASS}
                    placeholder="Комментарии заказчика или другого интервьюера"
                    value={feedback}
                    onChange={(event) => {
                      setFeedback(event.target.value);
                      clearResult("Дополнительный отзыв изменён.");
                    }}
                  />
                </label>
              )}

              {(selectedMaterials.includes("audio") || selectedMaterials.includes("video")) && (
                <div className="mt-5 rounded-xl border border-dashed border-brand/40 bg-brand-tint/40 p-4">
                  <label className="block">
                    <span className="text-sm font-semibold text-foreground">
                      Аудио или видеозапись
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted">
                      Можно выбрать несколько файлов. В preview проверяется только формат.
                    </span>
                    <input
                      aria-label="Аудио или видеозапись"
                      type="file"
                      multiple
                      accept={INTERVIEW_MEDIA_ACCEPT}
                      className="mt-3 block w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:font-medium file:text-white"
                      onChange={(event) => {
                        handleFiles(event.target.files);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>

                  {files.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {files.map((file) => (
                        <li
                          key={file.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2"
                        >
                          <span className="min-w-0 text-xs font-medium text-foreground">
                            {file.name}
                          </span>
                          <span className="text-[11px] text-muted">
                            {file.kind === "audio" ? "Аудио" : "Видео"} · {formatFileSize(file.size)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 grid gap-2 text-[11px] leading-4 text-muted sm:grid-cols-2">
                    <p className="rounded-lg bg-surface p-3">
                      <span className="font-semibold text-foreground">Аудио:</span>{" "}
                      транскрибация, разделение спикеров, затем анализ по критериям.
                    </p>
                    <p className="rounded-lg bg-surface p-3">
                      <span className="font-semibold text-foreground">Видео:</span>{" "}
                      аудиодорожка плюс проверяемые наблюдения из ключевых кадров.
                    </p>
                  </div>
                  <p className="mt-3 text-[11px] leading-4 text-warning">
                    Эмоции, характер и «честность» по лицу или голосу оцениваться не будут.
                  </p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  disabled={!criteria.trim() || (!hasTextMaterial && files.length === 0)}
                >
                  Перейти к контексту
                </Button>
                <p className="text-xs leading-5 text-muted">
                  Текст, аудио и видео можно комбинировать.
                </p>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="mt-5">
              <label className="block">
                <span className="text-sm font-medium text-foreground">
                  Что особенно важно проверить
                </span>
                <textarea
                  aria-label="Что особенно важно проверить"
                  className={INPUT_CLASS}
                  placeholder="Например: мотивация, готовность к графику, конкретный навык"
                  value={importantChecks}
                  onChange={(event) => setImportantChecks(event.target.value)}
                />
              </label>

              <fieldset className="mt-5">
                <legend className="text-sm font-medium text-foreground">
                  Нужные форматы результата
                </legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {[
                    "Полная внутренняя оценка",
                    "Комментарий для Huntflow",
                    "Вопросы на следующий этап",
                    "Сводка для заказчика",
                    "Обратная связь кандидату",
                    "Рекомендация по дополнительной проверке",
                  ].map((goal, index) => (
                    <label
                      key={goal}
                      className="flex items-start gap-2 rounded-lg border border-border bg-background p-3 text-xs leading-5 text-foreground"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={index < 4}
                        className="mt-0.5 h-4 w-4 accent-brand"
                      />
                      {goal}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={showDemoResult}
                  disabled={!notes.trim() || !criteria.trim()}
                >
                  Показать тестовый результат
                </Button>
                <p className="text-xs leading-5 text-muted">
                  Произвольный материал не будет выдан за работу AI.
                </p>
              </div>
            </div>
          )}

          <p
            role="status"
            aria-live="polite"
            className="mt-5 rounded-xl border border-border bg-background px-4 py-3 text-xs leading-5 text-muted"
          >
            {status}
          </p>
        </section>

        <section aria-label="Результат анализа" className="min-w-0">
          {!analysis ? (
            <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
              <div className="max-w-sm">
                <p className="text-sm font-semibold text-foreground">
                  Результат пока не сформирован
                </p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Настройте вакансию и материалы или загрузите тестовый пример.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-success/20 bg-success-tint p-4">
                <p className="text-sm font-semibold text-foreground">
                  Синтетический тестовый результат
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Не AI-анализ и не решение о найме. Все поля ниже можно отредактировать.
                </p>
              </div>

              <ResultSection
                title="Факт"
                description="Только то, что прямо подтверждено материалом."
                tone="brand"
                items={analysis.facts}
                section="facts"
                onChange={updateItem}
              />
              <ResultSection
                title="Вывод"
                description="Интерпретация, у которой явно показано основание."
                tone="success"
                items={analysis.conclusions}
                section="conclusions"
                onChange={updateItem}
              />
              <ResultSection
                title="Риск"
                description="Что не подтверждено или требует дополнительной проверки."
                tone="warning"
                items={analysis.risks}
                section="risks"
                onChange={updateItem}
              />
              <ResultSection
                title="Вопрос"
                description="Что стоит уточнить на следующем шаге."
                tone="neutral"
                items={analysis.questions}
                section="questions"
                onChange={updateItem}
              />

              <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-foreground">
                  Черновик комментария для Huntflow
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Редактируется вручную. Отправка во внешнюю систему не подключена.
                </p>
                <textarea
                  aria-label="Черновик комментария для Huntflow"
                  className="mt-3 min-h-44 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground focus:border-brand"
                  value={analysis.huntflowDraft}
                  onChange={(event) => updateDraft(event.target.value)}
                />

                <label className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-background p-3 text-sm leading-5 text-foreground">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-brand"
                    checked={confirmed}
                    onChange={(event) => {
                      setConfirmed(event.target.checked);
                      setStatus(
                        event.target.checked
                          ? "Результат подтверждён рекрутером и готов к копированию."
                          : "Подтверждение снято.",
                      );
                    }}
                  />
                  <span>
                    Я проверил(а) факты, выводы, доказательства, риски и текст
                    комментария.
                  </span>
                </label>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button type="button" disabled={!confirmed} onClick={copyDraft}>
                    Скопировать подтверждённый текст
                  </Button>
                  <Button type="button" variant="secondary" disabled>
                    Отправить в Huntflow
                  </Button>
                </div>
                <p className="mt-3 text-xs leading-5 text-muted">
                  Отправка появится после серверной интеграции, аудита и повторного
                  подтверждения пользователя.
                </p>
              </section>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
