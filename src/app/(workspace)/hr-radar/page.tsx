import { AccessDenied } from "@/components/access/AccessDenied";
import { HrRadar } from "@/components/hr-radar/HrRadar";
import { HR_NEWS_ITEMS, HR_NEWS_SOURCES } from "@/components/hr-radar/hr-news";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";

export default async function HrRadarPage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "hr_radar");

  if (!gate.allowed) {
    return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;
  }

  return <HrRadar items={HR_NEWS_ITEMS} sources={HR_NEWS_SOURCES} />;
}
