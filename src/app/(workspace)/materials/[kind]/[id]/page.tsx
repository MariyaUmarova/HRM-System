import { AccessDenied } from "@/components/access/AccessDenied";
import { RecruitMaterialDetail } from "@/components/recruit/RecruitMaterialDetail";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";

export default async function RecruitMaterialPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "knowledge_base");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  const { kind, id } = await params;
  return <RecruitMaterialDetail kind={kind} id={id} />;
}
