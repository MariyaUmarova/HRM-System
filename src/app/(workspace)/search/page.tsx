import Link from "next/link";
import { AccessDenied } from "@/components/access/AccessDenied";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";
import { RECRUIT_KIND_LABELS } from "@/lib/recruit-content/links";
import { searchRecruitContent } from "@/lib/recruit-content/search";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "knowledge_base");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? searchRecruitContent(query) : [];

  return (
    <div>
      <div className="rr-page-head">
        <div>
          <div className="rr-eyebrow rr-eyebrow-blue">Глобальный поиск</div>
          <h1>{query ? `Результаты: «${query}»` : "Поиск по рабочим материалам"}</h1>
          <p>Ищет по инструкциям, рабочим ситуациям, скриптам, шаблонам, чек-листам и помощникам.</p>
        </div>
      </div>

      <form className="rr-toolbar" action="/search" role="search" style={{ gridTemplateColumns: "1fr auto" }}>
        <input defaultValue={query} name="q" placeholder="Найти инструкцию, скрипт или шаблон" type="search" />
        <button className="rr-btn rr-btn-primary" type="submit">Найти</button>
      </form>

      {!query ? (
        <div className="rr-empty"><strong>Введите запрос</strong>Например: бриф, контроффер, Huntflow или оффер.</div>
      ) : results.length === 0 ? (
        <div className="rr-empty"><strong>Ничего не найдено</strong>Попробуйте другую формулировку.</div>
      ) : (
        <div className="rr-grid">
          {results.map((result) => (
            <Link className="rr-card rr-clickable" href={result.href} key={`${result.kind}:${result.id}`}>
              <div className="rr-topline">
                <span className="rr-tag">{RECRUIT_KIND_LABELS[result.kind]}</span>
                {result.meta ? <span className="rr-tag">{result.meta}</span> : null}
              </div>
              <h3>{result.title}</h3>
              <p>{result.summary.length > 360 ? `${result.summary.slice(0, 357)}…` : result.summary}</p>
              <div className="rr-card-footer"><span>Открыть</span><span>→</span></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
