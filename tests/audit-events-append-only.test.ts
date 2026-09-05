import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = "supabase/migrations/20260905203000_audit_events_append_only.sql";
const sql = fs.readFileSync(path.join(process.cwd(), MIGRATION), "utf8");
const compact = sql.replace(/\s+/g, " ").trim().toLowerCase();

describe("application audit history", () => {
  it("revokes application UPDATE and DELETE while leaving append/read grants untouched", () => {
    expect(compact).toContain("revoke update, delete on table public.audit_events from service_role");
    expect(compact).not.toContain("revoke insert");
    expect(compact).not.toContain("revoke select");
    expect(compact).not.toContain("truncate");
  });

  it("documents the application-vs-owner maintenance boundary", () => {
    expect(compact).toContain("application audit history is append-only");
    expect(compact).toContain("cannot rewrite or delete prior history");
    expect(compact).toContain("database-owner");
    expect(compact).toContain("maintenance remains outside the application role");
  });
});
