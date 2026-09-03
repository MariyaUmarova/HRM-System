import Link from "next/link";
import { AccessDenied } from "@/components/access/AccessDenied";
import { InterviewAnalysisPrototype } from "@/components/interview-analysis/InterviewAnalysisPrototype";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";

export default async function InterviewAnalysisPage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "interview_analysis");

  if (!gate.allowed) {
    return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;
  }

  return (
    <div>
      <Link className="rr-back" href="/tools">← Помощники</Link>
      <InterviewAnalysisPrototype />
    </div>
  );
}
