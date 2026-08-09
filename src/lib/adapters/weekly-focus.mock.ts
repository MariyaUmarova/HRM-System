import { currentWorkWeek } from "../format";
import type { WeeklyFocusAdapter } from "./types";
import { CURRENT_RECRUITER_ID, RECRUITERS, VACANCIES } from "./seed";

const { start, end } = currentWorkWeek();

const ALL_ITEMS = [
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
];

/**
 * Mock weekly focus adapter. "Фокусы недели" are set by the Head of Recruitment
 * and refined at the Monday/Thursday team check-ins (see approved concept §8.1).
 */
export const weeklyFocusAdapter: WeeklyFocusAdapter = {
  async getFocusForRecruiter(recruiterId) {
    return {
      rangeStart: start,
      rangeEnd: end,
      items: ALL_ITEMS.filter((i) => i.ownerRecruiterId === recruiterId),
    };
  },
  async getTeamFocus() {
    return { rangeStart: start, rangeEnd: end, items: ALL_ITEMS };
  },
};

export function recruiterName(id: string): string {
  return RECRUITERS.find((r) => r.id === id)?.name ?? id;
}

export { CURRENT_RECRUITER_ID, RECRUITERS };
