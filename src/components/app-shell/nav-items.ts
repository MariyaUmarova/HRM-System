import type { AppArea } from "@/lib/auth/roles";

export interface NavItem {
  href: string;
  label: string;
  area: AppArea;
}

/** Single source of truth for internal navigation, filtered per role by `area`. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Моя работа", area: "recruiter_home" },
  { href: "/", label: "Моя работа", area: "management_home" },
  { href: "/workflow", label: "Рабочий маршрут", area: "workflow" },
  { href: "/knowledge-base", label: "База знаний", area: "knowledge_base" },
  { href: "/requests", label: "Заявки заказчиков", area: "requests_inbox" },
  { href: "/offer-center", label: "Центр офферов", area: "offer_center" },
  { href: "/interview-analysis", label: "Анализ интервью", area: "interview_analysis" },
  { href: "/hr-radar", label: "HR-радар", area: "hr_radar" },
  { href: "/platform-management", label: "Управление платформой", area: "platform_management" },
];
