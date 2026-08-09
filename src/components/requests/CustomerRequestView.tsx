"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDateTime } from "@/lib/format";
import { getByToken, saveDraft, submit } from "@/lib/adapters/requests.store";
import type { IntakeRequest, IntakeRequestStatus } from "@/lib/adapters/types";

const STATUS_LABEL: Record<IntakeRequestStatus, string> = {
  draft: "Черновик",
  submitted: "Отправлена",
  returned: "Возвращена на доработку",
  accepted: "Принята в работу",
  assigned: "Назначена в подбор",
};

const STATUS_TONE: Record<IntakeRequestStatus, "neutral" | "brand" | "success" | "warning"> = {
  draft: "neutral",
  submitted: "brand",
  returned: "warning",
  accepted: "success",
  assigned: "success",
};

const EDITABLE_STATUSES: IntakeRequestStatus[] = ["draft", "returned"];

export function CustomerRequestView({ token }: { token: string }) {
  const [request, setRequest] = useState<IntakeRequest | null | undefined>(undefined);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    getByToken(token).then(setRequest);
  }, [token]);

  if (request === undefined) {
    return <p className="text-sm text-muted">Загрузка заявки…</p>;
  }

  if (request === null) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-sm">
        <p className="font-medium text-foreground">Ссылка недействительна</p>
        <p className="mt-1 text-muted">
          Эта ссылка на заявку не найдена или срок её действия истёк. Обратитесь к Руководителю подбора или
          HRD за новой ссылкой.
        </p>
      </div>
    );
  }

  const editable = EDITABLE_STATUSES.includes(request.status);
  const lastComment = [...request.history].reverse().find((h) => h.comment)?.comment;

  async function handleChange(patch: Partial<IntakeRequest>) {
    if (!request) return;
    const updated = await saveDraft(token, patch);
    setRequest(updated);
  }

  async function handleSaveDraft() {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  }

  async function handleSubmit() {
    const updated = await submit(token);
    setRequest(updated);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold text-foreground">Заявка на подбор</h1>
        <StatusPill tone={STATUS_TONE[request.status]}>{STATUS_LABEL[request.status]}</StatusPill>
      </div>

      {request.status === "returned" && lastComment && (
        <div className="rounded-lg bg-warning-tint px-4 py-3 text-sm text-warning">
          <strong className="font-semibold">Комментарий для доработки: </strong>
          {lastComment}
        </div>
      )}

      <form
        className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5"
        onSubmit={(e) => e.preventDefault()}
      >
        <Field label="Должность">
          <input
            value={request.position}
            disabled={!editable}
            onChange={(e) => handleChange({ position: e.target.value })}
            className="w-full rounded-md border border-border px-3 py-2 text-sm disabled:bg-background disabled:text-muted"
          />
        </Field>
        <Field label="Подразделение">
          <input
            value={request.department}
            disabled={!editable}
            onChange={(e) => handleChange({ department: e.target.value })}
            className="w-full rounded-md border border-border px-3 py-2 text-sm disabled:bg-background disabled:text-muted"
          />
        </Field>
        <Field label="Обязательные требования (must-have)">
          <textarea
            value={request.mustHave}
            disabled={!editable}
            onChange={(e) => handleChange({ mustHave: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-border px-3 py-2 text-sm disabled:bg-background disabled:text-muted"
          />
        </Field>
        <Field label="Желательные требования (nice-to-have)">
          <textarea
            value={request.niceToHave}
            disabled={!editable}
            onChange={(e) => handleChange({ niceToHave: e.target.value })}
            rows={2}
            className="w-full rounded-md border border-border px-3 py-2 text-sm disabled:bg-background disabled:text-muted"
          />
        </Field>
        <Field label="Комментарий">
          <textarea
            value={request.comment}
            disabled={!editable}
            onChange={(e) => handleChange({ comment: e.target.value })}
            rows={2}
            className="w-full rounded-md border border-border px-3 py-2 text-sm disabled:bg-background disabled:text-muted"
          />
        </Field>

        {editable && (
          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={handleSaveDraft}>
              Сохранить черновик
            </Button>
            <Button type="button" variant="primary" onClick={handleSubmit}>
              Отправить заявку
            </Button>
            {savedNotice && <span className="text-xs text-success">Черновик сохранён</span>}
          </div>
        )}
      </form>

      <p className="text-xs text-muted">Обновлено {formatDateTime(request.updatedAt)}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
