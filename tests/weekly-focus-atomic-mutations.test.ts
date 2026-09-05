import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = "supabase/migrations/20260905190000_weekly_focus_atomic_mutations.sql";
const sql = fs.readFileSync(path.join(process.cwd(), MIGRATION), "utf8");

function normalized(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

const compact = normalized(sql);

describe("weekly focus atomic server mutations", () => {
  it("exposes exactly create/update/close server mutation functions", () => {
    expect(compact).toContain("create or replace function public.server_create_weekly_focus(");
    expect(compact).toContain("create or replace function public.server_update_weekly_focus(");
    expect(compact).toContain("create or replace function public.server_close_weekly_focus(");
    expect(compact).not.toContain("server_delete_weekly_focus");
    expect(compact).not.toContain("server_reopen_weekly_focus");
  });

  it("keeps the functions security-invoker and service-role-only", () => {
    expect((compact.match(/security invoker/g) ?? [])).toHaveLength(3);
    expect(compact).not.toContain("security definer");
    expect((compact.match(/set search_path = ''/g) ?? [])).toHaveLength(3);

    for (const name of [
      "server_create_weekly_focus",
      "server_update_weekly_focus",
      "server_close_weekly_focus",
    ]) {
      expect(compact).toContain(`revoke all on function public.${name}(`);
      expect(compact).toContain("from public, anon, authenticated");
      expect(compact).toContain(`grant execute on function public.${name}(`);
    }

    expect((compact.match(/\) to service_role;/g) ?? [])).toHaveLength(3);
    expect(compact).not.toMatch(/grant execute[^;]+to authenticated/);
    expect(compact).not.toMatch(/grant execute[^;]+to anon/);
  });

  it("requires optimistic concurrency for update and close", () => {
    expect((compact.match(/p_expected_updated_at timestamptz/g) ?? [])).toHaveLength(2);
    expect((compact.match(/updated_at = p_expected_updated_at/g) ?? [])).toHaveLength(2);
    expect(compact).toContain("weekly focus update conflict: row missing, closed, or stale");
    expect(compact).toContain("weekly focus close conflict: row missing, closed, or stale");
  });

  it("does not allow update to mutate closed rows or change status directly", () => {
    expect(compact).toContain("where id = p_focus_id and status = 'active' and updated_at = p_expected_updated_at");
    expect(compact).not.toMatch(/server_update_weekly_focus[\s\S]+?set[\s\S]+?status\s*=/i);
  });

  it("writes one audit event inside every mutation function", () => {
    expect((compact.match(/insert into public\.audit_events/g) ?? [])).toHaveLength(3);
    expect(compact).toContain("'weekly_focus.created'");
    expect(compact).toContain("'weekly_focus.updated'");
    expect(compact).toContain("'weekly_focus.closed'");
    expect((compact.match(/'weekly_focus_item'/g) ?? [])).toHaveLength(3);
  });

  it("keeps audit metadata minimal and free of focus narrative content", () => {
    for (const field of [
      "owner_recruiter_id",
      "week_start",
      "week_end",
      "huntflow_vacancy_external_id",
      "status",
    ]) {
      expect(compact).toContain(`'${field}'`);
    }

    const auditSections = compact
      .split("insert into public.audit_events")
      .slice(1)
      .join(" ");
    expect(auditSections).not.toContain("priority_note");
    expect(auditSections).not.toContain("huntflow_vacancy_title");
    expect(auditSections).not.toContain("huntflow_vacancy_department");
    expect(auditSections).not.toContain("huntflow_vacancy_url");
  });

  it("documents that the actor must come from a validated server session", () => {
    expect(compact).toContain("actor id must be derived from a validated server session");
    expect(compact).toContain("must never be accepted from an untrusted browser payload");
  });
});
