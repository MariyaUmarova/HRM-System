"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { contentHref } from "@/lib/recruit-content/links";
import type { RecruitScenario } from "@/lib/recruit-content/types";

export function ScenarioCatalog({ scenarios }: { scenarios: RecruitScenario[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все категории");
  const categories = useMemo(
    () => ["Все категории", ...Array.from(new Set(scenarios.map((item) => item.category).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "ru"))],
    [scenarios],
  );
  const filtered = useMemo(() => {
    const q = query.toLocaleLowerCase("ru-RU").trim();
    return scenarios.filter((item) => {
      if (category !== "Все категории" && item.category !== category) return false;
      if (!q) return true;
      return `${item.title} ${item.summary ?? ""} ${item.trigger ?? ""} ${item.stage ?? ""}`
        .toLocaleLowerCase("ru-RU")
        .includes(q);
    });
  }, [category, query, scenarios]);

  return (
    <>
      <div className="rr-toolbar rr-toolbar-scenarios">
        <input
          aria-label="Найти ситуацию"
          placeholder="Найти ситуацию"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select aria-label="Категория ситуации" value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((value) => <option key={value}>{value}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="rr-empty"><strong>Ничего не найдено</strong>Попробуйте изменить запрос или категорию.</div>
      ) : (
        <div className="rr-grid rr-grid-3">
          {filtered.map((item) => (
            <Link
              className="rr-card rr-clickable"
              href={contentHref({ kind: "playbook", id: item.id })}
              key={item.id}
            >
              <div className="rr-topline">
                <span className="rr-tag">{item.category ?? "Playbook"}</span>
                {item.stage ? <span className="rr-tag">{item.stage}</span> : null}
              </div>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <div className="rr-meta">
                {item.sla ? <span className="rr-tag">SLA</span> : null}
                {item.sourceConfidence ? <span className="rr-tag">{item.sourceConfidence}</span> : null}
              </div>
              <div className="rr-card-footer"><span>Открыть playbook</span><span>→</span></div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
