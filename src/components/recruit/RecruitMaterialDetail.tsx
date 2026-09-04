import Link from "next/link";
import { notFound } from "next/navigation";
import { findRecruitItem, referenceForId } from "@/lib/recruit-content/catalog";
import { contentHref, RECRUIT_KIND_LABELS } from "@/lib/recruit-content/links";
import { getRecruitContent } from "@/lib/recruit-content/source";
import type {
  RecruitArticle,
  RecruitChecklist,
  RecruitContentKind,
  RecruitScenario,
  RecruitScript,
  RecruitTemplate,
} from "@/lib/recruit-content/types";
import { ChecklistCard } from "./ChecklistCard";
import { CopyButton } from "./CopyButton";

const MATERIAL_KINDS = new Set<RecruitContentKind>(["playbook", "article", "script", "template", "checklist"]);

export function RecruitMaterialDetail({ kind, id }: { kind: string; id: string }) {
  if (!MATERIAL_KINDS.has(kind as RecruitContentKind)) notFound();
  const typedKind = kind as RecruitContentKind;
  const snapshot = getRecruitContent();
  const item = findRecruitItem(snapshot, { kind: typedKind, id });
  if (!item || typedKind === "tool") notFound();

  if (typedKind === "playbook") return <PlaybookDetail item={item as RecruitScenario} />;
  if (typedKind === "article") return <ArticleDetail item={item as RecruitArticle} />;
  if (typedKind === "script") return <ScriptDetail item={item as RecruitScript} />;
  if (typedKind === "checklist") return <ChecklistDetail item={item as RecruitChecklist} />;
  return <TemplateDetail item={item as RecruitTemplate} />;
}

function DetailHero({ kicker, title, summary }: { kicker: string; title: string; summary?: string }) {
  return (
    <div className="rr-detail-hero">
      <div className="rr-detail-kicker">{kicker}</div>
      <h1>{title}</h1>
      {summary ? <p>{summary}</p> : null}
    </div>
  );
}

function BackLink({ href }: { href: string }) {
  return <Link className="rr-back" href={href}>← Назад</Link>;
}

