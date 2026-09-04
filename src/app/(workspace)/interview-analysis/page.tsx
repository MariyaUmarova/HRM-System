import Link from "next/link";
import { AccessDenied } from "@/components/access/AccessDenied";
import { InterviewAnalysisPrototype } from "@/components/interview-analysis/InterviewAnalysisPrototype";
import { LocalInterviewTextAnalyzer } from "@/components/interview-analysis/LocalInterviewTextAnalyzer";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";

export default async function InterviewAnalysisPage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "interview_analysis");

  if (!gate.allowed) {
    return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;
  }

  return (
    <div>
      <Link className="rr-back" href="/tools">← Помощники</Link>

      <div className="mt-4">
        <h1 className="text-xl font-semibold text-foreground">ИИ-анализ интервью</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
          Сейчас рабочий режим выполняет локальный предварительный разбор обезличенного текста:
          ищет прямые свидетельства по критериям и формирует вопросы для проверки. Корпоративный AI,
          реальные медиа и персональные данные подключим только после безопасной серверной интеграции.
        </p>
      </div>

      <div className="mt-6">
        <LocalInterviewTextAnalyzer />
      </div>

      <details className="rounded-2xl border border-border bg-surface p-5">
        <summary className="cursor-pointer text-sm font-semibold text-foreground">
          Расширенный preview: несколько источников, аудио и видео
        </summary>
        <p className="mt-2 text-xs leading-5 text-muted">
          Здесь сохраняется существующий контракт будущего AI-процессинга. Медиа пока только
          валидируются по формату и никуда не загружаются.
        </p>
        <div className="mt-6 border-t border-border pt-6">
          <InterviewAnalysisPrototype />
        </div>
      </details>
    </div>
  );
}
