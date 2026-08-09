/**
 * Role model for the Phase 1 development-only role preview.
 *
 * There is no real authentication yet (see CLAUDE.md: SSO is mocked in later phases).
 * A single cookie selects which role's experience is rendered. Head of Recruitment
 * and HRD always share the same platform-management permissions — there is no
 * separate Admin role in this product.
 */

export const ROLES = [
  "recruiter",
  "head_of_recruitment",
  "hrd",
  "customer",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  recruiter: "Рекрутер",
  head_of_recruitment: "Руководитель подбора",
  hrd: "HRD",
  customer: "Заказчик (изолированный просмотр)",
};

/** Head of Recruitment and HRD share one management permission group by design. */
export const MANAGEMENT_ROLES: Role[] = ["head_of_recruitment", "hrd"];

export function isManagementRole(role: Role): boolean {
  return MANAGEMENT_ROLES.includes(role);
}

/**
 * Named areas of the product. Each internal page declares which areas it belongs to
 * and is guarded with `canAccess`. Customer is intentionally excluded from every
 * internal area — the customer only ever reaches the isolated `/c/[token]` shell,
 * which does not use this permission system at all.
 */
export type AppArea =
  | "recruiter_home"
  | "management_home"
  | "workflow"
  | "knowledge_base"
  | "offer_center"
  | "interview_analysis"
  | "hr_radar"
  | "requests_inbox"
  | "platform_management";

const AREA_ACCESS: Record<AppArea, Role[]> = {
  recruiter_home: ["recruiter"],
  management_home: ["head_of_recruitment", "hrd"],
  workflow: ["recruiter", "head_of_recruitment", "hrd"],
  knowledge_base: ["recruiter", "head_of_recruitment", "hrd"],
  offer_center: ["recruiter", "head_of_recruitment", "hrd"],
  interview_analysis: ["recruiter", "head_of_recruitment", "hrd"],
  hr_radar: ["recruiter", "head_of_recruitment", "hrd"],
  requests_inbox: ["head_of_recruitment", "hrd"],
  platform_management: ["head_of_recruitment", "hrd"],
};

export function canAccess(role: Role, area: AppArea): boolean {
  return AREA_ACCESS[area].includes(role);
}

export function homeAreaFor(role: Role): AppArea {
  return isManagementRole(role) ? "management_home" : "recruiter_home";
}

export const PREVIEW_ROLE_COOKIE = "hr_hub_preview_role";
export const DEFAULT_ROLE: Role = "recruiter";

export function parseRole(value: string | undefined | null): Role {
  if (value && (ROLES as readonly string[]).includes(value)) {
    return value as Role;
  }
  return DEFAULT_ROLE;
}
