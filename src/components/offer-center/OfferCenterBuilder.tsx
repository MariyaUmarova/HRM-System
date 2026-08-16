"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface OfferDraft {
  candidateName: string;
  position: string;
  department: string;
  startDate: string;
  workFormat: string;
  office: string;
  schedule: string;
  managerName: string;
  managerTitle: string;
  salary: string;
  bonus: string;
  bonusTerms: string;
  benefits: string;
  responseDate: string;
}

const INITIAL_DRAFT: OfferDraft = {
  candidateName: "Алексей",
  position: "ПРОДУКТОВЫЙ АНАЛИТИК",
  department: "Департамент продукта",
  startDate: "2026-09-01",
  workFormat: "Гибрид в Москве",
  office: "Корпоративный офис",
  schedule: "5/2, 9:00–18:00",
  managerName: "Тестовый руководитель",
  managerTitle: "руководитель направления",
  salary: "000 000 ₽ gross",
  bonus: "000 000 ₽ gross",
  bonusTerms: "при 100% выполнении KPI согласно корпоративной политике компании",
  benefits: "ДМС • Английский язык",
  responseDate: "2026-08-25",
};

const REQUIRED_FIELDS: Array<{ key: keyof OfferDraft; label: string }> = [
  { key: "candidateName", label: "имя кандидата" },
  { key: "position", label: "должность" },
  { key: "department", label: "отдел" },
  { key: "startDate", label: "дата выхода" },
  { key: "workFormat", label: "формат работы" },
  { key: "managerName", label: "руководитель" },
  { key: "salary", label: "оклад" },
  { key: "responseDate", label: "срок ответа" },
];

const FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted/70 hover:border-brand/50 focus:border-brand";

