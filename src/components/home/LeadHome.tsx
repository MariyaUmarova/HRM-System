import { LinkButton } from "@/components/ui/Button";
import { RequestsInbox } from "@/components/requests/RequestsInbox";
import { offerApprovalsAdapter } from "@/lib/adapters/offers.mock";
import { weeklyFocusAdapter } from "@/lib/adapters/weekly-focus.mock";
import type { Role } from "@/lib/auth/roles";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { OfferApprovalsCard } from "./OfferApprovalsCard";
import { PlatformManagementEntryCard } from "./PlatformManagementEntryCard";
import { WeeklyFocusCard } from "./WeeklyFocusCard";

export async function LeadHome({ role }: { role: Role }) {
  const [focus, approvals] = await Promise.all([
    weeklyFocusAdapter.getTeamFocus(),
    offerApprovalsAdapter.listPendingApprovals(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Моя работа</h1>
          <p className="mt-1 text-sm text-muted">{ROLE_LABELS[role]}</p>
        </div>
        <LinkButton href="/requests" variant="secondary">
          Все заявки заказчиков
        </LinkButton>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <RequestsInbox variant="home" />
          <WeeklyFocusCard focus={focus} showOwner />
          <OfferApprovalsCard approvals={approvals} />
        </div>
        <div className="flex flex-col gap-6">
          <PlatformManagementEntryCard />
        </div>
      </div>
    </div>
  );
}
