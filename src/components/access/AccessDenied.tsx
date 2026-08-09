import { LinkButton } from "@/components/ui/Button";

export function AccessDenied({ requiredRoleLabel }: { requiredRoleLabel: string }) {
  return (
    <div
      data-testid="access-denied"
      className="mx-auto mt-12 max-w-md rounded-xl border border-border bg-surface p-8 text-center"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-danger">Доступ ограничен</p>
      <h1 className="mt-2 text-lg font-semibold text-foreground">Этот раздел недоступен для вашей роли</h1>
      <p className="mt-2 text-sm text-muted">
        Раздел доступен только роли «{requiredRoleLabel}». Переключите роль предпросмотра или вернитесь на главную.
      </p>
      <LinkButton href="/" className="mt-5">
        На главную
      </LinkButton>
    </div>
  );
}
