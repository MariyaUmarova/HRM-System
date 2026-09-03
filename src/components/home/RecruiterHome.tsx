import { RecruitHome } from "@/components/recruit/RecruitHome";
import { CURRENT_RECRUITER_ID, weeklyFocusAdapter } from "@/lib/adapters/weekly-focus.mock";
import { WeeklyFocusCard } from "./WeeklyFocusCard";

export async function RecruiterHome() {
  const focus = await weeklyFocusAdapter.getFocusForRecruiter(CURRENT_RECRUITER_ID);

  return (
    <RecruitHome
      operations={
        <div className="rr-ops-grid">
          <WeeklyFocusCard focus={focus} />
        </div>
      }
    />
  );
}
