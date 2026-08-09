import { AccessDenied } from "@/components/access/AccessDenied";
import { LeadHome } from "@/components/home/LeadHome";
import { RecruiterHome } from "@/components/home/RecruiterHome";
import { getPreviewRole } from "@/lib/auth/session";
import { isManagementRole } from "@/lib/auth/roles";

export default async function HomePage() {
  const role = await getPreviewRole();

  if (role === "customer") {
    return <AccessDenied requiredRoleLabel="Рекрутер / Руководитель подбора / HRD" />;
  }

  return isManagementRole(role) ? <LeadHome role={role} /> : <RecruiterHome />;
}
