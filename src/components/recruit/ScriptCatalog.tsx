"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { contentHref } from "@/lib/recruit-content/links";
import type { RecruitScript } from "@/lib/recruit-content/types";
import { CopyButton } from "./CopyButton";

export function ScriptCatalog({ scripts, initialQuery = "" }: { scripts: RecruitScript[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("Все категории");
  const [channel, setChannel] = useState("Все каналы");
  const categories = useMemo(
    () => ["Все категории", ...Array.from(new Set(scripts.map((item) => item.category).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "ru"))],
    [scripts],
  );
  const channels = useMemo(
    () => ["Все каналы", ...Array.from(new Set(scripts.map((item) => item.channel).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "ru"))],
    [scripts],
  );
  const filtered = useMemo(() => {
    const q = query.toLocaleLowerCase("ru-RU").trim();
    return scripts.filter((item) => {
      if (category !== "Все категории" && item.category !== category) return false;
      if (channel !== "Все каналы" && item.channel !== channel) return false;
      if (!q) return true;
      return `${item.title} ${item.text} ${item.category ?? ""} ${item.channel ?? ""}`.toLocaleLowerCase("ru-RU").includes(q);
    });
  }, [category, channel, query, scripts]);

  return (
    <>
      <div className="rr-toolbar">
        <input
          aria-label="Найти скрипт или фразу"
          placeholder="Найти скрипт или фразу"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select aria-label="Категория скрипта" value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((value) => <option key={value}>{value}</option>)}
        </select>
        <select aria-label="Канал" value={channel} onChange={(event) => setChannel(event.target.value)}>
          {channels.map((value) => <option key={value}>{value}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rr-empty"><strong>Ничего не найдено</strong>Попробуйте изменить запрос или фильтры.</div>
      ) : (
        <div className="rr-grid rr-grid-3">
          {filtered.map((item) => (
            <article className="rr-card rr-script-card" key={item.id}>
              <h3>{item.title}</h3>
              <div className="rr-script-meta">
                {item.category ? <span className="rr-tag">{item.category}</span> : null}
                {item.channel ? <span className="rr-tag">{item.channel}</span> : null}
                {item.tone ? <span className="rr-tag">{item.tone}</span> : null}
              </div>
              <div className="rr-script-text">{item.text}</div>
              <div className="rr-script-actions">
                <CopyButton text={item.text} />
                <Link className="rr-resource-link" style={{ gridColumn: "auto", marginTop: 0 }} href={contentHref({ kind: "script", id: item.id })}>
                  Открыть →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
