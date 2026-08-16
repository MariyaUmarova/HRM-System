"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import {
  createSyntheticInterviewResult,
  isSyntheticInterviewSample,
  SYNTHETIC_INTERVIEW_NOTES,
  SYNTHETIC_VACANCY_CRITERIA,
  type AnalysisItem,
  type InterviewAnalysis,
} from "./interview-analysis-model";

const INPUT_CLASS =
  "mt-2 min-h-40 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-6 text-foreground shadow-sm transition-colors placeholder:text-muted/70 focus:border-brand";

const ITEM_CLASS =
  "min-h-20 w-full resize-y rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm leading-6 text-foreground hover:border-border focus:border-brand focus:bg-surface";

type AnalysisSection = "facts" | "conclusions" | "risks" | "questions";

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
                <span className="font-semibold text-foreground">Доказательство из заметок:</span>{" "}
                {item.evidence}
              </blockquote>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export function InterviewAnalysisPrototype() {
  const [notes, setNotes] = useState("");
  const [criteria, setCriteria] = useState("");
  const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState(
    "Загрузите безопасный пример — реальные данные кандидатов использовать пока нельзя.",
  );

  function clearResult(nextStatus: string) {
    setAnalysis(null);
    setConfirmed(false);
    setStatus(nextStatus);
  }

  function loadSample() {
    setNotes(SYNTHETIC_INTERVIEW_NOTES);
    setCriteria(SYNTHETIC_VACANCY_CRITERIA);
    clearResult("Синтетический пример загружен. Теперь можно показать тестовый результат.");
  }

  function showDemoResult() {
    if (!notes.trim() || !criteria.trim()) {
      setStatus("Сначала заполните заметки и критерии вакансии.");
      return;
    }

    if (!isSyntheticInterviewSample(notes, criteria)) {
      clearResult(
        "Произвольный материал не отправлен: реальный AI пока не подключён. Верните тестовый пример для проверки сценария.",
      );
      return;
    }

    setAnalysis(createSyntheticInterviewResult());
    setConfirmed(false);
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
            Проверяем структуру будущего AI-разбора: факты отдельно от выводов,
            каждое значимое утверждение связано с доказательством, а финальный текст
            подтверждает рекрутер.
          </p>
        </div>
        <span className="rounded-full bg-warning-tint px-3 py-1 text-xs font-semibold text-warning">
          Тестовый контур
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-brand/20 bg-brand-tint p-4">
        <p className="text-sm font-semibold text-foreground">Безопасный прототип без подключений</p>
        <p className="mt-1 max-w-4xl text-xs leading-5 text-muted">
          Данные остаются в текущей вкладке браузера, не сохраняются и не отправляются в
          AI, Supabase или Huntflow. Используйте только синтетический пример. Реальные
          интервью будут доступны после утверждения провайдера и правил обработки данных.
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Материал интервью</h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                На этом этапе работает только утверждённый синтетический сценарий.
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={loadSample}>
              Загрузить тестовый пример
            </Button>
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-foreground">
              Заметки или транскрипт
            </span>
            <span className="ml-1 text-xs text-muted">(синтетические данные)</span>
            <textarea
              aria-label="Заметки или транскрипт"
              className={INPUT_CLASS}
              placeholder="Здесь появится безопасный тестовый пример"
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
                clearResult("Материал изменён. Для тестового результата верните исходный пример.");
              }}
            />
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-foreground">Критерии вакансии</span>
            <span className="ml-1 text-xs text-muted">(по одному на строку)</span>
            <textarea
              aria-label="Критерии вакансии"
              className={INPUT_CLASS}
              placeholder="Критерии берутся из конкретной вакансии, без отдельного каталога"
              value={criteria}
              onChange={(event) => {
                setCriteria(event.target.value);
                clearResult("Критерии изменены. Для тестового результата верните исходный пример.");
              }}
            />
          </label>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={showDemoResult}
              disabled={!notes.trim() || !criteria.trim()}
            >
              Показать тестовый результат
            </Button>
            <p className="text-xs leading-5 text-muted">
              Произвольный текст не будет выдан за работу AI.
            </p>
          </div>

          <p
            role="status"
            aria-live="polite"
            className="mt-4 rounded-xl border border-border bg-background px-4 py-3 text-xs leading-5 text-muted"
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
                  Загрузите тестовый пример слева, затем нажмите «Показать тестовый
                  результат».
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
                description="Только то, что прямо подтверждено заметками."
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
                  Кнопка отправки появится только после серверной интеграции, аудита и
                  повторного подтверждения пользователя.
                </p>
              </section>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
