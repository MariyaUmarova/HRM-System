import Link from "next/link";
import { AccessDenied } from "@/components/access/AccessDenied";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";
import { findRecruitItem, referenceIsAvailable, routePrimaryReference } from "@/lib/recruit-content/catalog";
import { contentHref } from "@/lib/recruit-content/links";
import { getRecruitContent } from "@/lib/recruit-content/source";

export default async function WorkflowPage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "workflow");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  const snapshot = getRecruitContent();

  return (
    <div>
      <div className="rr-page-head">
        <div>
          <div className="rr-eyebrow rr-eyebrow-blue">От вакансии до адаптации</div>
          <h1>Полный рабочий маршрут</h1>
          <p>Тот же маршрут, что на главной, но со всеми инструкциями, чек-листами и шаблонами каждого этапа.</p>
        </div>
      </div>

      <div className="rr-callout">
        <strong>Как пользоваться:</strong> откройте текущий этап, затем выберите основную инструкцию или дополнительный материал. Операционные данные и история кандидатов по-прежнему ведутся в Huntflow.
      </div>

      <div className="rr-full-route-list">
        {snapshot.workflow.map((step, index) => {
          const primary = routePrimaryReference(snapshot, step);
          const isBacklog = primary.kind === "page" && primary.id === "adaptation";
          const related = step.related.filter((reference) => referenceIsAvailable(snapshot, reference));
          const primaryItem = findRecruitItem(snapshot, primary);

          return (
            <details className="rr-full-route-stage" key={`${step.n}:${step.title}`} open={index === 0 ? true : undefined}>
              <summary className="rr-full-route-summary">
                <span className="rr-route-number">{step.n}</span>
                <span>
                  <strong>{step.title}</strong>
                  <small>{step.description}</small>
                </span>
                <span className="rr-full-route-chevron">⌄</span>
              </summary>
              <div className="rr-full-route-body">
                <div className="rr-full-route-main">
                  <div>
                    <strong>{isBacklog ? "Раздел в бэклоге" : primaryItem?.title ?? primary.label ?? "Основная инструкция"}</strong>
                    <span>{isBacklog ? "Содержательная часть адаптации пока не переносится." : "Основной материал этого этапа"}</span>
                  </div>
                  <Link className="rr-btn rr-btn-primary" href={contentHref(primary)}>
                    {isBacklog ? "Статус раздела" : "Открыть"}
                  </Link>
                </div>

                {related.length > 0 && !isBacklog ? (
                  <>
                    <div className="rr-materials-title">Дополнительные материалы</div>
                    <div className="rr-materials">
                      {related.map((reference) => {
                        const item = findRecruitItem(snapshot, reference);
                        return (
                          <Link className="rr-material" href={contentHref(reference)} key={`${reference.kind}:${reference.id}`}>
                            <span>
                              <strong>{reference.label ?? item?.title ?? reference.id}</strong>
                              <small>{reference.kind === "playbook" ? "Рабочая ситуация" : reference.kind === "article" ? "Инструкция" : reference.kind === "script" ? "Скрипт" : reference.kind === "template" ? "Шаблон" : reference.kind === "checklist" ? "Чек-лист" : "Материал"}</small>
                            </span>
                            <b>›</b>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                ) : null}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
