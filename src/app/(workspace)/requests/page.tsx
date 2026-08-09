import { AccessDenied } from "@/components/access/AccessDenied";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { RequestsInbox } from "@/components/requests/RequestsInbox";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";

export default async function RequestsPage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "requests_inbox");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Моя работа", href: "/" }, { label: "Заявки заказчиков" }]} />
      <h1 className="text-xl font-semibold text-foreground">Заявки заказчиков</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Новые заявки получают только Руководитель подбора и HRD. Заявку можно принять в работу или
        вернуть заказчику на доработку с комментарием, а принятую — назначить рекрутеру.
      </p>
      <div className="mt-6 max-w-2xl">
        <RequestsInbox variant="full" />
      </div>
    </div>
  );
}
