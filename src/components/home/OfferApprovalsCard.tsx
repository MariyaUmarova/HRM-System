import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDateTime } from "@/lib/format";
import type { OfferApproval } from "@/lib/adapters/types";

const STAGE_LABEL: Record<OfferApproval["stage"], string> = {
  pending_head_of_recruitment: "Ожидает Руководителя подбора",
  pending_hrd: "Ожидает HRD",
  approved: "Согласован",
};

export function OfferApprovalsCard({ approvals }: { approvals: OfferApproval[] }) {
  return (
    <Card>
      <CardHeader title="Офферы на согласовании" description="Статус фиксированного маршрута согласования." />
      {approvals.length === 0 ? (
        <EmptyState title="Нет офферов на согласовании" />
      ) : (
        <ul className="flex flex-col gap-3">
          {approvals.map((a) => (
            <li key={a.id} className="rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {a.candidateName} — {a.vacancyTitle}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">Отправлено: {formatDateTime(a.submittedAt)}</p>
                </div>
                <StatusPill tone="brand">{STAGE_LABEL[a.stage]}</StatusPill>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
