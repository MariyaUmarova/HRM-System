import { currentWorkWeek } from "@/lib/format";
import { RECRUITERS, VACANCIES } from "./seed";
import type { WeeklyFocus } from "./types";

export function createWeeklyFocusSeed(): WeeklyFocus {
  const { start, end } = currentWorkWeek();
  return {
    rangeStart: start,
    rangeEnd: end,
    items: [
      {
        id: "focus-1",
        title: "Закрыть первичный поиск Backend-разработчика",
        priorityNote: "Приоритет №1 — срок показа кандидатов истекает на этой неделе",
        vacancyRef: VACANCIES[0],
        ownerRecruiterId: "rec-1",
      },
      {
        id: "focus-2",
        title: "Согласовать профиль Продуктового дизайнера",
        priorityNote: "Нужен повторный бриф с заказчиком после правок макета",
        vacancyRef: VACANCIES[1],
        ownerRecruiterId: "rec-1",
      },
      {
        id: "focus-3",
        title: "Вернуться к отклику по DevOps-инженеру",
        priorityNote: "Поставлено на паузу до решения по бюджету",
        vacancyRef: VACANCIES[3],
        ownerRecruiterId: "rec-2",
      },
      {
        id: "focus-4",
        title: "Собрать команду интервьюеров для Sales-менеджера",
        priorityNote: "Совместное интервью нужно назначить до четверга",
        vacancyRef: VACANCIES[2],
        ownerRecruiterId: "rec-3",
      },
    ],
  };
}

export function recruiterName(id: string): string {
  return RECRUITERS.find((recruiter) => recruiter.id === id)?.name ?? id;
}
