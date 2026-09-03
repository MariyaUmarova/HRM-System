import Link from "next/link";
import { RecruitHome } from "@/components/recruit/RecruitHome";
import { RequestsInbox } from "@/components/requests/RequestsInbox";
import { weeklyFocusAdapter } from "@/lib/adapters/weekly-focus.mock";
import type { Role } from "@/lib/auth/roles";
import { WeeklyFocusCard } from "./WeeklyFocusCard";

export async function LeadHome({ role: _role }: { role: Role }) {
  const focus = await weeklyFocusAdapter.getTeamFocus();

  return (
    <RecruitHome
      operations={
        <>
          <div className="rr-section-head">
            <div>
              <h2>Рабочая зона руководителя</h2>
              <p>Новые заявки заказчиков и командные фокусы недели.</p>
            </div>
            <Link className="rr-btn rr-btn-secondary" href="/requests">
              Все заявки заказчиков
            </Link>
          </div>
          <div className="rr-ops-grid">
            <RequestsInbox variant="home" />
            <WeeklyFocusCard focus={focus} showOwner />
          </div>
        </>
      }
    />
  );
}
