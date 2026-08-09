import Link from "next/link";
import { getKnowledgeItem } from "@/lib/knowledge-base/data";
import { KNOWLEDGE_KIND_LABELS } from "@/lib/knowledge-base/types";
import { getAdjacentStages, type WorkflowStage } from "@/lib/workflow/stages";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5 text-sm text-foreground">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden="true" className="text-brand">
            •
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function OrderedList({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-col gap-1.5 text-sm text-foreground">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden="true" className="font-medium text-brand">
            {i + 1}.
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function StageDetail({ stage }: { stage: WorkflowStage }) {
  const { previous, next } = getAdjacentStages(stage.id);
  const related = stage.relatedKnowledgeIds.map(getKnowledgeItem).filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-brand">
          Этап {String(stage.order).padStart(2, "0")} из 10
        </span>
        <h1 className="mt-1 text-xl font-semibold text-foreground">{stage.title}</h1>
        <p className="mt-1 text-sm text-muted">{stage.shortDescription}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Block title="Вход в процесс">
          <BulletList items={stage.entry} />
        </Block>
        <Block title="Участники">
          <BulletList items={stage.participants} />
        </Block>
        <Block title="Что сделать">
          <BulletList items={stage.whatToDo} />
        </Block>
        <Block title="Как сделать">
          <OrderedList items={stage.howTo} />
        </Block>
        <Block title="SLA и эскалация">
          <BulletList items={stage.sla} />
        </Block>
        <Block title="Процесс завершён, когда">
          <BulletList items={stage.doneWhen} />
        </Block>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-foreground">Материалы базы знаний</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {related.map((item) => (
              <li key={item!.id}>
                <Link
                  href={`/knowledge-base/${item!.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:border-brand hover:text-brand"
                >
                  <span className="text-muted">{KNOWLEDGE_KIND_LABELS[item!.kind]}</span>
                  {item!.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="flex items-center justify-between border-t border-border pt-4 text-sm">
        {previous ? (
          <Link href={`/workflow/${previous.id}`} className="text-brand hover:underline">
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/workflow/${next.id}`} className="text-brand hover:underline">
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
