import { AccessDenied } from "@/components/access/AccessDenied";
import { OfferCenterBuilder } from "@/components/offer-center/OfferCenterBuilder";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";

export default async function OfferCenterPage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "offer_center");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Моя работа", href: "/" }, { label: "Центр офферов" }]} />
      <h1 className="text-xl font-semibold text-foreground">Центр офферов</h1>
      <p className="mt-1 max-w-3xl text-sm text-muted">
        Заполните условия, проверьте все страницы в фиксированном шаблоне Ivideon и скачайте готовый
        PDF, комплект PNG или PPTX без системной печати.
      </p>

      <div className="mt-4 rounded-xl border border-warning/25 bg-warning-tint px-4 py-3 text-sm text-warning">
        Это безопасный прототип на синтетических данных. Связь с заявкой пока работает только внутри
        браузера; офферы не сохраняются, не отправляются и не подключены к Huntflow, Supabase или AI.
      </div>

      <div className="mt-6">
        <OfferCenterBuilder />
      </div>
    </div>
  );
}
