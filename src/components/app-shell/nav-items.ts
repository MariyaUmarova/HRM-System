import type { AppArea } from "@/lib/auth/roles";

export interface NavItem {
  href: string;
  label: string;
  area: AppArea;
  icon: string;
  group?: "Рабочий процесс" | "Материалы";
}

/**
 * User-facing Recruit navigation. The full workflow remains a prominent Home
 * route instead of becoming a duplicate permanent sidebar entry. Deep routes
 * such as Offer Center, Interview Analysis, requests and platform management
 * remain available through contextual entry points.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Главная", area: "recruiter_home", icon: "⌂" },
  { href: "/", label: "Главная", area: "management_home", icon: "⌂" },
  {
    href: "/scenarios",
    label: "Рабочие ситуации",
    area: "knowledge_base",
    icon: "⚡",
    group: "Рабочий процесс",
  },
  { href: "/scripts", label: "Скрипты", area: "knowledge_base", icon: "✎", group: "Материалы" },
  {
    href: "/templates",
    label: "Шаблоны и чек-листы",
    area: "knowledge_base",
    icon: "⬇",
    group: "Материалы",
  },
  { href: "/tools", label: "Помощники", area: "knowledge_base", icon: "✦", group: "Материалы" },
  { href: "/hr-radar", label: "HR Radar", area: "hr_radar", icon: "▤", group: "Материалы" },
];
