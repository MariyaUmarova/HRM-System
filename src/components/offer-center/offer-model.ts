export type WorkMode = "" | "remote" | "office" | "hybrid" | "other";
export type ScheduleValue = "" | "2/2" | "5/2" | "other";
export type TimeValue =
  | ""
  | "10:00–19:00"
  | "09:00–18:00"
  | "06:00–18:00"
  | "14:00–02:00"
  | "09:00–21:00"
  | "20:00–08:00"
  | "other";
export type PayType = "" | "salary" | "hourly";
export type BonusPeriod = "" | "Квартальный" | "Полугодовой" | "Годовой" | "other";
export type OfficeDay = "Понедельник" | "Вторник" | "Среда" | "Четверг" | "Пятница";

export interface OfferTask {
  id: string;
  task: string;
  result: string;
}

export interface OfferDraft {
  candidateName: string;
  position: string;
  department: string;
  startDate: string;
  workMode: WorkMode;
  workCity: string;
  workModeOther: string;
  officeDays: OfficeDay[];
  workSchedule: ScheduleValue;
  workScheduleOther: string;
  workTime: TimeValue;
  workTimeOther: string;
  hasTraining: boolean;
  trainingSchedule: ScheduleValue;
  trainingScheduleOther: string;
  trainingTime: TimeValue;
  trainingTimeOther: string;
  manager: string;
  managerRole: string;
  answerDate: string;
  incomeMain: string;
  payType: PayType;
  payAmount: string;
  bonusPeriod: BonusPeriod;
  bonusPeriodOther: string;
  bonusAmount: string;
  incomeComp: string;
  tasksSubtitle: string;
  tasks: OfferTask[];
}

export interface PaymentRow {
  text: string;
  main?: boolean;
}

export const OFFICE_DAYS: Array<{ value: OfficeDay; short: string }> = [
  { value: "Понедельник", short: "Пн" },
  { value: "Вторник", short: "Вт" },
  { value: "Среда", short: "Ср" },
  { value: "Четверг", short: "Чт" },
  { value: "Пятница", short: "Пт" },
];

export const SCHEDULE_OPTIONS: Array<{ value: ScheduleValue; label: string }> = [
  { value: "", label: "Выберите график" },
  { value: "2/2", label: "2/2" },
  { value: "5/2", label: "5/2" },
  { value: "other", label: "Другое" },
];

export const TIME_OPTIONS: Array<{ value: TimeValue; label: string }> = [
  { value: "", label: "Выберите время" },
  { value: "10:00–19:00", label: "10:00–19:00" },
  { value: "09:00–18:00", label: "09:00–18:00" },
  { value: "06:00–18:00", label: "06:00–18:00" },
  { value: "14:00–02:00", label: "14:00–02:00" },
  { value: "09:00–21:00", label: "09:00–21:00" },
  { value: "20:00–08:00", label: "20:00–08:00" },
  { value: "other", label: "Другое" },
];

export const INITIAL_DRAFT: OfferDraft = {
  candidateName: "Алексей",
  position: "Инженер техподдержки 2-й линии",
  department: "Инфраструктура",
  startDate: "2026-09-01",
  workMode: "hybrid",
  workCity: "",
  workModeOther: "",
  officeDays: ["Среда", "Четверг"],
  workSchedule: "5/2",
  workScheduleOther: "",
  workTime: "09:00–18:00",
  workTimeOther: "",
  hasTraining: false,
  trainingSchedule: "",
  trainingScheduleOther: "",
  trainingTime: "",
  trainingTimeOther: "",
  manager: "Тестовый руководитель",
  managerRole: "руководитель направления",
  answerDate: "2026-08-25",
  incomeMain: "Совокупный доход состоит из:",
  payType: "salary",
  payAmount: "000 000",
  bonusPeriod: "Полугодовой",
  bonusPeriodOther: "",
  bonusAmount: "000 000",
  incomeComp: "",
  tasksSubtitle: "Задачи и ожидаемые результаты на испытательный срок",
  tasks: [
    {
      id: "task-1",
      task: "Тестовая задача без ожидаемого результата",
      result: "",
    },
    {
      id: "task-2",
      task: "Тестовая задача с ожидаемым результатом",
      result: "Тестовый ожидаемый результат",
    },
  ],
};

