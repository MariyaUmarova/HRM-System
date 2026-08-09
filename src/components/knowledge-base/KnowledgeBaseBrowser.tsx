"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_ITEMS } from "@/lib/knowledge-base/data";
import { searchKnowledgeBase } from "@/lib/knowledge-base/search";
import { KNOWLEDGE_KIND_LABELS } from "@/lib/knowledge-base/types";

export function KnowledgeBaseBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const result = useMemo(() => searchKnowledgeBase(query), [query]);
  const isSearching = query.trim().length > 0;

  const categoryItems = category ? KNOWLEDGE_ITEMS.filter((i) => i.category === category) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label htmlFor="kb-search" className="mb-1.5 block text-sm font-medium text-foreground">
          Поиск по базе знаний
        </label>
        <input
          id="kb-search"
          type="search"
          placeholder="Например: оффер, чек-лист, совместное интервью…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCategory(null);
          }}
          className="w-full max-w-xl rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground"
        />
        <p className="mt-1 text-xs text-muted">Понимает опечатки и синонимы: «оффер», «offer», «предложение».</p>
      </div>

      {isSearching ? (
        <SearchResults query={query} result={result} />
      ) : category ? (
        <CategoryResults category={category} items={categoryItems} onBack={() => setCategory(null)} />
      ) : (
        <CategoryGrid onSelect={setCategory} />
      )}
    </div>
  );
}

function CategoryGrid({ onSelect }: { onSelect: (category: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {KNOWLEDGE_CATEGORIES.map((cat) => {
        const count = KNOWLEDGE_ITEMS.filter((i) => i.category === cat).length;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className="rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-brand hover:bg-brand-tint/40"
          >
            <p className="text-sm font-semibold text-foreground">{cat}</p>
            <p className="mt-1 text-xs text-muted">{count} материалов</p>
          </button>
        );
      })}
    </div>
  );
}

function CategoryResults({
  category,
  items,
  onBack,
}: {
  category: string;
  items: typeof KNOWLEDGE_ITEMS;
  onBack: () => void;
}) {
  return (
    <div>
      <button type="button" onClick={onBack} className="mb-3 text-sm text-brand hover:underline">
        ← Все категории
      </button>
      <h2 className="mb-3 text-base font-semibold text-foreground">{category}</h2>
      <ItemList items={items} />
    </div>
  );
}

function SearchResults({ query, result }: { query: string; result: ReturnType<typeof searchKnowledgeBase> }) {
  if (result.totalCount === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-sm">
        <p className="font-medium text-foreground">Ничего не найдено по запросу «{query}»</p>
        {result.suggestions.length > 0 && (
          <p className="mt-2 text-muted">
            Возможно, вы искали: {result.suggestions.join(", ")}
          </p>
        )}
        <p className="mt-3 text-xs text-muted">
          Материал отсутствует?{" "}
          <button type="button" className="text-brand hover:underline">
            Сообщить о неудачном поиске
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {result.groups.map((group) => (
        <div key={group.kind}>
          <h2 className="mb-2 text-sm font-semibold text-foreground">
            {KNOWLEDGE_KIND_LABELS[group.kind]} · {group.items.length}
          </h2>
          <ItemList items={group.items} />
        </div>
      ))}
    </div>
  );
}

function ItemList({ items }: { items: typeof KNOWLEDGE_ITEMS }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`/knowledge-base/${item.id}`}
            className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface p-3.5 transition-colors hover:border-brand hover:bg-brand-tint/40"
          >
            <span>
              <span className="block text-sm font-medium text-foreground">{item.title}</span>
              <span className="mt-0.5 block text-xs text-muted">{item.summary}</span>
            </span>
            <span className="shrink-0 rounded-full bg-border/60 px-2 py-1 text-[11px] font-medium text-muted">
              {KNOWLEDGE_KIND_LABELS[item.kind]}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
