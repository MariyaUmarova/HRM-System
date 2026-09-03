import Link from "next/link";
import { AccessDenied } from "@/components/access/AccessDenied";
import { OfferCenterBuilder } from "@/components/offer-center/OfferCenterBuilder";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";

export default async function OfferCenterPage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "offer_center");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  return (
    <div>
      <Link className="rr-back" href="/tools">← Помощники</Link>
      <div className="rr-page-head">
        <div>
          <div className="rr-eyebrow rr-eyebrow-blue">Помощник</div>
          <h1>Конструктор оффера</h1>
          <p>Заполните условия, проверьте все страницы в фиксированном шаблоне Ivideon и скачайте готовый PDF, комплект PNG или PPTX без системной печати.</p>
        </div>
      </div>

      <div className="rr-callout">
        Это безопасный прототип на синтетических данных. Связь с заявкой пока работает только внутри браузера; офферы не сохраняются, не отправляются и не подключены к Huntflow, Supabase или AI.
      </div>

      <OfferCenterBuilder />
    </div>
  );
}
