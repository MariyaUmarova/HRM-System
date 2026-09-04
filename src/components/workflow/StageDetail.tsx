import Link from "next/link";
import { currentWorkflowTexts } from "@/lib/workflow/current-ia";
import { getAdjacentStages, type WorkflowStage } from "@/lib/workflow/stages";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rr-panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>;
}

function OrderedList({ items }: { items: string[] }) {
  return <ol>{items.map((item, index) => <li key={index}>{item}</li>)}</ol>;
}

function stageHref(id: WorkflowStage["id"]): string {
  return id === "adaptation" ? "/backlog/adaptation" : `/workflow/${id}`;
}

export function StageDetail({ stage }: { stage: WorkflowStage }) {
  const { previous, next } = getAdjacentStages(stage.id);

  return (
    <div>
      <div className="rr-detail-hero">
        <div className="rr-detail-kicker">Этап {String(stage.order).padStart(2, "0")} из 10</div>
        <h1>{stage.title}</h1>
        <p>{stage.shortDescription}</p>
      </div>

      <div className="rr-grid rr-grid-2">
        <Block title="Вход в процесс">
          <BulletList items={currentWorkflowTexts(stage.id, stage.entry)} />
        </Block>
        <Block title="Участники">
          <BulletList items={currentWorkflowTexts(stage.id, stage.participants)} />
        </Block>
        <Block title="Что сделать">
          <BulletList items={currentWorkflowTexts(stage.id, stage.whatToDo)} />
        </Block>
        <Block title="Как сделать">
          <OrderedList items={currentWorkflowTexts(stage.id, stage.howTo)} />
        </Block>
        <Block title="SLA и эскалация">
          <BulletList items={currentWorkflowTexts(stage.id, stage.sla)} />
        </Block>
        <Block title="Процесс завершён, когда">
          <BulletList items={currentWorkflowTexts(stage.id, stage.doneWhen)} />
        </Block>
      </div>

      <div className="rr-template-actions">
        <Link href="/workflow" className="rr-btn rr-btn-secondary">Полный рабочий маршрут</Link>
        <Link href="/search" className="rr-btn rr-btn-ghost">Найти материал</Link>
      </div>

      <nav className="rr-template-actions" aria-label="Соседние этапы рабочего маршрута">
        {previous ? <Link href={stageHref(previous.id)} className="rr-btn rr-btn-ghost">← {previous.title}</Link> : null}
        {next ? <Link href={stageHref(next.id)} className="rr-btn rr-btn-ghost">{next.title} →</Link> : null}
      </nav>
    </div>
  );
}
