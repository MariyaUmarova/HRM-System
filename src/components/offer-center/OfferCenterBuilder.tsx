"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/Button";
import {
  getAllRequestsSnapshot,
  subscribeRequests,
} from "@/lib/adapters/requests.store";
import { exportOffer, type OfferExportKind } from "./offer-export";
import {
  getMissingFields,
  getOfferPages,
  INITIAL_DRAFT,
  OFFICE_DAYS,
  SCHEDULE_OPTIONS,
  TIME_OPTIONS,
  type BonusPeriod,
  type OfferDraft,
  type OfferTask,
  type PayType,
  type ScheduleValue,
  type TimeValue,
  type WorkMode,
} from "./offer-model";
import { OfferPages } from "./OfferPages";

const FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted/70 hover:border-brand/50 focus:border-brand";
const GROUP_CLASS = "mt-3 rounded-xl border border-border bg-background/60 p-4";

function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-1 text-danger">
      *
    </span>
  );
}

function TextField({
  label,
  value,
  type = "text",
  required,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  type?: "text" | "date";
  required?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      {required ? <RequiredMark /> : null}
      <input
        className={FIELD_CLASS}
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  required,
  placeholder,
  note,
  onChange,
}: {
  label: string;
  value: string;
  required?: boolean;
  placeholder?: string;
  note?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      {required ? <RequiredMark /> : null}
      <textarea
        className={`${FIELD_CLASS} min-h-20 resize-y`}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {note ? <span className="mt-1 block text-xs font-normal text-muted">{note}</span> : null}
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  required,
  children,
  onChange,
}: {
  label: string;
  value: T;
  required?: boolean;
  children: ReactNode;
  onChange: (value: T) => void;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      {required ? <RequiredMark /> : null}
      <select
        className={FIELD_CLASS}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {children}
      </select>
    </label>
  );
}

function EditorSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="rounded-xl border border-border bg-surface" open>
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-foreground">
        {title}
      </summary>
      <div className="space-y-4 border-t border-border px-4 py-4">{children}</div>
    </details>
  );
}

function scheduleOptions() {
  return SCHEDULE_OPTIONS.map((option) => (
    <option key={option.value || "empty"} value={option.value}>
      {option.label}
    </option>
  ));
}

function timeOptions() {
  return TIME_OPTIONS.map((option) => (
    <option key={option.value || "empty"} value={option.value}>
      {option.label}
    </option>
  ));
}

