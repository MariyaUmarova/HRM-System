/**
 * Synthetic, non-personal seed data shared by the mock adapters. Nothing here
 * represents a real candidate, vacancy or person — see CLAUDE.md: "Use mock and
 * synthetic data only."
 */
import type { HuntflowCandidateRef, HuntflowVacancyRef, Recruiter } from "./types";

export const RECRUITERS: Recruiter[] = [
  { id: "rec-1", name: "Дарья Соколова" },
  { id: "rec-2", name: "Игорь Панин" },
  { id: "rec-3", name: "Мария Крылова" },
];

export const CURRENT_RECRUITER_ID = "rec-1";

export const VACANCIES: HuntflowVacancyRef[] = [
  {
    externalId: "hf-vac-2201",
    title: "Backend-разработчик (Go)",
    department: "Платформа видеонаблюдения",
    huntflowUrl: "https://huntflow.example/vacancy/2201",
  },
  {
    externalId: "hf-vac-2214",
    title: "Продуктовый дизайнер",
    department: "Продукт",
    huntflowUrl: "https://huntflow.example/vacancy/2214",
  },
  {
    externalId: "hf-vac-2230",
    title: "Менеджер по продажам B2B",
    department: "Коммерция",
    huntflowUrl: "https://huntflow.example/vacancy/2230",
  },
  {
    externalId: "hf-vac-2241",
    title: "DevOps-инженер",
    department: "Инфраструктура",
    huntflowUrl: "https://huntflow.example/vacancy/2241",
  },
];

export const CANDIDATES: HuntflowCandidateRef[] = [
  {
    externalId: "hf-cand-9001",
    name: "Кандидат А-9001",
    vacancyExternalId: "hf-vac-2201",
    stage: "Согласование оффера",
    huntflowUrl: "https://huntflow.example/vacancy/2201/candidate/9001",
  },
  {
    externalId: "hf-cand-9002",
    name: "Кандидат Б-9002",
    vacancyExternalId: "hf-vac-2214",
    stage: "HR-интервью",
    huntflowUrl: "https://huntflow.example/vacancy/2214/candidate/9002",
  },
  {
    externalId: "hf-cand-9003",
    name: "Кандидат В-9003",
    vacancyExternalId: "hf-vac-2230",
    stage: "Совместное интервью",
    huntflowUrl: "https://huntflow.example/vacancy/2230/candidate/9003",
  },
];
