import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getEmbeddedTemplateDownload, hasEmbeddedTemplateDownload } from "@/lib/recruit-content/template-download";

function read(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("embedded Recruit template downloads", () => {
  it("restores the offer PPTX embedded in the canonical standalone source", () => {
    expect(hasEmbeddedTemplateDownload("offer-template")).toBe(true);
    const file = getEmbeddedTemplateDownload("offer-template");

    expect(file).not.toBeNull();
    expect(file?.contentType).toBe("application/vnd.openxmlformats-officedocument.presentationml.presentation");
    expect(file?.fileName).toMatch(/\.pptx$/i);
    expect(file?.bytes.length).toBeGreaterThan(1_000);
    expect(file?.bytes.subarray(0, 2).toString("ascii")).toBe("PK");
  });

  it("does not manufacture downloads for source files that are absent from the repository", () => {
    expect(hasEmbeddedTemplateDownload("recruitment-request")).toBe(false);
    expect(hasEmbeddedTemplateDownload("recruitment-source")).toBe(false);
    expect(getEmbeddedTemplateDownload("recruitment-request")).toBeNull();
    expect(getEmbeddedTemplateDownload("recruitment-source")).toBeNull();
  });

  it("shows the canonical download CTA only for the embedded offer template", () => {
    const page = read("src/app/(workspace)/templates/page.tsx");
    expect(page).toContain('item.id === "offer-template"');
    expect(page).toContain("item.downloadLabel");
    expect(page).toContain('href={`/templates/download/${item.id}`}');
  });
});
