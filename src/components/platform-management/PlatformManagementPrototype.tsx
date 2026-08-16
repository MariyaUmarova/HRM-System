"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  createInviteDraft,
  validateInvite,
  type InviteDraft,
  type InviteDraftInput,
} from "./invitations-model";

const EMPTY_FORM: InviteDraftInput = {
  email: "",
  role: "recruiter",
  department: "",
  position: "",
};

const FUTURE_SECTIONS = [
  {
    title: "Хантфлоу и почта",
    status: "Не подключено",
    detail: "Токены и письма будут работать только через серверные секреты и аудит.",
  },
  {
    title: "AI-провайдеры",
    status: "Не выбран",
    detail: "Нужны утверждённый провайдер, модель, лимиты и правила персональных данных.",
  },
  {
    title: "Шаблоны и справочники",
    status: "Прототип",
    detail: "Оффер уже тестируется; версионирование появится вместе с хранением.",
  },
  {
    title: "Аудит и безопасные повторы",
    status: "Не подключено",
    detail: "Появятся после базы данных и серверного контура интеграций.",
  },
];

export function PlatformManagementPrototype({
  managerLabel,
}: {
  managerLabel: string;
}) {
  const [form, setForm] = useState<InviteDraftInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<ReturnType<typeof validateInvite>>({});
  const [drafts, setDrafts] = useState<InviteDraft[]>([]);
  const [status, setStatus] = useState(
    "Черновики существуют только в текущей вкладке и не создают аккаунты.",
  );

  function updateField(
    field: "email" | "department" | "position",
    value: string,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function prepareInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateInvite(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("Исправьте поля приглашения. Никакие данные не отправлены.");
      return;
    }

    const draft = createInviteDraft(form, drafts.length + 1);
    setDrafts((current) => [draft, ...current]);
    setForm(EMPTY_FORM);
    setStatus(
      "Черновик приглашения подготовлен. Письмо не отправлено, аккаунт не создан.",
    );
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Моя работа", href: "/" },
          { label: "Управление платформой" },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Управление платформой</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
            Руководитель подбора и HRD имеют одинаковые возможности управления.
            Пользователь получает интерфейс своей роли после авторизации и не меняет
            роль из меню сайта.
          </p>
        </div>
        <StatusPill tone="brand">{managerLabel}</StatusPill>
      </div>

      <div className="mt-5 rounded-2xl border border-warning/20 bg-warning-tint p-4">
        <p className="text-sm font-semibold text-foreground">
          Без отправки почты и создания аккаунта
        </p>
        <p className="mt-1 max-w-4xl text-xs leading-5 text-muted">
          Форма ниже проверяет согласованные поля и показывает будущий процесс.
          Supabase Auth, почтовый провайдер и одноразовые ссылки пока не подключены.
          Введённые адреса не сохраняются после обновления страницы.
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">
            Подготовить приглашение
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            Доступны только роли «Рекрутер» и «Заказчик», как согласовано.
          </p>

          <form className="mt-5 space-y-5" onSubmit={prepareInvite} noValidate>
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                Корпоративная почта
              </span>
              <input
                type="email"
                aria-label="Корпоративная почта"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "invite-email-error" : undefined}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/70 focus:border-brand"
                placeholder="name@ivideon.com"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
              {errors.email && (
                <span id="invite-email-error" className="mt-2 block text-xs text-danger">
                  {errors.email}
                </span>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-foreground">Роль</span>
              <select
                aria-label="Роль приглашённого пользователя"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-brand"
                value={form.role}
                onChange={(event) => {
                  const role = event.target.value as InviteDraftInput["role"];
                  setForm((current) => ({
                    ...current,
                    role,
                    department: role === "recruiter" ? "" : current.department,
                    position: role === "recruiter" ? "" : current.position,
                  }));
                  setErrors({});
                }}
              >
                <option value="recruiter">Рекрутер</option>
                <option value="customer">Заказчик</option>
              </select>
            </label>

            {form.role === "customer" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-foreground">
                    Отдел заказчика
                  </span>
                  <input
                    aria-label="Отдел заказчика"
                    aria-invalid={Boolean(errors.department)}
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-brand"
                    value={form.department}
                    onChange={(event) => updateField("department", event.target.value)}
                  />
                  {errors.department && (
                    <span className="mt-2 block text-xs text-danger">
                      {errors.department}
                    </span>
                  )}
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-foreground">
                    Должность заказчика
                  </span>
                  <input
                    aria-label="Должность заказчика"
                    aria-invalid={Boolean(errors.position)}
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-brand"
                    value={form.position}
                    onChange={(event) => updateField("position", event.target.value)}
                  />
                  {errors.position && (
                    <span className="mt-2 block text-xs text-danger">
                      {errors.position}
                    </span>
                  )}
                </label>
              </div>
            )}

            <Button type="submit">Подготовить приглашение</Button>
          </form>

          <p
            role="status"
            aria-live="polite"
            className="mt-5 rounded-xl border border-border bg-background px-4 py-3 text-xs leading-5 text-muted"
          >
            {status}
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Черновики приглашений
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                Ничего не отправлено и не сохранено в базе.
              </p>
            </div>
            <span className="text-xs font-medium text-muted">{drafts.length}</span>
          </div>

          {drafts.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-border bg-background p-8 text-center">
              <p className="text-sm font-semibold text-foreground">Черновиков пока нет</p>
              <p className="mt-2 text-xs leading-5 text-muted">
                Заполните форму слева, чтобы проверить будущий сценарий приглашения.
              </p>
            </div>
          ) : (
            <ul className="mt-5 space-y-3">
              {drafts.map((draft) => (
                <li key={draft.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-all text-sm font-semibold text-foreground">
                        {draft.email}
                      </p>
                      <p className="mt-1 text-xs text-muted">{draft.roleLabel}</p>
                    </div>
                    <StatusPill tone="warning">{draft.status}</StatusPill>
                  </div>
                  {draft.role === "customer" && (
                    <dl className="mt-3 grid gap-2 border-t border-border pt-3 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-muted">Отдел</dt>
                        <dd className="mt-0.5 text-foreground">{draft.department}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Должность</dt>
                        <dd className="mt-0.5 text-foreground">{draft.position}</dd>
                      </div>
                    </dl>
                  )}
                  <p className="mt-3 text-[11px] text-warning">
                    Письмо не отправлено · аккаунт не создан
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6">
        <h2 className="text-base font-semibold text-foreground">Остальные настройки</h2>
        <p className="mt-1 text-xs leading-5 text-muted">
          Состав разделов зафиксирован, но внешние подключения включаются отдельно.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {FUTURE_SECTIONS.map((section) => (
            <li key={section.title} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                <StatusPill tone="neutral">{section.status}</StatusPill>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted">{section.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
