import { AccessDenied } from "@/components/access/AccessDenied";
import { PlaceholderScreen } from "@/components/ui/PlaceholderScreen";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";

const STEPS = [
  "Подтянуть данные из Хантфлоу или вставить их одним сообщением",
  "Проверить распознанные поля — спорные подсвечиваются для подтверждения",
  "Сформировать PDF оффера и очищенное резюме",
  "Собрать письмо на согласование с фиксированными адресатами",
];

export default async function OfferCenterPage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "offer_center");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  return (
    <PlaceholderScreen
      breadcrumbs={[{ label: "Моя работа", href: "/" }, { label: "Центр офферов" }]}
      title="Центр офферов"
      description="Сборка оффера, версии, PDF, очищенное резюме и письмо на согласование."
      mocked="Сборка PDF, распознавание полей и отправка письма не подключены. Ниже — статический макет шагов и фиксированных правил согласования."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Шаги сборки оффера</h2>
          <ol className="mt-3 flex flex-col gap-2 text-sm text-foreground">
            {STEPS.map((step, i) => (
              <li key={step} className="flex gap-2">
                <span className="font-medium text-brand">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            Адресаты письма на согласование
            <HelpTooltip label="Почему адресатов нельзя изменить">
              Получатели зафиксированы продуктовым правилом. Рекрутер и AI не могут их менять — изменить
              состав может только Руководитель подбора или HRD в управлении платформой.
            </HelpTooltip>
          </h2>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">Кому</dt>
              <dd className="text-foreground">Руководитель подбора, HRD</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">Копия — КДП</dt>
              <dd className="text-foreground">Алена Алешова, Мария Комиссарова</dd>
            </div>
          </dl>
        </div>
      </div>
    </PlaceholderScreen>
  );
}
