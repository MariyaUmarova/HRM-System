"use client";

import { useEffect, useMemo, useState } from "react";

export function ChecklistCard({ id, title, items }: { id: string; title: string; items: string[] }) {
  const storageKey = `ivideon-recruit-checklist:${id}`;
  const [checked, setChecked] = useState<number[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw) as number[]);
    } catch {
      setChecked([]);
    }
  }, [storageKey]);

  const checkedSet = useMemo(() => new Set(checked), [checked]);
  const progress = items.length === 0 ? 0 : Math.round((checked.length / items.length) * 100);

  function toggle(index: number) {
    const next = checkedSet.has(index)
      ? checked.filter((value) => value !== index)
      : [...checked, index].sort((a, b) => a - b);
    setChecked(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Checklist remains usable for the current session when storage is unavailable.
    }
  }

  return (
    <article className="rr-card rr-check-card">
      <h3>{title}</h3>
      {items.map((item, index) => (
        <label key={`${id}:${index}`}>
          <input
            type="checkbox"
            checked={checkedSet.has(index)}
            onChange={() => toggle(index)}
          />
          <span>{item}</span>
        </label>
      ))}
      <div className="rr-check-progress" aria-label={`Выполнено ${progress}%`}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <p className="rr-muted" style={{ marginTop: 9, fontSize: 12 }}>{progress}% выполнено</p>
    </article>
  );
}
