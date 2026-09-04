import Link from "next/link";

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
  ["/platform-management", "Управление платформой"],
] as const;

export default function UatPage() {
  return (
    <main className="mx-auto max-w-4xl p-6 md:p-10">
      <div className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Только UAT-стенд</p>
        <h1 className="text-3xl font-semibold">Проверка HR Hub по ролям</h1>
        <p className="mt-3 text-sm text-muted">
          Эта служебная страница существует только во временной UAT-ветке и не входит в продуктовый PR.
          Выберите роль, затем проверяйте те же страницы, которые видит соответствующий пользователь.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">1. Выберите роль</h2>
        <div className="flex flex-wrap gap-2">
          {roles.map(([role, label]) => (
            <Link key={role} className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium" href={`/__uat/role/${role}`}>
              {label}
            </Link>
          ))}
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
        <p className="mt-4 text-xs text-muted">
          Если раздел закрыт после переключения роли — это проверка реального role access, а не ошибка UAT-меню.
        </p>
      </section>
    </main>
  );
}
