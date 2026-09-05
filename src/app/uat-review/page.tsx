import Link from "next/link";
import { cookies } from "next/headers";
import { PREVIEW_ROLE_COOKIE, parseRole } from "@/lib/auth/roles";

const roles = [
  ["recruiter", "Рекрутер"],
  ["head_of_recruitment", "Руководитель подбора"],
  ["hrd", "HRD"],
  ["customer", "Заказчик"],
] as const;

const routes = [
  ["/", "Главная"],
  ["/workflow", "Рабочий маршрут"],
  ["/scenarios", "Рабочие ситуации"],
  ["/scripts", "Скрипты"],
  ["/templates", "Шаблоны и чек-листы"],
  ["/tools", "Помощники"],
  ["/offer-center", "Центр офферов"],
  ["/interview-analysis", "ИИ-анализ интервью"],
  ["/hr-radar", "HR Radar"],
  ["/requests", "Все заявки заказчиков"],
  ["/platform-management#weekly-focus", "Управление фокусами недели"],
] as const;

export default async function UatPage() {
  const cookieStore = await cookies();
  const activeRole = parseRole(cookieStore.get(PREVIEW_ROLE_COOKIE)?.value);

  return (
    <main className="mx-auto max-w-4xl p-6 md:p-10">
      <div className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Только UAT-стенд</p>
        <h1 className="text-3xl font-semibold">Проверка HR Hub по ролям</h1>
        <p className="mt-3 text-sm text-muted">
          Этот стенд включает Draft PR #20 поверх Recruit shell. Для проверки Фокусов недели выберите Head/HRD,
          откройте управление фокусами, сохраните фокус, затем переключитесь на Рекрутера в этом же браузере.
        </p>
      </div>

      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">1. Выберите роль</h2>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Активная роль: {roles.find(([role]) => role === activeRole)?.[1] ?? "Рекрутер"}
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {roles.map(([role, label]) => {
            const active = role === activeRole;
            return (
              <a
                key={role}
                href={`/uat-review/role/${role}`}
                aria-current={active ? "true" : undefined}
                className={`rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all duration-150 ${
                  active
                    ? "border-blue-600 bg-blue-600 text-white shadow-md ring-4 ring-blue-100"
                    : "border-slate-300 bg-white text-slate-900 shadow-sm hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md"
                }`}
              >
                {active ? "✓ " : ""}
                {label}
              </a>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">2. Откройте раздел</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {routes.map(([href, label]) => (
            <Link key={href} className="rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium" href={href}>
              {label} →
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
