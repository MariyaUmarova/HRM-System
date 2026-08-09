import type { HuntflowAdapter } from "./types";
import { CANDIDATES, VACANCIES } from "./seed";

/**
 * Mock Huntflow adapter. Returns only the minimal reference data needed to link
 * back to the original Huntflow card — never a list. A real implementation will
 * call the Huntflow API server-side and keep tokens out of the browser.
 */
export const huntflowAdapter: HuntflowAdapter = {
  async getVacancyRef(externalId) {
    return VACANCIES.find((v) => v.externalId === externalId) ?? null;
  },
  async getCandidateRef(externalId) {
    return CANDIDATES.find((c) => c.externalId === externalId) ?? null;
  },
};
