import { gunzipSync } from "node:zlib";
import type { RecruitArticle, RecruitChecklist, RecruitScenario, RecruitScript } from "./types";
import payload0 from "./uploaded-overrides-payload-0";
import payload1 from "./uploaded-overrides-payload-1";
import payload2 from "./uploaded-overrides-payload-2";
import payload3 from "./uploaded-overrides-payload-3";
import payload4 from "./uploaded-overrides-payload-4";
import payload5 from "./uploaded-overrides-payload-5";

/**
 * Exact attachment identity supplied by the Product Owner on 2026-09-03.
 * The historical v7.4 reference remains useful for the 106 selected objects that
 * are byte-equivalent after parsing; only the 21 differing objects are stored in
 * this compact attachment-derived delta.
 */
export const UPLOADED_RECRUIT_SOURCE = {
  filename: "ivideon-recruit-standalone [zdQLxc] [xOP9D9](1).html",
  size: 8402786,
  sha256: "e20c17fd4521880912fb9fae21e76c0e1ec87a1ffcd81df4a55b1ed20d832bcf",
  gitBlobSha1: "dc3516afbec2020d995d54c90389f5a3b0d9c6aa",
  selectedDeltaSha256: "796176278deb9cb4ceb95491482c30cccd919c40f2f3cb05df592c7306075f83",
} as const;

export const UPLOADED_RECRUIT_REMOVED_IDS = {
  scenarios: new Set(["make-offer-to-candidate"]),
  scripts: new Set(["offer-ceo-approval-note"]),
  checklists: new Set(["offer-candidate-checklist"]),
} as const;

export interface UploadedRecruitOverrides {
  articles: RecruitArticle[];
  scenarios: RecruitScenario[];
  scripts: RecruitScript[];
  checklists: RecruitChecklist[];
}

let cachedOverrides: UploadedRecruitOverrides | null = null;

export function getUploadedRecruitOverrides(): UploadedRecruitOverrides {
  if (cachedOverrides) return cachedOverrides;
  const encoded = payload0 + payload1 + payload2 + payload3 + payload4 + payload5;
  cachedOverrides = JSON.parse(
    gunzipSync(Buffer.from(encoded, "base64")).toString("utf8"),
  ) as UploadedRecruitOverrides;
  return cachedOverrides;
}
