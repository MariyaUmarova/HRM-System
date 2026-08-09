import { AccessDenied } from "@/components/access/AccessDenied";
import { PlaceholderScreen } from "@/components/ui/PlaceholderScreen";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";

export default async function InterviewAnalysisPage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "interview_analysis");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  return (
    <PlaceholderScreen
      breadcrumbs={[{ label: "Моя работа", href: "/" }, { label: "Анализ интервью" }]}
      title="Анализ интервью"
      description="Загрузка заметок или транскрипта, AI-разбор по критериям вакансии, подтверждаемая отправка в Хантфлоу."
      mocked="AI-анализ и запись в Хантфлоу не подключены. Форма загрузки ниже неактивна и показывает только структуру будущего результата."
    >
      <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
        <p className="text-sm font-medium text-foreground">Загрузите заметки или транскрипт</p>
        <p className="mt-1 text-xs text-muted">Поддерживаются .txt и .docx — недоступно в Phase 1</p>
        <button
          type="button"
          disabled
          className="mt-4 inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-brand/40 px-4 py-2 text-sm font-medium text-white"
        >
          Выбрать файл
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">Структура результата</h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-foreground">
          <li>• Факты — что подтверждено в интервью</li>
          <li>• Выводы — интерпретация с опорой на факты</li>
          <li>• Риски и пробелы — что осталось непроверенным</li>
          <li>• Редактируемый черновик комментария для Хантфлоу</li>
        </ul>
      </div>
    </PlaceholderScreen>
  );
}
