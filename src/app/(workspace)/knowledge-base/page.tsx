import { AccessDenied } from "@/components/access/AccessDenied";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { KnowledgeBaseBrowser } from "@/components/knowledge-base/KnowledgeBaseBrowser";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";

export default async function KnowledgeBasePage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "knowledge_base");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Моя работа", href: "/" }, { label: "База знаний" }]} />
      <h1 className="text-xl font-semibold text-foreground">База знаний рекрутера</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Инструкции, регламенты, шаблоны, чек-листы, скрипты и помощники — всё, что нужно на каждом этапе
        маршрута, в одном месте.
      </p>
      <div className="mt-6">
        <KnowledgeBaseBrowser />
      </div>
    </div>
  );
}
