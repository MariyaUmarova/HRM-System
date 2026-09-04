import { notFound, redirect } from "next/navigation";
import { AccessDenied } from "@/components/access/AccessDenied";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StageDetail } from "@/components/workflow/StageDetail";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";
import { getStageById, WORKFLOW_STAGES } from "@/lib/workflow/stages";

export function generateStaticParams() {
  return WORKFLOW_STAGES.map((s) => ({ stage: s.id }));
}

export default async function StagePage({ params }: { params: Promise<{ stage: string }> }) {
  const { stage: stageId } = await params;
  const role = await getPreviewRole();
  const gate = checkAccess(role, "workflow");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  const stage = getStageById(stageId);
  if (!stage) notFound();
  if (stage.id === "adaptation") redirect("/backlog/adaptation");

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Рабочий маршрут", href: "/workflow" },
          { label: stage.title },
        ]}
      />
      <StageDetail stage={stage} />
    </div>
  );
}
