import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDateTime } from "@/lib/format";
import type { DraftArtifact, DraftArtifactType } from "@/lib/adapters/types";

const TYPE_LABEL: Record<DraftArtifactType, string> = {
  offer_draft: "Черновик оффера",
  interview_analysis: "Анализ интервью",
  approval_email: "Письмо на согласование",
};

export function UnfinishedArtifactsCard({ artifacts }: { artifacts: DraftArtifact[] }) {
  return (
    <Card>
      <CardHeader
        title="Незавершённые материалы"
        description="Офферы, письма и анализы интервью, созданные в портале, которые вы ещё не завершили."
      />
      {artifacts.length === 0 ? (
        <EmptyState title="Все начатые материалы завершены" />
      ) : (
        <ul className="flex flex-col gap-3">
          {artifacts.map((a) => (
            <li key={a.id} className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border p-3">
              <div>
                <StatusPill tone="warning">{TYPE_LABEL[a.type]}</StatusPill>
                <p className="mt-1.5 text-sm font-medium text-foreground">{a.title}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {a.candidateName} · обновлено {formatDateTime(a.updatedAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