export function displayDate(value: string): string {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}.${month}.${year}` : "—";
}

function selectedValue<T extends string>(value: T, other: string): string {
  return value === "other" ? other.trim() : value;
}

function joinDays(days: OfficeDay[]): string {
  if (days.length === 0) return "";
  if (days.length === 1) return days[0];
  return `${days.slice(0, -1).join(", ")} и ${days.at(-1)}`;
}

export function buildWorkFormat(draft: OfferDraft): string {
  let first = "";
  if (draft.workMode === "remote") {
    first = `Дистанционный, г. ${draft.workCity.trim() || "[город]"}`;
  }
  if (draft.workMode === "office") first = "Офис, г. Москва";
  if (draft.workMode === "hybrid") {
    const days = joinDays(draft.officeDays);
    first = `Гибридный, г. Москва${days ? `, ${days} каждой недели — посещение офиса` : ""}`;
  }
  if (draft.workMode === "other") first = draft.workModeOther.trim() || "[формат работы]";
  if (!first) first = "[формат работы]";

  const schedule = selectedValue(draft.workSchedule, draft.workScheduleOther);
  const time = selectedValue(draft.workTime, draft.workTimeOther);
  const lines = [first];
  if (schedule || time) {
    lines.push(`График: ${schedule || "[график]"}${time ? `, ${time} по Мск` : ""}`);
  }
  if (draft.hasTraining) {
    const trainingSchedule = selectedValue(draft.trainingSchedule, draft.trainingScheduleOther);
    const trainingTime = selectedValue(draft.trainingTime, draft.trainingTimeOther);
    lines.push(
      `*Обучение: график ${trainingSchedule || "[график]"}${trainingTime ? `, ${trainingTime} по Мск` : ""}`,
    );
  }
  return lines.join("\n");
}

export function getPaymentRows(draft: OfferDraft): PaymentRow[] {
  const rows: PaymentRow[] = [];
  if (draft.incomeMain.trim()) rows.push({ text: draft.incomeMain.trim(), main: true });

  if (draft.payType && draft.payAmount.trim()) {
    rows.push({
      text:
        draft.payType === "salary"
          ? `Оклад ${draft.payAmount.trim()} рублей в месяц до вычета НДФЛ`
          : `Часовая ставка ${draft.payAmount.trim()} рублей в час до вычета НДФЛ`,
    });
  }

  const period =
    draft.bonusPeriod === "other" ? draft.bonusPeriodOther.trim() : draft.bonusPeriod;
  if (period && draft.bonusAmount.trim()) {
    rows.push({
      text: `${period} бонус до ${draft.bonusAmount.trim()} рублей до вычета НДФЛ\nпри 100% выполнении KPI согласно корпоративной политике компании.`,
    });
  }

  if (draft.incomeComp.trim()) rows.push({ text: draft.incomeComp.trim() });
  return rows;
}

export function getOfferPages(draft: OfferDraft): OfferTask[][] {
  const tasks = draft.tasks.filter((item) => item.task.trim());
  if (tasks.length === 0) return [[]];

  const pages: OfferTask[][] = [];
  for (let index = 0; index < tasks.length; index += 4) {
    pages.push(tasks.slice(index, index + 4));
  }
  return pages;
}

export function getMissingFields(draft: OfferDraft): string[] {
  const missing: string[] = [];
  const required: Array<[string, string]> = [
    [draft.candidateName, "имя кандидата"],
    [draft.position, "должность"],
    [draft.department, "подразделение"],
    [draft.startDate, "дата выхода"],
    [draft.workMode, "формат работы"],
    [draft.workSchedule, "график"],
    [draft.workTime, "время работы"],
    [draft.manager, "руководитель"],
    [draft.managerRole, "должность руководителя"],
    [draft.answerDate, "срок ответа"],
    [draft.incomeMain, "основной блок оплаты"],
  ];
  required.forEach(([value, label]) => {
    if (!value.trim()) missing.push(label);
  });

  if (draft.workMode === "remote" && !draft.workCity.trim()) {
    missing.push("город сотрудника");
  }
  if (draft.workMode === "hybrid" && draft.officeDays.length === 0) {
    missing.push("дни посещения офиса");
  }
  if (draft.workMode === "other" && !draft.workModeOther.trim()) {
    missing.push("другой формат работы");
  }
  if (draft.workSchedule === "other" && !draft.workScheduleOther.trim()) {
    missing.push("другой график");
  }
  if (draft.workTime === "other" && !draft.workTimeOther.trim()) {
    missing.push("другое время работы");
  }
  if (draft.hasTraining) {
    if (!draft.trainingSchedule) missing.push("график обучения");
    if (draft.trainingSchedule === "other" && !draft.trainingScheduleOther.trim()) {
      missing.push("другой график обучения");
    }
    if (!draft.trainingTime) missing.push("время обучения");
    if (draft.trainingTime === "other" && !draft.trainingTimeOther.trim()) {
      missing.push("другое время обучения");
    }
  }
  if (draft.payType && !draft.payAmount.trim()) missing.push("сумма оплаты");
  if (!draft.payType && draft.payAmount.trim()) missing.push("тип оплаты");
  if (draft.bonusPeriod && !draft.bonusAmount.trim()) missing.push("сумма бонуса");
  if (!draft.bonusPeriod && draft.bonusAmount.trim()) missing.push("периодичность бонуса");
  if (draft.bonusPeriod === "other" && !draft.bonusPeriodOther.trim()) {
    missing.push("другая периодичность бонуса");
  }

  const hasTask = draft.tasks.some((item) => item.task.trim());
  if (!hasTask) missing.push("минимум одна задача");
  if (draft.tasks.some((item) => item.result.trim() && !item.task.trim())) {
    missing.push("задача для заполненного ожидаемого результата");
  }
  return missing;
}
