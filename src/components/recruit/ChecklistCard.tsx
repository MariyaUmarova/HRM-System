"use client";

import { useMemo, useState } from "react";

export function ChecklistCard({
  id,
  title,
  stage,
  items,
}: {
  id: string;
  title: string;
  stage?: string;
  items: string[];
}) {
  const [checked, setChecked] = useState<number[]>([]);
  const checkedSet = useMemo(() => new Set(checked), [checked]);
  const progress = items.length === 0 ? 0 : Math.round((checked.length / items.length) * 100);

  function toggle(index: number) {
    const next = checkedSet.has(index)
      ? checked.filter((value) => value !== index)
      : [...checked, index].sort((a, b) => a - b);
    setChecked(next);
  }

  return (
    <article className="rr-card rr-check-card">
      <h3>{title}</h3>
      {stage ? <p className="rr-muted">{stage}</p> : null}
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
    </article>
  );
}
