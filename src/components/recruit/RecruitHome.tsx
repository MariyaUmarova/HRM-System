import Link from "next/link";
import type { ReactNode } from "react";
import { routePrimaryReference } from "@/lib/recruit-content/catalog";
import { contentHref } from "@/lib/recruit-content/links";
import { getRecruitContent } from "@/lib/recruit-content/source";

export function RecruitHome({ operations }: { operations?: ReactNode }) {
  const snapshot = getRecruitContent();
  const firstReference = routePrimaryReference(snapshot, snapshot.workflow[0]);

  return (
    <>
      <section className="rr-hero">
        <div className="rr-eyebrow">Ivideon Recruit</div>
        <h1>Что вы делаете сейчас?</h1>
        <p>
          Выберите этап рабочего процесса. Портал покажет следующую инструкцию и нужные материалы — без
          необходимости разбираться во всей базе сразу.
        </p>
        <div className="rr-hero-actions">
          <Link className="rr-btn rr-btn-dark" href={contentHref(firstReference)}>
            Начать с получения вакансии
          </Link>
          <Link className="rr-btn rr-btn-hero" href="/workflow">
            Посмотреть полный маршрут
          </Link>
        </div>
        <form className="rr-hero-search" action="/search" role="search">
          <input name="q" placeholder="Или найдите конкретный ответ" type="search" />
          <button className="rr-btn rr-btn-dark" type="submit">Найти</button>
        </form>
      </section>

      <section className="rr-home-route-card">
        <div className="rr-section-head">
          <div>
            <h2>Рабочий маршрут</h2>
            <p>Открывайте только тот этап, на котором находитесь сейчас.</p>
          </div>
        </div>
        <div className="rr-home-route">
          {snapshot.workflow.map((step) => {
            const reference = routePrimaryReference(snapshot, step);
            const isBacklog = reference.kind === "page" && reference.id === "adaptation";
            return (
              <Link className="rr-route-step" href={contentHref(reference)} key={`${step.n}:${step.title}`}>
                <span className="rr-route-number">{step.n}</span>
                <span className="rr-route-copy">
                  <strong>{step.title}</strong>
                  <small>{step.description}</small>
                </span>
                {isBacklog ? <span className="rr-route-backlog">В бэклоге</span> : <span className="rr-route-arrow">›</span>}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="rr-section-head">
        <div>
          <h2>Справочные разделы</h2>
          <p>Открывайте их, когда нужен конкретный текст, файл или дополнительная информация.</p>
        </div>
      </div>
      <div className="rr-resource-grid">
        <ResourceCard
          icon="⚡"
          title="Рабочие ситуации"
          description="Что произошло → первые действия → алгоритм → скрипты → Huntflow → эскалация → критерий закрытия."
          href="/scenarios"
          linkLabel="Открыть playbook"
        />
        <ResourceCard
          icon="✎"
          title="Скрипты и шаблоны"
          description="Готовые тексты, файлы и чек-листы."
          href="/scripts"
          linkLabel="Открыть скрипты"
          secondaryHref="/templates"
          secondaryLabel="Шаблоны и чек-листы"
        />
        <ResourceCard
          icon="✦"
          title="Помощники"
          description="Конструкторы и интерактивные инструменты."
          href="/tools"
          linkLabel="Открыть помощники"
        />
      </div>

      {operations ? <section className="rr-ops">{operations}</section> : null}
    </>
  );
}

function ResourceCard({
  icon,
  title,
  description,
  href,
  linkLabel,
  secondaryHref,
  secondaryLabel,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <article className="rr-resource-card">
      <span className="rr-resource-icon" aria-hidden="true">{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <Link className="rr-resource-link" href={href}>{linkLabel} →</Link>
      {secondaryHref && secondaryLabel ? (
        <Link className="rr-resource-sub-link" href={secondaryHref}>{secondaryLabel}</Link>
      ) : null}
    </article>
  );
}
