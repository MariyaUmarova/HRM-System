import { LinkButton } from "@/components/ui/Button";
import { draftArtifactsAdapter } from "@/lib/adapters/offers.mock";
import { offerApprovalsAdapter } from "@/lib/adapters/offers.mock";
import { CURRENT_RECRUITER_ID, weeklyFocusAdapter } from "@/lib/adapters/weekly-focus.mock";
import { KnowledgeBaseEntryCard } from "./KnowledgeBaseEntryCard";
import { OfferApprovalsCard } from "./OfferApprovalsCard";
import { UnfinishedArtifactsCard } from "./UnfinishedArtifactsCard";
import { WeeklyFocusCard } from "./WeeklyFocusCard";

export async function RecruiterHome() {
  const [focus, approvalsAll, artifacts] = await Promise.all([
    weeklyFocusAdapter.getFocusForRecruiter(CURRENT_RECRUITER_ID),
    offerApprovalsAdapter.listPendingApprovals(),
    draftArtifactsAdapter.listUnfinished(CURRENT_RECRUITER_ID),
  ]);
  const approvals = approvalsAll.filter((a) => a.recruiterId === CURRENT_RECRUITER_ID);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Моя работа</h1>
          <p className="mt-1 text-sm text-muted">Дарья Соколова · Рекрутер</p>
        </div>
        <LinkButton href="/workflow" variant="secondary">
          Полный рабочий маршрут
        </LinkButton>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <WeeklyFocusCard focus={focus} />
          <OfferApprovalsCard approvals={approvals} />
          <UnfinishedArtifactsCard artifacts={artifacts} />
        </div>
        <div className="flex flex-col gap-6">
          <KnowledgeBaseEntryCard />
        </div>
      </div>
    </div>
  );
}
