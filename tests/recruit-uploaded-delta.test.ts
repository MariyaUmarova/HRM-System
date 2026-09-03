import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getRecruitContent, RECRUIT_SOURCE_RELATIVE_PATH } from "@/lib/recruit-content/source";
import {
  getUploadedRecruitOverrides,
  UPLOADED_RECRUIT_REMOVED_IDS,
  UPLOADED_RECRUIT_SOURCE,
} from "@/lib/recruit-content/uploaded-overrides";

const EXPECTED_UPLOAD = {
  filename: "ivideon-recruit-standalone [zdQLxc] [xOP9D9](1).html",
  size: 8402786,
  sha256: "e20c17fd4521880912fb9fae21e76c0e1ec87a1ffcd81df4a55b1ed20d832bcf",
  gitBlobSha1: "dc3516afbec2020d995d54c90389f5a3b0d9c6aa",
  selectedDeltaSha256: "796176278deb9cb4ceb95491482c30cccd919c40f2f3cb05df592c7306075f83",
} as const;

const EXPECTED_HISTORICAL_GIT_BLOB_SHA1 = "5404d36d8b4dee5981fd577934947cdc10aaedf2";

function sha256Json(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function gitBlobSha1(buffer: Buffer): string {
  return createHash("sha1")
    .update(Buffer.from(`blob ${buffer.length}\0`))
    .update(buffer)
    .digest("hex");
}

describe("Product Owner uploaded Recruit source delta", () => {
  it("pins the exact uploaded HTML identity and attachment-derived delta", () => {
    expect(UPLOADED_RECRUIT_SOURCE).toEqual(EXPECTED_UPLOAD);

    const overrides = getUploadedRecruitOverrides();
    expect(overrides.articles).toHaveLength(6);
    expect(overrides.scenarios).toHaveLength(6);
    expect(overrides.scripts).toHaveLength(6);
    expect(overrides.checklists).toHaveLength(3);
    expect(sha256Json(overrides)).toBe(EXPECTED_UPLOAD.selectedDeltaSha256);
  });

  it("pins the historical baseline used only for proven-identical selected objects", () => {
    const historical = fs.readFileSync(path.join(process.cwd(), RECRUIT_SOURCE_RELATIVE_PATH));
    expect(gitBlobSha1(historical)).toBe(EXPECTED_HISTORICAL_GIT_BLOB_SHA1);
  });

  it("applies every uploaded override to runtime without rewriting it", () => {
    const runtime = getRecruitContent();
    const overrides = getUploadedRecruitOverrides();

    for (const item of overrides.articles) {
      expect(runtime.articles.find((candidate) => candidate.id === item.id)).toEqual(item);
    }
    for (const item of overrides.scenarios) {
      expect(runtime.scenarios.find((candidate) => candidate.id === item.id)).toEqual(item);
    }
    for (const item of overrides.scripts) {
      expect(runtime.scripts.find((candidate) => candidate.id === item.id)).toEqual(item);
    }
    for (const item of overrides.checklists) {
      expect(runtime.checklists.find((candidate) => candidate.id === item.id)).toEqual(item);
    }
  });

  it("removes historical-only objects and keeps exact uploaded catalog counts", () => {
    const runtime = getRecruitContent();

    expect(runtime.articles).toHaveLength(21);
    expect(runtime.scenarios).toHaveLength(31);
    expect(runtime.scripts).toHaveLength(55);
    expect(runtime.templates).toHaveLength(3);
    expect(runtime.checklists).toHaveLength(15);
    expect(runtime.tools).toHaveLength(2);

    for (const id of UPLOADED_RECRUIT_REMOVED_IDS.scenarios) {
      expect(runtime.scenarios.some((item) => item.id === id)).toBe(false);
    }
    for (const id of UPLOADED_RECRUIT_REMOVED_IDS.scripts) {
      expect(runtime.scripts.some((item) => item.id === id)).toBe(false);
    }
    for (const id of UPLOADED_RECRUIT_REMOVED_IDS.checklists) {
      expect(runtime.checklists.some((item) => item.id === id)).toBe(false);
    }
  });
});
