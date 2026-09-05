import type { WeeklyFocusAdapter } from "./types";
import { CURRENT_RECRUITER_ID, RECRUITERS } from "./seed";
import { createWeeklyFocusSeed, recruiterName } from "./weekly-focus.seed";

/**
 * Legacy mock adapter kept for compatibility with server-side callers. The live
 * UAT weekly-focus surface now uses weekly-focus.store.ts so management edits can
 * be observed by recruiter cards in the same browser.
 */
export const weeklyFocusAdapter: WeeklyFocusAdapter = {
  async getFocusForRecruiter(recruiterId) {
    const focus = createWeeklyFocusSeed();
    return { ...focus, items: focus.items.filter((item) => item.ownerRecruiterId === recruiterId) };
  },
  async getTeamFocus() {
    return createWeeklyFocusSeed();
  },
};

export { CURRENT_RECRUITER_ID, RECRUITERS, recruiterName };
