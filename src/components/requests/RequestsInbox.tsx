"use client";

import { useState, useSyncExternalStore } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/format";
import { RECRUITERS, recruiterName } from "@/lib/adapters/weekly-focus.mock";
import {
  accept,
  assignRecruiter,
  getAllRequestsSnapshot,
  returnForRevision,
  subscribeRequests,
} from "@/lib/adapters/requests.store";
import type { IntakeRequestStatus } from "@/lib/adapters/types";

const STATUS_LABEL: Record<IntakeRequestStatus, string> = {
  draft: "Черновик",
  submitted: "Отправлена",
  returned: "Возвращена на доработку",
  accepted: "Принята в работу",
  assigned: "Назначена рекрутеру",
};

const STATUS_TONE: Record<IntakeRequestStatus, "neutral" | "brand" | "success" | "warning"> = {
  draft: "neutral",
  submitted: "brand",
  returned: "warning",
  accepted: "success",
  assigned: "success",
};

export function RequestsInbox({ variant = "full" }: { variant?: "full" | "home" }) {
  const requests = useSyncExternalStore(subscribeRequests, getAllRequestsSnapshot, getAllRequestsSnapshot);
  const [revisionDraft, setRevisionDraft] = useState<Record<string, string>>({});

  const newRequests = requests.filter((r) => r.status === "submitted");
  const acceptedUnassigned = requests.filter((r) => r.status === "accepted");
  const visible = variant === "home" ? newRequests : requests;

  if (variant === "home" && newRequests.length === 0) {
    return (
      <Card>
        <CardHeader title="Новые заявки заказчиков" />
        <EmptyState title="Новых заявок нет" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={variant === "home" ? "Новые заявки заказчиков" : "Заявки заказчиков"}
        description="Новые заявки видят только Руководитель подбора и HRD."
      />
      <ul className="flex flex-col gap-3">
        {visible.map((r) => (
          <li key={r.id} className="rounded-lg border border-border p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">{r.position}</p>
                <p className="text-xs text-muted">
                  {r.department} · {r.companyContact}
                </p>
                <p className="mt-1 text-xs text-muted">Обновлено {formatDateTime(r.updatedAt)}</p>
              </div>
              <StatusPill tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</StatusPill>
            </div>

            {r.status === "submitted" && (
              <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center">
                <Button variant="primary" onClick={() => accept(r.id)}>
                  Принять в работу
                </Button>
                <input
                  type="text"
                  placeholder="Комментарий для возврата на доработку"
                  value={revisionDraft[r.id] ?? ""}
                  onChange={(e) => setRevisionDraft((s) => ({ ...s, [r.id]: e.target.value }))}
                  className="flex-1 rounded-md border border-border px-3 py-2 text-sm"
                />
                <Button
                  variant="secondary"
                  onClick={() => returnForRevision(r.id, revisionDraft[r.id] ?? "")}
                  disabled={!revisionDraft[r.id]}
                >
                  Вернуть на доработку
                </Button>
              </div>
            )}

            {r.status === "returned" && r.history.at(-1)?.comment && (
              <p className="mt-2 rounded-md bg-warning-tint px-3 py-2 text-xs text-warning">
                Комментарий: {r.history.at(-1)?.comment}
              </p>
            )}

            {r.status === "accepted" && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <label htmlFor={`assign-${r.id}`} className="text-xs font-medium text-muted">
                  Назначить рекрутера
                </label>
                <select
                  id={`assign-${r.id}`}
                  defaultValue=""
                  onChange={(e) => e.target.value && assignRecruiter(r.id, e.target.value)}
                  className="rounded-md border border-border px-2 py-1.5 text-sm"
                >
                  <option value="" disabled>
                    Выберите рекрутера
                  </option>
                  {RECRUITERS.map((rec) => (
                    <option key={rec.id} value={rec.id}>
                      {rec.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {r.status === "assigned" && r.assignedRecruiterId && (
              <p className="mt-2 text-xs text-muted">Рекрутер: {recruiterName(r.assignedRecruiterId)}</p>
            )}
          </li>
        ))}
      </ul>

      {variant === "full" && acceptedUnassigned.length > 0 && (
        <p className="mt-3 text-xs text-muted">
          {acceptedUnassigned.length} заявка(и) приняты и ждут назначения рекрутера.
        </p>
      )}
    </Card>
  );
}
