"use client";

import { useState, useSyncExternalStore } from "react";
import { RECRUITERS } from "@/lib/adapters/seed";
import {
  closeWeeklyFocusItem,
  getWeeklyFocusServerSnapshot,
  getWeeklyFocusSnapshot,
  subscribeWeeklyFocus,
  upsertWeeklyFocusItem,
} from "@/lib/adapters/weekly-focus.store";
import type { WeeklyFocusItem } from "@/lib/adapters/types";

const FIELD_CLASS =
  "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted/70 focus:border-brand";

interface FormState {
  id?: string;
  title: string;
  priorityNote: string;
  ownerRecruiterId: string;
  vacancyExternalId: string;
  vacancyTitle: string;
  vacancyDepartment: string;
  huntflowUrl: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  priorityNote: "",
  ownerRecruiterId: RECRUITERS[0]?.id ?? "",
  vacancyExternalId: "",
  vacancyTitle: "",
  vacancyDepartment: "",
  huntflowUrl: "",
};

function recruiterName(id: string): string {
  return RECRUITERS.find((item) => item.id === id)?.name ?? id;
}

function itemToForm(item: WeeklyFocusItem): FormState {
  return {
    id: item.id,
    title: item.title,
    priorityNote: item.priorityNote,
    ownerRecruiterId: item.ownerRecruiterId,
    vacancyExternalId: item.vacancyRef.externalId,
    vacancyTitle: item.vacancyRef.title,
    vacancyDepartment: item.vacancyRef.department,
    huntflowUrl: item.vacancyRef.huntflowUrl,
  };
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.title.trim()) errors.title = "Укажите задачу недельного фокуса.";
  if (!form.priorityNote.trim()) errors.priorityNote = "Укажите приоритет или комментарий.";
  if (!RECRUITERS.some((item) => item.id === form.ownerRecruiterId)) errors.ownerRecruiterId = "Выберите рекрутера.";
  if (!form.vacancyExternalId.trim()) errors.vacancyExternalId = "Укажите Huntflow ID вакансии.";
  if (!form.vacancyTitle.trim()) errors.vacancyTitle = "Укажите название вакансии.";
  if (!/^https:\/\//i.test(form.huntflowUrl.trim())) errors.huntflowUrl = "Укажите HTTPS deep-link на вакансию в Huntflow.";
  return errors;
}

