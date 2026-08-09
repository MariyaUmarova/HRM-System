import { AccessDenied } from "@/components/access/AccessDenied";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { WorkflowRouteList } from "@/components/workflow/WorkflowRouteList";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";

export default async function WorkflowPage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "workflow");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Моя работа", href: "/" }, { label: "Рабочий маршрут" }]} />
      <h1 className="text-xl font-semibold text-foreground">Единый рабочий маршрут рекрутера</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Один и тот же порядок из 10 этапов используется на главной, здесь и в базе знаний. Вакансии,
        кандидаты и воронка остаются в Хантфлоу — портал показывает только маршрут и рабочие материалы.
      </p>
      <div className="mt-6">
        <WorkflowRouteList />
      </div>
    </div>
  );
}
