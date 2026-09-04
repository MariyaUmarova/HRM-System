import Link from "next/link";
import { RecruitHome } from "@/components/recruit/RecruitHome";
import { CURRENT_RECRUITER_ID } from "@/lib/adapters/seed";
import { WeeklyFocusLiveCard } from "./WeeklyFocusLiveCard";

export function RecruiterHome() {
  return (
    <RecruitHome
      operations={
        <section aria-label="Рабочая зона рекрутера">
          <div className="rr-section-head">
            <div>
              <h2>Рабочая зона рекрутера</h2>
              <p>Фокус недели и рабочие инструменты по текущим задачам.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="rr-btn rr-btn-secondary" href="/offer-center">
                Центр офферов
              </Link>
              <Link className="rr-btn rr-btn-secondary" href="/hr-radar">
                HR Radar
              </Link>
            </div>
          </div>
          <div className="rr-ops-grid">
            <WeeklyFocusLiveCard recruiterId={CURRENT_RECRUITER_ID} />
          </div>
        </section>
      }
    />
  );
}