function taskId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function OfferCenterBuilder() {
  const [draft, setDraft] = useState<OfferDraft>(INITIAL_DRAFT);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [overflowLabels, setOverflowLabels] = useState<string[]>([]);
  const [busy, setBusy] = useState<OfferExportKind | null>(null);
  const [exportStatus, setExportStatus] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  const requests = useSyncExternalStore(
    (onStoreChange) => subscribeRequests(() => onStoreChange()),
    getAllRequestsSnapshot,
    getAllRequestsSnapshot,
  );
  const assignedRequests = useMemo(
    () => requests.filter((request) => request.status === "assigned"),
    [requests],
  );

  const updateField = <K extends keyof OfferDraft>(field: K, value: OfferDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setConfirmed(false);
    setExportStatus("");
  };

  const updateTask = (id: string, patch: Partial<OfferTask>) => {
    updateField(
      "tasks",
      draft.tasks.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const missingLabels = getMissingFields(draft);
  const pageCount = 1 + getOfferPages(draft).length;

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      const overflow = Array.from(
        previewRef.current?.querySelectorAll<HTMLElement>("[data-overflow-check]") ?? [],
      )
        .filter((element) => element.clientHeight > 0 && element.scrollHeight > element.clientHeight + 1)
        .map((element) => element.dataset.overflowLabel || "Страница оффера");
      setOverflowLabels((current) =>
        current.join("|") === overflow.join("|") ? current : overflow,
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [draft]);

  const canExport =
    confirmed && missingLabels.length === 0 && overflowLabels.length === 0 && busy === null;

  const resetDraft = () => {
    setDraft(INITIAL_DRAFT);
    setSelectedRequestId("");
    setConfirmed(false);
    setExportStatus("");
  };

  const selectRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    const request = assignedRequests.find((item) => item.id === requestId);
    if (!request) return;
    setDraft((current) => ({
      ...current,
      position: request.position,
      department: request.department,
    }));
    setConfirmed(false);
    setExportStatus(
      "Из заявки подставлены только должность и подразделение. Остальные условия не изменены.",
    );
  };

  const handleExport = async (kind: OfferExportKind) => {
    if (!canExport) return;
    setBusy(kind);
    setExportStatus(
      kind === "pdf"
        ? "Готовим PDF…"
        : kind === "png"
          ? "Готовим ZIP со всеми PNG…"
          : "Готовим PPTX…",
    );
    try {
      await exportOffer(kind, draft);
      setExportStatus(
        kind === "pdf"
          ? "PDF скачан."
          : kind === "png"
            ? "ZIP со всеми PNG скачан."
            : "PPTX скачан.",
      );
    } catch (error) {
      setExportStatus(error instanceof Error ? error.message : "Не удалось создать файл.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid items-start gap-8 2xl:grid-cols-[minmax(520px,0.95fr)_minmax(600px,1.05fr)]">
      <form
        aria-label="Параметры оффера"
        className="min-w-0 space-y-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Данные оффера</h2>
              <p className="mt-1 text-sm text-muted">
                Поля и условные списки повторяют переданный генератор.
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={resetDraft}>
              Сбросить пример
            </Button>
          </div>

          <div className="mt-5">
            <SelectField
              label="Заявка в поиске"
              value={selectedRequestId}
              onChange={selectRequest}
            >
              <option value="">Не связывать с заявкой</option>
              {assignedRequests.map((request) => (
                <option key={request.id} value={request.id}>
                  {request.position} · {request.department}
                </option>
              ))}
            </SelectField>
            <p className="mt-2 text-xs text-muted">
              Сейчас это тестовые заявки браузера. Подставляются только должность и подразделение —
              компенсация и другие условия не придумываются.
            </p>
          </div>
        </div>

        <EditorSection title="Кандидат и роль">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Имя кандидата"
              value={draft.candidateName}
              required
              placeholder="Имя кандидата"
              onChange={(value) => updateField("candidateName", value)}
            />
            <TextField
              label="Должность"
              value={draft.position}
              required
              placeholder="Название должности"
              onChange={(value) => updateField("position", value)}
            />
            <TextAreaField
              label="Подразделение"
              value={draft.department}
              required
              placeholder="Подразделение"
              onChange={(value) => updateField("department", value)}
            />
            <TextField
              label="Дата выхода"
              value={draft.startDate}
              type="date"
              required
              onChange={(value) => updateField("startDate", value)}
            />
          </div>

          <div className={GROUP_CLASS}>
            <h3 className="text-sm font-semibold text-foreground">Формат работы</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <SelectField<WorkMode>
                label="Где работает сотрудник"
                value={draft.workMode}
                required
                onChange={(value) => updateField("workMode", value)}
              >
                <option value="">Выберите формат</option>
                <option value="remote">Дистанционный</option>
                <option value="office">Офис Москва</option>
                <option value="hybrid">Гибридный</option>
                <option value="other">Другое</option>
              </SelectField>

              {draft.workMode === "remote" ? (
                <TextField
                  label="Город сотрудника"
                  value={draft.workCity}
                  required
                  placeholder="Введите город"
                  onChange={(value) => updateField("workCity", value)}
                />
              ) : null}
              {draft.workMode === "other" ? (
                <TextField
                  label="Другой формат"
                  value={draft.workModeOther}
                  required
                  placeholder="Введите формат вручную"
                  onChange={(value) => updateField("workModeOther", value)}
                />
              ) : null}
            </div>

            {draft.workMode === "hybrid" ? (
              <fieldset className="mt-4">
                <legend className="text-sm font-medium text-foreground">
                  Дни посещения офиса
                  <RequiredMark />
                </legend>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {OFFICE_DAYS.map((day) => (
                    <label
                      className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-border bg-surface px-2 py-2 text-xs text-foreground"
                      key={day.value}
                    >
                      <input
                        type="checkbox"
                        checked={draft.officeDays.includes(day.value)}
                        className="size-4 accent-brand"
                        onChange={(event) =>
                          updateField(
                            "officeDays",
                            event.target.checked
                              ? [...draft.officeDays, day.value]
                              : draft.officeDays.filter((value) => value !== day.value),
                          )
                        }
                      />
                      {day.short}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <SelectField<ScheduleValue>
                label="График"
                value={draft.workSchedule}
                required
                onChange={(value) => updateField("workSchedule", value)}
              >
                {scheduleOptions()}
              </SelectField>
              {draft.workSchedule === "other" ? (
                <TextField
                  label="Другой график"
                  value={draft.workScheduleOther}
                  required
                  placeholder="Введите график вручную"
                  onChange={(value) => updateField("workScheduleOther", value)}
                />
              ) : null}

              <SelectField<TimeValue>
                label="Время работы"
                value={draft.workTime}
                required
                onChange={(value) => updateField("workTime", value)}
              >
                {timeOptions()}
              </SelectField>
              {draft.workTime === "other" ? (
                <TextField
                  label="Другое время работы"
                  value={draft.workTimeOther}
                  required
                  placeholder="Введите время вручную"
                  onChange={(value) => updateField("workTimeOther", value)}
                />
              ) : null}
            </div>

            <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-surface px-3 py-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={draft.hasTraining}
                className="size-4 accent-brand"
                onChange={(event) => updateField("hasTraining", event.target.checked)}
              />
              Добавить график обучения
            </label>

            {draft.hasTraining ? (
              <div className="mt-3 rounded-lg border border-brand/20 bg-brand-tint p-3">
                <p className="mb-3 text-xs font-semibold text-muted">
                  Для сотрудников технической поддержки
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField<ScheduleValue>
                    label="График на время обучения"
                    value={draft.trainingSchedule}
                    required
                    onChange={(value) => updateField("trainingSchedule", value)}
                  >
                    {scheduleOptions()}
                  </SelectField>
                  {draft.trainingSchedule === "other" ? (
                    <TextField
                      label="Другой график обучения"
                      value={draft.trainingScheduleOther}
                      required
                      onChange={(value) => updateField("trainingScheduleOther", value)}
                    />
                  ) : null}
                  <SelectField<TimeValue>
                    label="Время обучения"
                    value={draft.trainingTime}
                    required
                    onChange={(value) => updateField("trainingTime", value)}
                  >
                    {timeOptions()}
                  </SelectField>
                  {draft.trainingTime === "other" ? (
                    <TextField
                      label="Другое время обучения"
                      value={draft.trainingTimeOther}
                      required
                      onChange={(value) => updateField("trainingTimeOther", value)}
                    />
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Руководитель"
              value={draft.manager}
              required
              placeholder="ФИО руководителя"
              onChange={(value) => updateField("manager", value)}
            />
            <TextAreaField
              label="Должность руководителя"
              value={draft.managerRole}
              required
              placeholder="Должность руководителя"
              onChange={(value) => updateField("managerRole", value)}
            />
            <TextField
              label="Ответ до"
              value={draft.answerDate}
              type="date"
              required
              onChange={(value) => updateField("answerDate", value)}
            />
          </div>
        </EditorSection>

        <EditorSection title="Оплата труда">
          <TextAreaField
            label="Основной блок"
            value={draft.incomeMain}
            required
            placeholder="Например: Совокупный доход состоит из"
            onChange={(value) => updateField("incomeMain", value)}
          />

          <div className={GROUP_CLASS}>
            <h3 className="text-sm font-semibold text-foreground">Часовая ставка / оклад</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <SelectField<PayType>
                label="Тип оплаты"
                value={draft.payType}
                onChange={(value) => updateField("payType", value)}
              >
                <option value="">Не добавлять блок</option>
                <option value="salary">Оклад</option>
                <option value="hourly">Часовая ставка</option>
              </SelectField>
              <TextField
                label="Сумма"
                value={draft.payAmount}
                placeholder="Введите сумму"
                onChange={(value) => updateField("payAmount", value)}
              />
            </div>
          </div>

          <div className={GROUP_CLASS}>
            <h3 className="text-sm font-semibold text-foreground">Бонус</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <SelectField<BonusPeriod>
                label="Периодичность бонуса"
                value={draft.bonusPeriod}
                onChange={(value) => updateField("bonusPeriod", value)}
              >
                <option value="">Не добавлять блок</option>
                <option value="Квартальный">Квартальный</option>
                <option value="Полугодовой">Полугодовой</option>
                <option value="Годовой">Годовой</option>
                <option value="other">Другое</option>
              </SelectField>
              {draft.bonusPeriod === "other" ? (
                <TextField
                  label="Другая периодичность"
                  value={draft.bonusPeriodOther}
                  onChange={(value) => updateField("bonusPeriodOther", value)}
                />
              ) : null}
              <TextField
                label="Сумма бонуса"
                value={draft.bonusAmount}
                placeholder="Введите сумму"
                onChange={(value) => updateField("bonusAmount", value)}
              />
            </div>
          </div>

          <TextAreaField
            label="Компенсация"
            value={draft.incomeComp}
            placeholder="Компенсации"
            onChange={(value) => updateField("incomeComp", value)}
          />
        </EditorSection>

        <EditorSection title="Преимущества">
          <div className="rounded-lg border border-border bg-background/60 px-3 py-3 text-sm text-foreground">
            ДМС · Страховая компания &quot;Лучи&quot; + Английский язык · SkyEng
          </div>
        </EditorSection>

        <EditorSection title="Вторая страница: задачи">
          <TextField
            label="Подзаголовок"
            value={draft.tasksSubtitle}
            placeholder="Подзаголовок второй страницы"
            onChange={(value) => updateField("tasksSubtitle", value)}
          />

          <div className="space-y-3">
            {draft.tasks.map((item, index) => (
              <div
                className="rounded-xl border border-border bg-background/60 p-4"
                key={item.id}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground">Блок {index + 1}</h3>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      updateField(
                        "tasks",
                        draft.tasks.filter((task) => task.id !== item.id),
                      )
                    }
                  >
                    Удалить
                  </Button>
                </div>
                <div className="space-y-3">
                  <TextAreaField
                    label="Задача"
                    value={item.task}
                    placeholder="Опишите задачу сотрудника"
                    onChange={(value) => updateTask(item.id, { task: value })}
                  />
                  <TextAreaField
                    label="Ожидаемый результат"
                    value={item.result}
                    placeholder="Необязательно"
                    note="Если поле пустое, в оффере остаётся задача без блока результата и без смены шрифта."
                    onChange={(value) => updateTask(item.id, { result: value })}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              updateField("tasks", [...draft.tasks, { id: taskId(), task: "", result: "" }])
            }
          >
            + Добавить задачу
          </Button>
        </EditorSection>

        <div className="rounded-2xl border border-brand/20 bg-brand-tint p-5">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={confirmed}
              className="mt-0.5 size-4 accent-brand"
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            <span>
              Я проверил(а) все страницы, даты, формат работы, оплату и задачи.
              <span className="mt-1 block text-xs text-muted">
                После любого изменения подтверждение нужно поставить заново.
              </span>
            </span>
          </label>

          <p className="mt-3 text-xs text-muted" role="status" aria-live="polite">
            {missingLabels.length > 0
              ? `Осталось заполнить: ${missingLabels.join(", ")}.`
              : overflowLabels.length > 0
                ? `Текст не помещается: ${overflowLabels.join(", ")}. Сократите текст или добавьте задачи отдельными блоками.`
                : confirmed
                  ? `Оффер проверен: ${pageCount} стр. Можно скачивать.`
                  : "Все обязательные поля заполнены. Проверьте страницы и подтвердите."}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" disabled={!canExport} onClick={() => handleExport("pdf")}>
              {busy === "pdf" ? "Готовим PDF…" : "Скачать PDF"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!canExport}
              onClick={() => handleExport("png")}
            >
              {busy === "png" ? "Готовим PNG…" : "Все страницы PNG"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!canExport}
              onClick={() => handleExport("pptx")}
            >
              {busy === "pptx" ? "Готовим PPTX…" : "Скачать PPTX"}
            </Button>
          </div>
          {exportStatus ? (
            <p className="mt-3 text-xs text-muted" aria-live="polite">
              {exportStatus}
            </p>
          ) : null}
        </div>
      </form>

      <section className="min-w-0 2xl:sticky 2xl:top-6" aria-labelledby="offer-preview-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground" id="offer-preview-title">
            Предпросмотр
          </h2>
          <span className="rounded-full bg-success-tint px-3 py-1 text-xs font-medium text-success">
            {pageCount} стр. · 569 × 1013
          </span>
        </div>
        <div
          className="flex max-h-[calc(100vh-120px)] min-w-0 flex-col gap-7 overflow-auto rounded-2xl border border-border bg-[#e9eef6] p-4"
          ref={previewRef}
        >
          <OfferPages draft={draft} />
        </div>
      </section>
    </div>
  );
}
