import { formatDate } from "@/lib/format";
import { KNOWLEDGE_KIND_LABELS, type KnowledgeItem } from "@/lib/knowledge-base/types";

export function KnowledgeItemDetail({ item }: { item: KnowledgeItem }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-brand">
          {KNOWLEDGE_KIND_LABELS[item.kind]} · {item.category}
        </span>
        <h1 className="mt-1 text-xl font-semibold text-foreground">{item.title}</h1>
        <p className="mt-1 text-sm text-muted">{item.summary}</p>
        <p className="mt-2 text-xs text-muted">
          Владелец: {item.owner} · версия {item.version} · проверено {formatDate(item.reviewedAt)}
        </p>
      </div>

      {(item.kind === "article" || item.kind === "playbook") && (
        <div className="flex flex-col gap-5">
          {item.sections.map((section) => (
            <section key={section.heading} className="rounded-xl border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold text-foreground">{section.heading}</h2>
              <div className="mt-2 flex flex-col gap-1.5 text-sm text-foreground">
                {section.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {item.kind === "checklist" && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <ul className="flex flex-col gap-2">
            {item.points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-border" aria-label={point} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(item.kind === "template" || item.kind === "script") && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm text-foreground">{item.content}</pre>
        </div>
      )}

      {item.kind === "tool" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-foreground">Что делает помощник</h2>
            <p className="mt-2 text-sm text-foreground">{item.helperDescription}</p>
            <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Входные данные</h3>
            <ul className="mt-1 flex flex-col gap-1 text-sm text-foreground">
              {item.inputs.map((input) => (
                <li key={input}>• {input}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-dashed border-brand/40 bg-brand-tint px-4 py-3 text-sm text-brand-dark">
            <strong className="font-semibold">Что здесь замокано: </strong>
            {item.mockNotice}
          </div>
        </div>
      )}
    </div>
  );
}
