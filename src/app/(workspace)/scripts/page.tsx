import { AccessDenied } from "@/components/access/AccessDenied";
import { ScriptCatalog } from "@/components/recruit/ScriptCatalog";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";
import { getRecruitContent } from "@/lib/recruit-content/source";

export default async function ScriptsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "knowledge_base");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  const params = await searchParams;
  const initialQuery = typeof params.q === "string" ? params.q : "";
  const { scripts } = getRecruitContent();
  return (
    <div>
      <div className="rr-page-head">
        <div>
          <div className="rr-eyebrow rr-eyebrow-blue">Уровень 3</div>
          <h1>Библиотека скриптов</h1>
          <p>Готовые формулировки без персональных данных: короткие, стандартные, тёплые, email, Telegram и сложные случаи.</p>
        </div>
      </div>
      <ScriptCatalog scripts={scripts} initialQuery={initialQuery} />
    </div>
  );
}
