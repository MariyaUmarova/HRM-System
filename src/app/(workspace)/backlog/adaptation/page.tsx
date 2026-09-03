import Link from "next/link";
import { AccessDenied } from "@/components/access/AccessDenied";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";

export default async function AdaptationBacklogPage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "workflow");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  return (
    <div>
      <Link className="rr-back" href="/workflow">← Назад к маршруту</Link>
      <div className="rr-detail-hero">
        <div className="rr-detail-kicker">Бэклог</div>
        <h1>Адаптация</h1>
        <p>Содержательная часть раздела «Адаптация» пока не переносится в новую структуру HR Hub. Этап остаётся видимым в рабочем маршруте как граница процесса.</p>
      </div>
      <div className="rr-callout"><strong>Статус:</strong> вернёмся к проектированию адаптации отдельной продуктовой итерацией.</div>
    </div>
  );
}
