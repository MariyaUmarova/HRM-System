import fs from "node:fs";
import path from "node:path";
import { RECRUIT_SOURCE_RELATIVE_PATH } from "./source";
import type { RecruitTemplate } from "./types";

const ALLOWED_EMBEDDED_TEMPLATE_IDS = new Set(["offer-template"]);

export interface EmbeddedTemplateDownload {
  bytes: Buffer;
  contentType: string;
  fileName: string;
}

function balancedArray(text: string, start: number): string {
  let depth = 0;
  let quote: '"' | null = null;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"') {
      quote = '"';
      continue;
    }
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }

  throw new Error("Unable to parse embedded Recruit templates");
}

function rawTemplates(): RecruitTemplate[] {
  const html = fs.readFileSync(path.join(process.cwd(), RECRUIT_SOURCE_RELATIVE_PATH), "utf8");
  const marker = "window.TEMPLATES";
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) throw new Error("Recruit source is missing window.TEMPLATES");
  const start = html.indexOf("[", markerIndex);
  if (start < 0) throw new Error("Recruit templates payload is missing");
  return JSON.parse(balancedArray(html, start)) as RecruitTemplate[];
}

function safeFileName(template: RecruitTemplate, contentType: string): string {
  if (template.downloadName?.trim()) return template.downloadName.trim().replace(/[\\/\r\n"]/g, "_");
  const extension = contentType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ? "pptx" : "bin";
  return `${template.id}.${extension}`;
}

export function hasEmbeddedTemplateDownload(id: string): boolean {
  if (!ALLOWED_EMBEDDED_TEMPLATE_IDS.has(id)) return false;
  const template = rawTemplates().find((item) => item.id === id);
  return Boolean(template?.file?.startsWith("data:") && template.file.includes(";base64,"));
}

export function getEmbeddedTemplateDownload(id: string): EmbeddedTemplateDownload | null {
  if (!ALLOWED_EMBEDDED_TEMPLATE_IDS.has(id)) return null;
  const template = rawTemplates().find((item) => item.id === id);
  const dataUri = template?.file;
  if (!template || !dataUri?.startsWith("data:")) return null;

  const match = /^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUri);
  if (!match) return null;
  const [, contentType, payload] = match;
  if (contentType !== "application/vnd.openxmlformats-officedocument.presentationml.presentation") return null;

  const bytes = Buffer.from(payload, "base64");
  if (bytes.length < 4 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) return null;

  return {
    bytes,
    contentType,
    fileName: safeFileName(template, contentType),
  };
}
