import { AccessDenied } from "@/components/access/AccessDenied";
import { PlaceholderScreen } from "@/components/ui/PlaceholderScreen";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";

const SECTIONS = [
  "Пользователи и роли",
  "Хантфлоу и почтовые подключения",
  "AI-провайдеры",
  "Справочники и поля",
  "Маршруты согласования",
  "Шаблоны офферов и писем",
  "Источники новостей",
  "Аудит",
  "Ошибки синхронизации и безопасные повторы",
];

export default async function PlatformManagementPage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "platform_management");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  return (
    <PlaceholderScreen
      breadcrumbs={[{ label: "Моя работа", href: "/" }, { label: "Управление платформой" }]}
      title="Управление платформой"
      description="Доступно только Руководителю подбора и HRD — обе роли имеют одинаковые права управления. Отдельной роли администратора в первой версии нет."
      mocked="Управление подключениями, шаблонами и аудитом появится вместе с backend. Ниже — состав будущего раздела."
    >
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <li key={section} className="rounded-lg border border-border bg-surface p-4 text-sm text-foreground">
            {section}
          </li>
        ))}
      </ul>
    </PlaceholderScreen>
  );
}