function Bullets({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>;
}

function ProcessFrame({ item }: { item: RecruitScenario }) {
  const entry = item.entryCondition || item.trigger || "Откройте инструкцию, когда наступила описанная рабочая ситуация.";
  const participants = item.participants?.length
    ? item.participants
    : Array.from(new Set([...(item.audience ?? []), ...(item.responsibleRole ? [item.responsibleRole] : [])]));
  const end = item.processEnd || item.completionCriteria || item.expectedResult || "Результат этапа зафиксирован.";
  return (
    <section className="rr-process-frame">
      <article><span>Вход в процесс</span><p>{entry}</p></article>
      <article><span>Участники</span><Bullets items={participants.length ? participants : ["Рекрутер"]} /></article>
      <article><span>Этап завершён, когда</span><p>{end}</p></article>
    </section>
  );
}

function NewVacancySourceGate({ id }: { id: string }) {
  if (id !== "new-vacancy-assigned") return null;
  return (
    <section className="rr-source-gate">
      <div className="rr-gate-heading">
        <span>Сначала проверьте источник вакансии</span>
        <h2>Вакансию берём в работу только после передачи Руководителем подбора</h2>
        <p>Этот шаг определяет, нужно ли переходить к остальной инструкции.</p>
      </div>
      <div className="rr-gate-options">
        <article className="rr-gate-option rr-gate-proceed">
          <strong>Передал Руководитель подбора</strong>
          <p>Подтвердите получение и переходите к действиям ниже.</p>
        </article>
        <article className="rr-gate-option rr-gate-stop">
          <strong>Запрос пришёл напрямую</strong>
          <p>Передайте информацию Руководителю подбора и дождитесь официального распределения. До этого не создавайте вакансию и не запускайте процесс.</p>
        </article>
      </div>
    </section>
  );
}

function PlaybookDetail({ item }: { item: RecruitScenario }) {
  const snapshot = getRecruitContent();
  const scripts = (item.scripts ?? []).map((id) => snapshot.scripts.find((script) => script.id === id)).filter(Boolean) as RecruitScript[];
  const relatedIds = Array.from(new Set([...(item.templates ?? []), ...(item.checklist ?? []), ...(item.related ?? [])]));
  const related = relatedIds.map((id) => referenceForId(snapshot, id)).filter(Boolean);

  return (
    <div>
      <BackLink href="/scenarios" />
      <DetailHero kicker={item.category ?? "Playbook"} title={item.title} summary={item.summary} />
      <ProcessFrame item={item} />
      <NewVacancySourceGate id={item.id} />

      <div className="rr-detail-grid" style={{ marginTop: 15 }}>
        <main className="rr-detail-main">
          {item.beforeYouStart?.length ? (
            <details className="rr-panel">
              <summary>Что подготовить до начала</summary>
              <div className="rr-details-body"><Bullets items={item.beforeYouStart} /></div>
            </details>
          ) : null}

          <section className="rr-panel rr-detailed-steps">
            <h2>Что делать</h2>
            <ol>{(item.steps ?? []).map((step, index) => <li key={index}>{step}</li>)}</ol>
          </section>

          {(item.systemActions && Object.keys(item.systemActions).length) || item.huntflowActions?.length ? (
            <section className="rr-panel">
              <h2>Где зафиксировать и что настроить</h2>
              {Object.entries(item.systemActions ?? {}).map(([system, actions]) => (
                <div className="rr-system-block" key={system}>
                  <h3>{system}</h3>
                  <Bullets items={actions} />
                </div>
              ))}
              {item.huntflowActions?.length ? (
                <div className="rr-system-block">
                  <h3>Huntflow</h3>
                  <Bullets items={item.huntflowActions} />
                </div>
              ) : null}
            </section>
          ) : null}

          {scripts.length ? (
            <section className="rr-panel">
              <h2>Скрипты</h2>
              {scripts.map((script) => (
                <div className="rr-playbook-script" key={script.id}>
                  <div className="rr-script-heading">
                    <div><h3>{script.title}</h3><small>{[script.channel, script.tone].filter(Boolean).join(" · ")}</small></div>
                    <CopyButton text={script.text} />
                  </div>
                  <div className="rr-script-text">{script.text}</div>
                </div>
              ))}
            </section>
          ) : null}

          {(item.sla || item.escalation) ? (
            <section className="rr-panel">
              <h2>SLA и эскалация</h2>
              {item.sla ? <><h3>SLA</h3><p>{item.sla}</p></> : null}
              {item.escalation ? <><h3>Эскалация</h3><p>{item.escalation}</p></> : null}
            </section>
          ) : null}

          {item.verification?.length ? (
            <details className="rr-panel">
              <summary>Проверка перед завершением</summary>
              <div className="rr-details-body"><Bullets items={item.verification} /></div>
            </details>
          ) : null}

          {item.recommendations?.length ? (
            <details className="rr-panel rr-recommendation">
              <summary>Рекомендации</summary>
              <div className="rr-details-body"><Bullets items={item.recommendations} /></div>
            </details>
          ) : null}

          {item.mistakes?.length ? (
            <details className="rr-panel rr-attention">
              <summary>На что обратить внимание</summary>
              <div className="rr-details-body"><Bullets items={item.mistakes} /></div>
            </details>
          ) : null}
        </main>

        <aside className="rr-detail-side">
          {item.firstActions?.length ? (
            <section className="rr-panel">
              <h2>Первые действия</h2>
              <Bullets items={item.firstActions} />
            </section>
          ) : null}
          {item.expectedResult ? (
            <section className="rr-panel">
              <h2>Ожидаемый результат</h2>
              <p>{item.expectedResult}</p>
            </section>
          ) : null}
          {related.length ? (
            <section className="rr-panel">
              <h2>Нужные материалы</h2>
              {related.map((reference) => {
                if (!reference) return null;
                const relatedItem = findRecruitItem(snapshot, reference);
                return (
                  <div className="rr-source-line" key={`${reference.kind}:${reference.id}`}>
                    <Link href={contentHref(reference)}>{relatedItem?.title ?? reference.id} →</Link>
                  </div>
                );
              })}
            </section>
          ) : null}
          <MetadataPanel item={item} />
        </aside>
      </div>
    </div>
  );
}

function ArticleDetail({ item }: { item: RecruitArticle }) {
  const snapshot = getRecruitContent();
  const related = (item.related ?? []).map((id) => referenceForId(snapshot, id)).filter(Boolean);
  return (
    <div>
      <BackLink href="/workflow" />
      <DetailHero kicker={item.category ?? item.type ?? "Инструкция"} title={item.title} summary={item.summary} />
      <div className="rr-detail-grid">
        <main className="rr-detail-main">
          {item.sections.map((section, sectionIndex) => (
            <section className="rr-panel" id={`section-${sectionIndex}`} key={`${item.id}:${sectionIndex}`}>
              <h2>{section.title}</h2>
              {section.text ? <p className="rr-article-lead">{section.text}</p> : null}
              {section.callout?.text ? (
                <div className="rr-article-callout">
                  {section.callout.title ? <strong>{section.callout.title}</strong> : null}
                  <p>{section.callout.text}</p>
                </div>
              ) : null}
              <Bullets items={section.bullets} />
              {section.table?.rows?.length ? (
                <div className="rr-article-table-wrap">
                  <table className="rr-article-table">
                    {section.table.headers?.length ? <thead><tr>{section.table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead> : null}
                    <tbody>{section.table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              ) : null}
              {section.examples?.length ? (
                <div className="rr-article-examples">
                  {section.examples.map((example, exampleIndex) => (
                    <div className="rr-article-example" key={exampleIndex}>
                      <strong>{example.title}</strong>
                      <div>{example.text}</div>
                      <CopyButton text={example.text} />
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </main>
        <aside className="rr-detail-side">
          <section className="rr-panel">
            <h2>В этой инструкции</h2>
            {item.sections.map((section, index) => <div className="rr-source-line" key={index}><a href={`#section-${index}`}>{section.title}</a></div>)}
          </section>
          {related.length ? (
            <section className="rr-panel">
              <h2>Связанные материалы</h2>
              {related.map((reference) => {
                if (!reference) return null;
                const relatedItem = findRecruitItem(snapshot, reference);
                return <div className="rr-source-line" key={`${reference.kind}:${reference.id}`}><Link href={contentHref(reference)}>{relatedItem?.title ?? reference.id} →</Link></div>;
              })}
            </section>
          ) : null}
          <MetadataPanel item={item} />
        </aside>
      </div>
    </div>
  );
}

function ScriptDetail({ item }: { item: RecruitScript }) {
  return (
    <div>
      <BackLink href="/scripts" />
      <DetailHero kicker={item.category ?? RECRUIT_KIND_LABELS.script} title={item.title} />
      <div className="rr-detail-grid">
        <main className="rr-detail-main">
          <section className="rr-panel">
            <div className="rr-script-heading">
              <div><h2>Готовый текст</h2><small>{[item.channel, item.tone].filter(Boolean).join(" · ")}</small></div>
              <CopyButton text={item.text} />
            </div>
            <div className="rr-script-text">{item.text}</div>
          </section>
        </main>
        <aside className="rr-detail-side"><MetadataPanel item={item} /></aside>
      </div>
    </div>
  );
}

function ChecklistDetail({ item }: { item: RecruitChecklist }) {
  return (
    <div>
      <BackLink href="/templates" />
      <DetailHero kicker={item.stage ?? RECRUIT_KIND_LABELS.checklist} title={item.title} />
      <div className="rr-detail-grid no-side">
        <ChecklistCard id={item.id} items={item.items} title={item.title} />
      </div>
    </div>
  );
}

function TemplateDetail({ item }: { item: RecruitTemplate }) {
  const snapshot = getRecruitContent();
  const article = item.articleId ? snapshot.articles.find((candidate) => candidate.id === item.articleId) : null;
  return (
    <div>
      <BackLink href="/templates" />
      <DetailHero kicker={item.type ?? RECRUIT_KIND_LABELS.template} title={item.title} summary={item.description} />
      <div className="rr-detail-grid">
        <main className="rr-detail-main">
          <section className="rr-panel">
            <h2>Шаблон</h2>
            <p>{item.description}</p>
            {article ? (
              <div style={{ marginTop: 16 }}>
                <Link className="rr-btn rr-btn-primary" href={contentHref({ kind: "article", id: article.id })}>Открыть инструкцию</Link>
              </div>
            ) : null}
          </section>
        </main>
        <aside className="rr-detail-side">
          <section className="rr-panel">
            <h2>Статус файла</h2>
            <p>Текст и назначение шаблона перенесены из standalone-источника. Если исходный файл не входит в репозиторий HR Hub, портал не показывает неработающую ссылку на скачивание.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function MetadataPanel({ item }: { item: { sourceFiles?: string[]; owner?: string; version?: string; lastReviewed?: string; nextReview?: string; sourceConfidence?: string } }) {
  const hasAny = item.sourceFiles?.length || item.owner || item.version || item.lastReviewed || item.nextReview || item.sourceConfidence;
  if (!hasAny) return null;
  return (
    <section className="rr-panel">
      <h2>Источник и актуальность</h2>
      {item.sourceConfidence ? <div className="rr-source-line">Статус: {item.sourceConfidence}</div> : null}
      {item.owner ? <div className="rr-source-line">Владелец: {item.owner}</div> : null}
      {item.version ? <div className="rr-source-line">Версия: {item.version}</div> : null}
      {item.lastReviewed ? <div className="rr-source-line">Проверено: {item.lastReviewed}</div> : null}
      {item.nextReview ? <div className="rr-source-line">Следующий пересмотр: {item.nextReview}</div> : null}
      {item.sourceFiles?.map((source) => <div className="rr-source-line" key={source}>{source}</div>)}
    </section>
  );
}