export function WeeklyFocusManager() {
  const focus = useSyncExternalStore(
    subscribeWeeklyFocus,
    getWeeklyFocusSnapshot,
    getWeeklyFocusServerSnapshot,
  );
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingCloseId, setPendingCloseId] = useState<string | null>(null);
  const [status, setStatus] = useState("Изменения сохраняются только в браузере текущего UAT до подключения backend и аудита.");

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("Исправьте поля. Фокус не изменён.");
      return;
    }

    upsertWeeklyFocusItem({
      id: form.id,
      title: form.title,
      priorityNote: form.priorityNote,
      ownerRecruiterId: form.ownerRecruiterId,
      vacancyRef: {
        externalId: form.vacancyExternalId,
        title: form.vacancyTitle,
        department: form.vacancyDepartment,
        huntflowUrl: form.huntflowUrl,
      },
    });
    setStatus(form.id ? "Фокус обновлён. Изменение видно в карточке рекрутера этого браузера." : "Фокус добавлен. Изменение видно в карточке рекрутера этого браузера.");
    setForm(EMPTY_FORM);
    setErrors({});
  }

  function beginEdit(item: WeeklyFocusItem) {
    setForm(itemToForm(item));
    setPendingCloseId(null);
    setStatus("Редактирование открыто. Изменения применятся только после кнопки «Сохранить фокус».");
  }

  function confirmClose(id: string) {
    closeWeeklyFocusItem(id);
    if (form.id === id) setForm(EMPTY_FORM);
    setPendingCloseId(null);
    setStatus("Фокус закрыт и убран из активной недели. Durable audit появится после backend.");
  }

  return (
    <section id="weekly-focus" className="mt-6 scroll-mt-24 rounded-2xl border border-border bg-surface p-5 shadow-sm" aria-labelledby="weekly-focus-management-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="weekly-focus-management-title" className="text-base font-semibold text-foreground">Фокусы недели</h2>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-muted">
            Head of Recruitment и HRD управляют приоритетами команды. Вакансия остаётся в Huntflow: здесь хранится только ссылочный ID и deep-link, без собственного каталога вакансий.
          </p>
        </div>
        <span className="rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold text-brand">{focus.items.length} активных</span>
      </div>

      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <form className="space-y-4 rounded-xl border border-border bg-background p-4" onSubmit={save} noValidate>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{form.id ? "Изменить фокус" : "Добавить фокус"}</h3>
            <p className="mt-1 text-xs text-muted">Никаких автоматических действий в Huntflow форма не выполняет.</p>
          </div>

          <label className="block text-sm font-medium text-foreground">
            Рекрутер
            <select aria-label="Владелец недельного фокуса" className={FIELD_CLASS} value={form.ownerRecruiterId} onChange={(event) => update("ownerRecruiterId", event.target.value)}>
              {RECRUITERS.map((recruiter) => <option key={recruiter.id} value={recruiter.id}>{recruiter.name}</option>)}
            </select>
            {errors.ownerRecruiterId ? <span className="mt-1 block text-xs text-danger">{errors.ownerRecruiterId}</span> : null}
          </label>

          <label className="block text-sm font-medium text-foreground">
            Задача фокуса
            <input aria-label="Задача недельного фокуса" className={FIELD_CLASS} value={form.title} onChange={(event) => update("title", event.target.value)} />
            {errors.title ? <span className="mt-1 block text-xs text-danger">{errors.title}</span> : null}
          </label>

          <label className="block text-sm font-medium text-foreground">
            Приоритет / комментарий
            <textarea aria-label="Приоритет недельного фокуса" className={`${FIELD_CLASS} min-h-24 resize-y`} value={form.priorityNote} onChange={(event) => update("priorityNote", event.target.value)} />
            {errors.priorityNote ? <span className="mt-1 block text-xs text-danger">{errors.priorityNote}</span> : null}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-foreground">
              Huntflow ID вакансии
              <input aria-label="Huntflow ID вакансии" className={FIELD_CLASS} value={form.vacancyExternalId} onChange={(event) => update("vacancyExternalId", event.target.value)} />
              {errors.vacancyExternalId ? <span className="mt-1 block text-xs text-danger">{errors.vacancyExternalId}</span> : null}
            </label>
            <label className="block text-sm font-medium text-foreground">
              Название вакансии
              <input aria-label="Название вакансии для фокуса" className={FIELD_CLASS} value={form.vacancyTitle} onChange={(event) => update("vacancyTitle", event.target.value)} />
              {errors.vacancyTitle ? <span className="mt-1 block text-xs text-danger">{errors.vacancyTitle}</span> : null}
            </label>
          </div>

          <label className="block text-sm font-medium text-foreground">
            Подразделение <span className="text-xs font-normal text-muted">(необязательно)</span>
            <input aria-label="Подразделение вакансии" className={FIELD_CLASS} value={form.vacancyDepartment} onChange={(event) => update("vacancyDepartment", event.target.value)} />
          </label>

          <label className="block text-sm font-medium text-foreground">
            Deep-link Huntflow
            <input aria-label="Deep-link Huntflow" className={FIELD_CLASS} placeholder="https://..." value={form.huntflowUrl} onChange={(event) => update("huntflowUrl", event.target.value)} />
            {errors.huntflowUrl ? <span className="mt-1 block text-xs text-danger">{errors.huntflowUrl}</span> : null}
          </label>

          <div className="flex flex-wrap gap-2">
            <button className="rr-btn rr-btn-primary" type="submit">Сохранить фокус</button>
            {form.id ? <button className="rr-btn rr-btn-ghost" type="button" onClick={() => { setForm(EMPTY_FORM); setErrors({}); }}>Отменить редактирование</button> : null}
          </div>
        </form>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Командный фокус</h3>
          {focus.items.length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted">Активных фокусов нет.</div>
          ) : (
            <ul className="mt-3 space-y-3">
              {focus.items.map((item) => (
                <li key={item.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-brand">{recruiterName(item.ownerRecruiterId)}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted">{item.priorityNote}</p>
                      <a className="mt-2 inline-block text-xs font-medium text-brand hover:underline" href={item.vacancyRef.huntflowUrl} target="_blank" rel="noreferrer">{item.vacancyRef.title} · {item.vacancyRef.externalId} →</a>
                    </div>
                    <div className="flex gap-2">
                      <button className="rr-btn rr-btn-ghost" type="button" onClick={() => beginEdit(item)}>Изменить</button>
                      <button className="rr-btn rr-btn-ghost" type="button" onClick={() => setPendingCloseId(item.id)}>Закрыть</button>
                    </div>
                  </div>
                  {pendingCloseId === item.id ? (
                    <div className="mt-3 rounded-lg border border-warning/30 bg-warning-tint p-3 text-xs text-foreground">
                      <p className="font-semibold">Закрыть этот фокус?</p>
                      <p className="mt-1 text-muted">Он исчезнет из активной недели у руководителя и рекрутера.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button className="rr-btn rr-btn-secondary" type="button" onClick={() => confirmClose(item.id)}>Подтвердить закрытие</button>
                        <button className="rr-btn rr-btn-ghost" type="button" onClick={() => setPendingCloseId(null)}>Отмена</button>
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-4 rounded-xl border border-border bg-background px-4 py-3 text-xs leading-5 text-muted">{status}</p>
    </section>
  );
}
