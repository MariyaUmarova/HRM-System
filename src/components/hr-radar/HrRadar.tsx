"use client";

import { useMemo, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  HR_NEWS_REVIEW_DATE,
  searchHrNews,
  type HrNewsCategory,
  type HrNewsItem,
  type HrNewsSource,
} from "./hr-news";

const CATEGORIES: Array<"Все темы" | HrNewsCategory> = [
  "Все темы",
  "Рынок труда",
  "Подбор и найм",
  "AI и HR Tech",
  "Обучение и развитие",
];

export function HrRadar({
  items,
  sources,
}: {
  items: HrNewsItem[];
  sources: HrNewsSource[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Все темы" | HrNewsCategory>("Все темы");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);

  const visibleItems = useMemo(() => {
    const matched = searchHrNews(items, query, category);
    return savedOnly ? matched.filter((item) => savedIds.includes(item.id)) : matched;
  }, [category, items, query, savedIds, savedOnly]);

  function toggleSaved(id: string) {
    setSavedIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id],
    );
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Моя работа", href: "/" },
          { label: "HR-радар" },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">HR-радар</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
            Короткая атрибутированная лента о рынке труда, подборе, HR Tech и
            развитии. Полный материал всегда открывается на сайте источника.
          </p>
        </div>
        <StatusPill tone="success">Автосбор включён</StatusPill>
      </div>

      <div className="mt-5 rounded-2xl border border-brand/20 bg-brand-tint p-4">
        <p className="text-sm font-semibold text-foreground">
          Автосбор источников: ежедневно в 09:00 МСК
        </p>
        <p className="mt-1 max-w-4xl text-xs leading-5 text-muted">
          Новые ссылки сначала попадают в закрытую очередь «На проверке» и не
          публикуются автоматически. RSS Минтруда подключён; hh.ru и CIPD пока
          обновляются вручную. AI-суммаризация не включена. Текущая лента проверена
          редактором {HR_NEWS_REVIEW_DATE}.
        </p>
      </div>

      <section aria-label="Сводка HR-радара" className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Материалов</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{items.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Разрешённых источников</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{sources.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Сохранено в этой вкладке</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{savedIds.length}</p>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="block">
            <span className="text-sm font-medium text-foreground">Поиск по ленте</span>
            <input
              type="search"
              aria-label="Поиск по HR-новостям"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/70 focus:border-brand"
              placeholder="Например: интервью, рынок труда, AI"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="flex min-h-11 items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand"
              checked={savedOnly}
              onChange={(event) => setSavedOnly(event.target.checked)}
            />
            Только сохранённые
          </label>
        </div>

        <div aria-label="Темы HR-новостей" className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              className={
                category === item
                  ? "rounded-full bg-brand px-3 py-2 text-xs font-medium text-white"
                  : "rounded-full border border-border bg-surface px-3 py-2 text-xs font-medium text-muted hover:border-brand hover:text-brand"
              }
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-label="Лента HR-новостей">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-foreground">Материалы</h2>
            <p role="status" aria-live="polite" className="text-xs text-muted">
              Найдено: {visibleItems.length}
            </p>
          </div>

          {visibleItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
              <p className="text-sm font-semibold text-foreground">Материалы не найдены</p>
              <p className="mt-2 text-xs leading-5 text-muted">
                Измените запрос, тему или отключите фильтр сохранённых.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {visibleItems.map((item) => {
                const saved = savedIds.includes(item.id);
                return (
                  <li key={item.id}>
                    <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill tone="brand">{item.category}</StatusPill>
                        <StatusPill tone="success">Источник проверен</StatusPill>
                        <span className="text-xs text-muted">{item.publishedLabel}</span>
                      </div>

                      <h2 className="mt-3 text-base font-semibold leading-6 text-foreground">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted">{item.summary}</p>

                      <div className="mt-4 rounded-xl bg-background p-3">
                        <p className="text-xs font-semibold text-foreground">
                          Почему это может быть полезно команде
                        </p>
                        <p className="mt-1 text-xs leading-5 text-muted">
                          {item.whyItMatters}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                        <div>
                          <p className="text-xs font-semibold text-foreground">{item.source}</p>
                          <p className="mt-0.5 text-[11px] text-muted">{item.sourceKind}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            aria-pressed={saved}
                            onClick={() => toggleSaved(item.id)}
                            className={
                              saved
                                ? "rounded-lg bg-brand-tint px-3 py-2 text-xs font-medium text-brand-dark"
                                : "rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:border-brand hover:text-brand"
                            }
                          >
                            {saved ? "Сохранено" : "Сохранить"}
                          </button>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-dark"
                          >
                            Открыть источник ↗
                          </a>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="h-fit rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Контроль источников</h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            Для каждого разрешённого источника явно указан текущий режим обновления.
          </p>
          <ul className="mt-4 space-y-4">
            {sources.map((source) => (
              <li key={source.name} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-brand hover:underline"
                  >
                    {source.name} ↗
                  </a>
                  <span
                    className={
                      source.updateMode === "Автоматически"
                        ? "text-[11px] font-medium text-success"
                        : "text-[11px] font-medium text-muted"
                    }
                  >
                    {source.updateMode}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted">{source.note}</p>
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-xl bg-warning-tint p-3 text-xs leading-5 text-warning">
            Минтруд собирается автоматически с дедупликацией. Новая карточка
            становится видимой только после редакторской проверки; полный текст
            статьи в базе не сохраняется.
          </div>
        </aside>
      </div>
    </div>
  );
}