function TextField({
  label,
  name,
  value,
  type = "text",
  required = false,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  type?: "text" | "date";
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      {required ? <span aria-hidden="true" className="ml-1 text-danger">*</span> : null}
      <input
        className={FIELD_CLASS}
        name={name}
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <textarea
        className={FIELD_CLASS + " min-h-20 resize-y"}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function displayDate(value: string) {
  const [year, month, day] = value.split("-");
  return year && month && day ? day + "." + month + "." + year : "—";
}

function OfferPreview({ draft }: { draft: OfferDraft }) {
  return (
    <section
      aria-label="Предпросмотр оффера"
      data-offer-print
      className="relative mx-auto aspect-[9/16] w-full max-w-[460px] overflow-hidden rounded-[28px] bg-white text-[#102248] shadow-[0_24px_70px_rgba(22,87,209,0.18)]"
    >
      <header className="relative h-[25%] overflow-hidden bg-[#1856d2] px-[8%] pb-[5%] pt-[7%] text-white">
        <div className="absolute -right-[18%] -top-[45%] h-[165%] w-[72%] rotate-12 rounded-[50%] border-[24px] border-white/10" />
        <div className="absolute -right-[4%] -top-[12%] h-[76%] w-[42%] rounded-bl-[80%] bg-[#2f74ee]/70" />
        <p className="relative text-[clamp(12px,2.8vw,18px)] font-semibold tracking-tight">ivideon</p>
        <div className="relative mt-[7%] inline-flex rounded-full border border-white/70 px-[5%] py-[1.8%] text-[clamp(10px,2.2vw,15px)] font-medium tracking-[0.18em]">
          JOB OFFER
        </div>
      </header>

      <div className="flex h-[57%] flex-col px-[8%] py-[5%]">
        <div>
          <h2 className="text-[clamp(17px,4.1vw,27px)] font-semibold leading-tight text-[#1657d1]">
            {draft.candidateName.trim() || "Кандидат"}, привет!
          </h2>
          <p className="mt-[2.5%] inline-flex rounded-full bg-[#eaf1fd] px-[4%] py-[1.8%] text-[clamp(9px,2vw,13px)] font-semibold tracking-[0.04em] text-[#164fb6]">
            {draft.position.trim() || "ДОЛЖНОСТЬ"}
          </p>
        </div>

        <div className="mt-[4%] grid grid-cols-2 gap-x-[5%] gap-y-[3%] text-[clamp(8px,1.75vw,12px)] leading-snug">
          <div>
            <p className="font-medium text-[#60708d]">Отдел</p>
            <p className="mt-1 font-semibold">{draft.department || "—"}</p>
          </div>
          <div>
            <p className="font-medium text-[#60708d]">Дата выхода</p>
            <p className="mt-1 font-semibold">{displayDate(draft.startDate)}</p>
          </div>
          <div>
            <p className="font-medium text-[#60708d]">Формат работы</p>
            <p className="mt-1 font-semibold">{draft.workFormat || "—"}</p>
            <p className="text-[#60708d]">{draft.office}</p>
          </div>
          <div>
            <p className="font-medium text-[#60708d]">График</p>
            <p className="mt-1 font-semibold">{draft.schedule || "—"}</p>
          </div>
          <div className="col-span-2">
            <p className="font-medium text-[#60708d]">Руководитель</p>
            <p className="mt-1 font-semibold">
              {draft.managerName || "—"}
              {draft.managerTitle ? ", " + draft.managerTitle : ""}
            </p>
          </div>
        </div>

        <div className="mt-[4%] rounded-[14px] bg-[#f3f7ff] px-[4%] py-[3%] text-[clamp(8px,1.7vw,11px)] leading-snug">
          <div className="grid grid-cols-2 gap-[4%]">
            <div>
              <p className="text-[#60708d]">Оклад в месяц</p>
              <p className="mt-1 font-semibold text-[#164fb6]">{draft.salary || "—"}</p>
            </div>
            <div>
              <p className="text-[#60708d]">Полугодовой бонус</p>
              <p className="mt-1 font-semibold text-[#164fb6]">{draft.bonus || "—"}</p>
            </div>
          </div>
          <p className="mt-[2%] text-[#60708d]">{draft.bonusTerms}</p>
        </div>

        <div className="mt-[3%] text-[clamp(8px,1.7vw,11px)]">
          <p className="font-medium text-[#60708d]">Что ещё входит</p>
          <p className="mt-1 font-semibold">{draft.benefits || "—"}</p>
        </div>
      </div>

      <footer className="relative flex h-[18%] items-center overflow-hidden bg-[#1856d2] px-[8%] text-white">
        <div className="absolute -bottom-[55%] -right-[7%] h-[155%] w-[42%] rotate-12 rounded-[45%] bg-white/10" />
        <div className="relative max-w-[76%]">
          <p className="text-[clamp(12px,2.8vw,18px)] font-semibold leading-tight">
            Будем рады видеть тебя в команде!
          </p>
          <p className="mt-[3%] text-[clamp(7px,1.5vw,10px)] leading-snug text-white/90">
            Ждём ответ до {displayDate(draft.responseDate)}. Условия предложения конфиденциальны.
          </p>
        </div>
        <div aria-hidden="true" className="absolute bottom-[16%] right-[8%] flex h-[42%] w-[9%] flex-col justify-around rounded-full bg-[#0c2f77] p-[1.5%]">
          <span className="aspect-square rounded-full bg-[#ff6b5f]" />
          <span className="aspect-square rounded-full bg-[#ffd34d]" />
          <span className="aspect-square rounded-full bg-[#49d17d]" />
        </div>
      </footer>
    </section>
  );
}

export function OfferCenterBuilder() {
  const [draft, setDraft] = useState<OfferDraft>(INITIAL_DRAFT);
  const [confirmed, setConfirmed] = useState(false);

  const updateField = (field: keyof OfferDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setConfirmed(false);
  };

  const missingLabels = REQUIRED_FIELDS.reduce<string[]>((missing, field) => {
    if (!draft[field.key].trim()) missing.push(field.label);
    return missing;
  }, []);
  const canPrint = confirmed && missingLabels.length === 0;

  const handlePrint = () => {
    if (canPrint) window.print();
  };

  const resetDraft = () => {
    setDraft(INITIAL_DRAFT);
    setConfirmed(false);
  };

  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)]">
      <form
        aria-label="Параметры оффера"
        className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          handlePrint();
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Данные оффера</h2>
            <p className="mt-1 text-sm text-muted">
              Изменения сразу отражаются в предпросмотре справа.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={resetDraft}>
            Сбросить пример
          </Button>
        </div>

        <fieldset className="mt-6">
          <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Кандидат и роль
          </legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <TextField
              label="Имя кандидата"
              name="candidateName"
              value={draft.candidateName}
              required
              onChange={(value) => updateField("candidateName", value)}
            />
            <TextField
              label="Должность"
              name="position"
              value={draft.position}
              required
              onChange={(value) => updateField("position", value)}
            />
            <TextField
              label="Отдел"
              name="department"
              value={draft.department}
              required
              onChange={(value) => updateField("department", value)}
            />
            <TextField
              label="Дата выхода"
              name="startDate"
              type="date"
              value={draft.startDate}
              required
              onChange={(value) => updateField("startDate", value)}
            />
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Условия работы
          </legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <TextField
              label="Формат работы"
              name="workFormat"
              value={draft.workFormat}
              required
              onChange={(value) => updateField("workFormat", value)}
            />
            <TextField
              label="Офис или адрес"
              name="office"
              value={draft.office}
              onChange={(value) => updateField("office", value)}
            />
            <TextField
              label="График"
              name="schedule"
              value={draft.schedule}
              onChange={(value) => updateField("schedule", value)}
            />
            <TextField
              label="Руководитель"
              name="managerName"
              value={draft.managerName}
              required
              onChange={(value) => updateField("managerName", value)}
            />
            <div className="sm:col-span-2">
              <TextField
                label="Должность руководителя"
                name="managerTitle"
                value={draft.managerTitle}
                onChange={(value) => updateField("managerTitle", value)}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Вознаграждение и бенефиты
          </legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <TextField
              label="Оклад"
              name="salary"
              value={draft.salary}
              required
              onChange={(value) => updateField("salary", value)}
            />
            <TextField
              label="Полугодовой бонус"
              name="bonus"
              value={draft.bonus}
              onChange={(value) => updateField("bonus", value)}
            />
            <div className="sm:col-span-2">
              <TextAreaField
                label="Условия бонуса"
                name="bonusTerms"
                value={draft.bonusTerms}
                onChange={(value) => updateField("bonusTerms", value)}
              />
            </div>
            <div className="sm:col-span-2">
              <TextField
                label="Бенефиты"
                name="benefits"
                value={draft.benefits}
                onChange={(value) => updateField("benefits", value)}
              />
            </div>
            <TextField
              label="Ждём ответ до"
              name="responseDate"
              type="date"
              value={draft.responseDate}
              required
              onChange={(value) => updateField("responseDate", value)}
            />
          </div>
        </fieldset>

        <div className="mt-6 rounded-xl border border-brand/20 bg-brand-tint p-4">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={confirmed}
              className="mt-0.5 size-4 accent-brand"
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            <span>
              Я проверил(а) имя, должность, даты, формат работы и условия оплаты.
              <span className="mt-1 block text-xs text-muted">
                После любого изменения подтверждение нужно поставить заново.
              </span>
            </span>
          </label>
          <p className="mt-3 text-xs text-muted" role="status">
            {missingLabels.length > 0
              ? "Осталось заполнить: " + missingLabels.join(", ") + "."
              : confirmed
                ? "Оффер проверен и готов к печати."
                : "Все обязательные поля заполнены. Подтвердите проверку."}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={!canPrint}>
            Печать / сохранить PDF
          </Button>
          <p className="text-xs text-muted">
            Откроется системное окно браузера; выберите «Сохранить как PDF».
          </p>
        </div>
      </form>

      <div className="xl:sticky xl:top-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">Предпросмотр</h2>
          <span className="rounded-full bg-warning-tint px-3 py-1 text-xs font-medium text-warning">
            Прототип · 1 страница
          </span>
        </div>
        <OfferPreview draft={draft} />
      </div>
    </div>
  );
}
