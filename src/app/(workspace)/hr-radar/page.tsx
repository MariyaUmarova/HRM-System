import { AccessDenied } from "@/components/access/AccessDenied";
import { PlaceholderScreen } from "@/components/ui/PlaceholderScreen";
import { StatusPill } from "@/components/ui/StatusPill";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";

const SAMPLE_ITEMS = [
  { category: "AI и HR Tech", title: "Как HR-команды используют AI-ассистентов в 2026 году", date: "3 августа" },
  { category: "Рынок труда", title: "Обзор зарплатных вилок в IT за второй квартал", date: "1 августа" },
  { category: "Практики компаний", title: "Кейс: как сократить time-to-hire без потери качества", date: "30 июля" },
];

export default async function HrRadarPage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "hr_radar");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  return (
    <PlaceholderScreen
      breadcrumbs={[{ label: "Моя работа", href: "/" }, { label: "HR-радар" }]}
      title="HR-радар"
      description="Ежедневная лента HR- и recruitment-новостей с персональным дайджестом."
      mocked="Подключение Perplexity и RSS-источников запланировано в следующей продуктовой волне. Ниже — статичные примеры карточек."
    >
      <ul className="flex flex-col gap-3">
        {SAMPLE_ITEMS.map((item) => (
          <li key={item.title} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="brand">{item.category}</StatusPill>
              <span className="text-xs text-muted">{item.date}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">{item.title}</p>
          </li>
        ))}
      </ul>
    </PlaceholderScreen>
  );
}
