import Link from "next/link";
import { RecruitHome } from "@/components/recruit/RecruitHome";
import { CURRENT_RECRUITER_ID, weeklyFocusAdapter } from "@/lib/adapters/weekly-focus.mock";
import { WeeklyFocusCard } from "./WeeklyFocusCard";

export async function RecruiterHome() {
  const focus = await weeklyFocusAdapter.getFocusForRecruiter(CURRENT_RECRUITER_ID);

  return (
    <RecruitHome
      operations={
        <section aria-label="Рабочая зона рекрутера">
          <div className="rr-section-head">
            <div>
              <h2>Рабочая зона рекрутера</h2>
              <p>Фокус недели и рабочие инструменты по текущим задачам.</p>
            </div>
            <Link className="rr-btn rr-btn-secondary" href="/offer-center">
              Центр офферов
            </Link>
          </div>
          <div className="rr-ops-grid">
            <WeeklyFocusCard focus={focus} />
          </div>
        </section>
      }
    />
  );
}
