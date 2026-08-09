/**
 * Typed adapter boundaries. Every integration (Huntflow, mail, SSO, news, AI) is
 * accessed only through these interfaces. Phase 1 ships mock implementations only
 * (see the `*.mock.ts` files in this folder); a real backend can implement the
 * same interfaces later without the UI changing.
 *
 * Huntflow rule: this interface intentionally exposes only single-object lookups
 * by external id. It must never grow `listVacancies` / `listCandidates` methods —
 * Huntflow is the only source of truth for vacancy and candidate lists
 * (see CLAUDE.md non-negotiable product rules). This is enforced by
 * tests/structural-guardrails.test.ts.
 */

export interface HuntflowVacancyRef {
  externalId: string;
  title: string;
  department: string;
  huntflowUrl: string;
}

export interface HuntflowCandidateRef {
  externalId: string;
  name: string;
  vacancyExternalId: string;
  stage: string;
  huntflowUrl: string;
}

export interface HuntflowAdapter {
  getVacancyRef(externalId: string): Promise<HuntflowVacancyRef | null>;
  getCandidateRef(externalId: string): Promise<HuntflowCandidateRef | null>;
}

export interface WeeklyFocusItem {
  id: string;
  title: string;
  priorityNote: string;
  vacancyRef: HuntflowVacancyRef;
  ownerRecruiterId: string;
}

export interface WeeklyFocus {
  rangeStart: string;
  rangeEnd: string;
  items: WeeklyFocusItem[];
}

export interface WeeklyFocusAdapter {
  getFocusForRecruiter(recruiterId: string): Promise<WeeklyFocus>;
  getTeamFocus(): Promise<WeeklyFocus>;
}

export type OfferApprovalStage = "pending_head_of_recruitment" | "pending_hrd" | "approved";

export interface OfferApproval {
  id: string;
  candidateName: string;
  vacancyTitle: string;
  vacancyRef: HuntflowVacancyRef;
  stage: OfferApprovalStage;
  submittedAt: string;
  recruiterId: string;
}

export interface OfferApprovalsAdapter {
  listPendingApprovals(): Promise<OfferApproval[]>;
}

export type DraftArtifactType = "offer_draft" | "interview_analysis" | "approval_email";

export interface DraftArtifact {
  id: string;
  type: DraftArtifactType;
  title: string;
  candidateName: string;
  updatedAt: string;
  recruiterId: string;
}

export interface DraftArtifactsAdapter {
  listUnfinished(recruiterId: string): Promise<DraftArtifact[]>;
}

export type IntakeRequestStatus = "draft" | "submitted" | "returned" | "accepted" | "assigned";

export interface IntakeRequestHistoryEntry {
  status: IntakeRequestStatus;
  comment?: string;
  at: string;
}

export interface IntakeRequest {
  id: string;
  token: string;
  companyContact: string;
  position: string;
  department: string;
  mustHave: string;
  niceToHave: string;
  comment: string;
  status: IntakeRequestStatus;
  assignedRecruiterId: string | null;
  history: IntakeRequestHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface IntakeRequestsAdapter {
  getByToken(token: string): Promise<IntakeRequest | null>;
  saveDraft(token: string, patch: Partial<IntakeRequest>): Promise<IntakeRequest>;
  submit(token: string): Promise<IntakeRequest>;
  listForManagement(): Promise<IntakeRequest[]>;
  returnForRevision(id: string, comment: string): Promise<IntakeRequest>;
  accept(id: string): Promise<IntakeRequest>;
  assignRecruiter(id: string, recruiterId: string): Promise<IntakeRequest>;
}

export interface Recruiter {
  id: string;
  name: string;
}
