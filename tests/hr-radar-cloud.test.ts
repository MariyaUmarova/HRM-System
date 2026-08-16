import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");
const foundation = readFileSync(
  join(ROOT, "supabase/migrations/20260816221757_hr_radar_foundation.sql"),
  "utf-8",
);
const secureSchedule = readFileSync(
  join(ROOT, "supabase/migrations/20260816222146_secure_hr_radar_schedule.sql"),
  "utf-8",
);
const secretInitializer = readFileSync(
  join(ROOT, "supabase/migrations/20260816222159_initialize_hr_radar_secret.sql"),
  "utf-8",
);
const edgeFunction = readFileSync(
  join(ROOT, "supabase/functions/hr-radar-ingest/index.ts"),
  "utf-8",
);

describe("HR Radar cloud contract", () => {
  it("keeps every HR news table private behind RLS and service-role grants", () => {
    for (const table of [
      "hr_news_sources",
      "hr_news_items",
      "hr_news_ingestion_runs",
    ]) {
      expect(foundation).toContain(
        `alter table public.${table} enable row level security`,
      );
      expect(foundation).toContain(
        `revoke all on table public.${table} from anon, authenticated`,
      );
    }
    expect(foundation).toContain("status in ('pending_review', 'published', 'rejected')");
  });

  it("schedules 09:00 MSK with a per-environment Vault secret", () => {
    expect(secureSchedule).toContain("'0 6 * * *'");
    expect(secureSchedule).toContain("'x-hr-radar-secret'");
    expect(secureSchedule).toContain("hr_radar_invocation_secret");
    expect(secretInitializer).toContain("extensions.gen_random_bytes(32)");
    expect(secretInitializer).toContain("extensions.digest(invocation_secret, 'sha256')");
    expect(foundation + secureSchedule + secretInitializer).not.toContain("sb_secret_");
  });

  it("allowlists source hosts, deduplicates URLs and never auto-publishes", () => {
    expect(edgeFunction).toContain('new Set(["mintrud.gov.ru"])');
    expect(edgeFunction).toContain('status: "pending_review"');
    expect(edgeFunction).toContain("resolution=ignore-duplicates");
    expect(edgeFunction).toContain("x-hr-radar-secret");
    expect(edgeFunction).not.toContain('status: "published"');
  });
});
