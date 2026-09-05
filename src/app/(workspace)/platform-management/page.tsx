import { AccessDenied } from "@/components/access/AccessDenied";
import { PlatformManagementPrototype } from "@/components/platform-management/PlatformManagementPrototype";
import { WeeklyFocusManager } from "@/components/platform-management/WeeklyFocusManager";
import { checkAccess } from "@/lib/auth/require-role";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { getPreviewRole } from "@/lib/auth/session";

export default async function PlatformManagementPage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "platform_management");

  if (!gate.allowed) {
    return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;
  }

  return (
    <div>
      <PlatformManagementPrototype managerLabel={ROLE_LABELS[role]} />
      <WeeklyFocusManager />
    </div>
  );
}
