import { LinkButton } from "@/components/ui/Button";

export function PlatformManagementEntryCard() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm font-semibold text-foreground">Управление платформой</p>
      <p className="mt-1 text-sm text-muted">
        Пользователи, интеграции, шаблоны, маршруты согласования и аудит. Доступно только Руководителю
        подбора и HRD — отдельной роли администратора нет.
      </p>
      <LinkButton href="/platform-management" variant="secondary" className="mt-4">
        Открыть управление
      </LinkButton>
    </div>
  );
}
