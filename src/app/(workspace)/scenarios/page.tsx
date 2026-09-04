import { AccessDenied } from "@/components/access/AccessDenied";
import { ScenarioCatalog } from "@/components/recruit/ScenarioCatalog";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";
import { getRecruitContent } from "@/lib/recruit-content/source";

export default async function ScenariosPage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "knowledge_base");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  const { scenarios } = getRecruitContent();
  return (
    <div>
      <div className="rr-page-head">
        <div>
          <div className="rr-eyebrow rr-eyebrow-blue">Уровень 1–2</div>
          <h1>Рабочие ситуации и playbook</h1>
          <p>Что произошло → первые действия → алгоритм → скрипты → Huntflow → эскалация → критерий закрытия.</p>
        </div>
      </div>
      <ScenarioCatalog scenarios={scenarios} />
    </div>
  );
}
