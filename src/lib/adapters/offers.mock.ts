import type { DraftArtifactsAdapter, OfferApprovalsAdapter } from "./types";
import { CANDIDATES, VACANCIES } from "./seed";

const PENDING_APPROVALS = [
  {
    id: "offer-appr-1",
    candidateName: "Кандидат А-9001",
    vacancyTitle: VACANCIES[0].title,
    vacancyRef: VACANCIES[0],
    stage: "pending_hrd" as const,
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    recruiterId: "rec-1",
  },
  {
    id: "offer-appr-2",
    candidateName: "Кандидат В-9003",
    vacancyTitle: VACANCIES[2].title,
    vacancyRef: VACANCIES[2],
    stage: "pending_head_of_recruitment" as const,
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    recruiterId: "rec-3",
  },
];

export const offerApprovalsAdapter: OfferApprovalsAdapter = {
  async listPendingApprovals() {
    return PENDING_APPROVALS;
  },
};

const DRAFT_ARTIFACTS = [
  {
    id: "draft-1",
    type: "offer_draft" as const,
    title: "Оффер — Backend-разработчик (Go)",
    candidateName: CANDIDATES[0].name,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    recruiterId: "rec-1",
  },
  {
    id: "draft-2",
    type: "interview_analysis" as const,
    title: "Анализ HR-интервью — Продуктовый дизайнер",
    candidateName: CANDIDATES[1].name,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    recruiterId: "rec-1",
  },
  {
    id: "draft-3",
    type: "approval_email" as const,
    title: "Письмо на согласование — Sales-менеджер B2B",
    candidateName: CANDIDATES[2].name,
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    recruiterId: "rec-1",
  },
];

export const draftArtifactsAdapter: DraftArtifactsAdapter = {
  async listUnfinished(recruiterId) {
    return DRAFT_ARTIFACTS.filter((d) => d.recruiterId === recruiterId);
  },
};
