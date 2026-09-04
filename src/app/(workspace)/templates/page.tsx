import Link from "next/link";
import { AccessDenied } from "@/components/access/AccessDenied";
import { ChecklistCard } from "@/components/recruit/ChecklistCard";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";
import { contentHref } from "@/lib/recruit-content/links";
import { getRecruitContent } from "@/lib/recruit-content/source";

export default async function TemplatesPage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "knowledge_base");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  const snapshot = getRecruitContent();
  return (
    <div>
      <div className="rr-page-head">
        <div>
          <div className="rr-eyebrow rr-eyebrow-blue">Уровень 3–4</div>
          <h1>Шаблоны и чек-листы</h1>
          <p>Чистые мастер-файлы и интерактивная проверка качества работы.</p>
        </div>
      </div>

      <div className="rr-section-head"><h2>Шаблоны</h2></div>
      <div className="rr-grid rr-grid-3">
        {snapshot.templates.map((item) => (
          <article className="rr-card rr-template-card" key={item.id}>
            <div className="rr-file-icon">{item.type ?? "FILE"}</div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="rr-template-actions">
                <Link className="rr-btn rr-btn-secondary" href={contentHref({ kind: "template", id: item.id })}>
                  Открыть
                </Link>
                {item.id === "offer-template" && item.downloadLabel ? (
                  <a className="rr-btn rr-btn-primary" href={`/templates/download/${item.id}`}>
                    {item.downloadLabel}
                  </a>
                ) : null}
                {item.articleId && snapshot.articles.some((article) => article.id === item.articleId) ? (
                  <Link className="rr-btn rr-btn-ghost" href={contentHref({ kind: "article", id: item.articleId })}>
                    Инструкция
                  </Link>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="rr-section-head"><h2>Чек-листы</h2></div>
      <div className="rr-grid rr-grid-3">
        {snapshot.checklists.map((item) => (
          <ChecklistCard id={item.id} items={item.items} key={item.id} title={item.title} />
        ))}
      </div>
    </div>
  );
}
