"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  createLocalInterviewAnalysis,
  type AnalysisItem,
  type InterviewAnalysis,
} from "./interview-analysis-model";

const TEXTAREA_CLASS =
  "mt-2 min-h-28 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground placeholder:text-muted/70 focus:border-brand";

function ResultList({
  title,
  items,
  empty,
}: {
  title: string;
  items: AnalysisItem[];
  empty: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-background p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</h3>
      {items.length ? (
        <div className="mt-3 space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-lg border border-border bg-surface p-3">
              <p className="text-sm leading-6 text-foreground">{item.text}</p>
              {item.evidence ? (
                <blockquote className="mt-2 border-l-2 border-brand pl-3 text-xs leading-5 text-muted">
                  {item.evidence}
                </blockquote>
              ) : null}
              {item.basis ? (
                <p className="mt-2 text-xs text-muted">
                  <span className="font-semibold text-foreground">Основание:</span> {item.basis}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-muted">{empty}</p>
      )}
    </section>
  );
}

export function LocalInterviewTextAnalyzer() {
  const [vacancyTitle, setVacancyTitle] = useState("");
  const [criteria, setCriteria] = useState("");
  const [material, setMaterial] = useState("");
  const [importantChecks, setImportantChecks] = useState("");
  const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState(
    "Работает локально в браузере. Используйте только синтетический или обезличенный текст.",
  );

  const canAnalyse = useMemo(
    () => criteria.trim().length >= 3 && material.trim().length >= 12,
    [criteria, material],
  );

  function invalidate(message: string) {
    setAnalysis(null);
    setConfirmed(false);
    setStatus(message);
  }

  function analyse() {
    if (!canAnalyse) {
      setStatus("Добавьте критерии вакансии и достаточно подробный обезличенный материал интервью.");
      return;
    }

    setAnalysis(
      createLocalInterviewAnalysis({
        vacancyTitle,
        criteria,
        notes: material,
        importantChecks,
      }),
    );
    setConfirmed(false);
    setStatus(
      "Локальный предварительный анализ сформирован. Никакой внешний AI не вызывался и данные никуда не отправлялись.",
    );
  }

  async function copyDraft() {
    if (!analysis || !confirmed) return;
    try {
      await navigator.clipboard.writeText(analysis.huntflowDraft);
      setStatus("Проверенный рекрутером черновик скопирован. В Huntflow ничего не отправлено.");
    } catch {
      setStatus("Автокопирование недоступно — выделите текст черновика вручную.");
    }
  }

  return (
    <section className="mb-8 rounded-2xl border border-brand/20 bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            Рабочий локальный режим
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            Быстрый предварительный анализ текста
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
            Сопоставляет критерии вакансии с прямыми свидетельствами в транскрипте или заметках,
            показывает цитаты и формирует вопросы по пробелам. Всё выполняется в браузере без API.
          </p>
        </div>
        <span className="rounded-full bg-success-tint px-3 py-1 text-xs font-semibold text-success">
          Работает локально
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-warning/25 bg-warning-tint px-4 py-3 text-xs leading-5 text-warning">
        <strong>Данные:</strong> пока нет production Auth, private storage и audit trail — не вставляйте
        ФИО, контакты, реальные CV или другие персональные данные кандидатов. Используйте обезличенный текст.
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground">Вакансия</span>
            <input
              aria-label="Локальный анализ — вакансия"
              value={vacancyTitle}
              onChange={(event) => {
                setVacancyTitle(event.target.value);
                invalidate("Вакансия изменена. Сформируйте анализ заново.");
              }}
              placeholder="Например: Инженер поддержки"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-brand"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground">Критерии вакансии</span>
            <span className="ml-1 text-xs text-muted">по одному на строку</span>
            <textarea
              aria-label="Локальный анализ — критерии"
              value={criteria}
              onChange={(event) => {
                setCriteria(event.target.value);
                invalidate("Критерии изменены. Сформируйте анализ заново.");
              }}
              placeholder={"Опыт B2B-продаж\nРабота с длинным циклом сделки\nПереговоры с ЛПР"}
              className={TEXTAREA_CLASS}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground">Обезличенный транскрипт или заметки</span>
            <textarea
              aria-label="Локальный анализ — материал"
              value={material}
              onChange={(event) => {
                setMaterial(event.target.value);
                invalidate("Материал изменён. Сформируйте анализ заново.");
              }}
              placeholder="Кандидат: В прошлой роли я вёл B2B-клиентов..."
              className={`${TEXTAREA_CLASS} min-h-44`}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground">Что отдельно проверить</span>
            <textarea
              aria-label="Локальный анализ — дополнительные проверки"
              value={importantChecks}
              onChange={(event) => {
                setImportantChecks(event.target.value);
                invalidate("Контекст проверки изменён. Сформируйте анализ заново.");
              }}
              placeholder="Мотивация; готовность к графику; опыт с конкретным продуктом"
              className={TEXTAREA_CLASS}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={analyse} disabled={!canAnalyse}>
              Сформировать предварительный анализ
            </Button>
            <p className="text-xs leading-5 text-muted">Без LLM, загрузки файлов и сетевых запросов.</p>
          </div>

          <p
            role="status"
            aria-live="polite"
            className="rounded-xl border border-border bg-background px-4 py-3 text-xs leading-5 text-muted"
          >
            {status}
          </p>
        </div>

        <div className="min-w-0">
          {!analysis ? (
            <div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed border-border bg-background p-8 text-center">
              <div className="max-w-sm">
                <p className="text-sm font-semibold text-foreground">Добавьте критерии и материал</p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Результат покажет только то, что можно связать с текстовым свидетельством. Отсутствие
                  совпадения станет вопросом для проверки, а не отрицательной оценкой кандидата.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-brand/20 bg-brand-tint p-4">
                <p className="text-sm font-semibold text-foreground">Локальный evidence-based результат</p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Это не AI-оценка и не рекомендация по найму. Алгоритм только сопоставляет текст и
                  критерии; рекрутер проверяет каждую формулировку.
                </p>
              </div>

              <div className="grid gap-3 xl:grid-cols-2">
                <ResultList title="Факты / свидетельства" items={analysis.facts} empty="Свидетельства не найдены." />
                <ResultList title="Предварительные выводы" items={analysis.conclusions} empty="Выводов нет — недостаточно прямых свидетельств." />
                <ResultList title="Что не подтверждено" items={analysis.risks} empty="Все заданные критерии имеют текстовое свидетельство." />
                <ResultList title="Вопросы" items={analysis.questions} empty="Дополнительные вопросы не сформированы." />
              </div>

              <section className="rounded-xl border border-border bg-background p-4">
                <label className="block">
                  <span className="text-sm font-semibold text-foreground">Черновик для Huntflow</span>
                  <textarea
                    aria-label="Локальный анализ — черновик Huntflow"
                    value={analysis.huntflowDraft}
                    onChange={(event) => {
                      setAnalysis((current) =>
                        current ? { ...current, huntflowDraft: event.target.value } : current,
                      );
                      setConfirmed(false);
                      setStatus("Черновик изменён. Подтвердите результат заново.");
                    }}
                    className={`${TEXTAREA_CLASS} min-h-44`}
                  />
                </label>

                <label className="mt-4 flex items-start gap-3 rounded-lg border border-border bg-surface p-3 text-sm leading-5 text-foreground">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(event) => {
                      setConfirmed(event.target.checked);
                      setStatus(
                        event.target.checked
                          ? "Результат подтверждён рекрутером и готов к копированию."
                          : "Подтверждение снято.",
                      );
                    }}
                    className="mt-0.5 h-4 w-4 accent-brand"
                  />
                  <span>Я проверил(а) цитаты, выводы, пробелы и текст черновика.</span>
                </label>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button type="button" onClick={copyDraft} disabled={!confirmed}>
                    Скопировать проверенный текст
                  </Button>
                  <Button type="button" variant="secondary" disabled>
                    Отправить в Huntflow
                  </Button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
