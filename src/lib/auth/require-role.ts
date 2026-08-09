import { canAccess, ROLE_LABELS, type AppArea, type Role } from "./roles";

export interface RoleGateResult {
  allowed: boolean;
  requiredRoleLabel: string;
}

/** Pure guard used by both server pages and tests. */
export function checkAccess(role: Role, area: AppArea): RoleGateResult {
  const allowed = canAccess(role, area);
  const requiredRoleLabel = area === "requests_inbox" || area === "platform_management" || area === "management_home"
    ? "Руководитель подбора / HRD"
    : ROLE_LABELS[role];
  return { allowed, requiredRoleLabel };
}
