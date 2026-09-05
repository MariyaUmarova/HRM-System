import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = "supabase/migrations/20260905190000_weekly_focus_atomic_mutations.sql";
const sql = fs.readFileSync(path.join(process.cwd(), MIGRATION), "utf8");

function normalized(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

const compact = normalized(sql);

function functionSection(name: string, nextName?: string): string {
  const start = compact.indexOf(`create or replace function public.${name}(`);
  if (start < 0) return "";
  const end = nextName
    ? compact.indexOf(`create or replace function public.${nextName}(`, start + 1)
    : compact.length;
  return compact.slice(start, end < 0 ? compact.length : end);
}

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
      expect(compact).toContain(`grant execute on function public.${name}(`);
    }

    expect((compact.match(/from public, anon, authenticated;/g) ?? [])).toHaveLength(3);
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
    const update = functionSection("server_update_weekly_focus", "server_close_weekly_focus");
    expect(update).toContain("where id = p_focus_id and status = 'active' and updated_at = p_expected_updated_at");
    expect(update).not.toMatch(/\bstatus\s*=/);
  });

  it("writes one audit event inside every mutation function", () => {
    const create = functionSection("server_create_weekly_focus", "server_update_weekly_focus");
    const update = functionSection("server_update_weekly_focus", "server_close_weekly_focus");
    const close = functionSection("server_close_weekly_focus");

    expect((compact.match(/insert into public\.audit_events/g) ?? [])).toHaveLength(3);
    expect(create).toContain("'weekly_focus.created'");
    expect(update).toContain("'weekly_focus.updated'");
    expect(close).toContain("'weekly_focus.closed'");
    expect((compact.match(/'weekly_focus_item'/g) ?? [])).toHaveLength(3);
  });

  it("keeps audit metadata minimal and free of focus narrative content", () => {
    const sections = [
      functionSection("server_create_weekly_focus", "server_update_weekly_focus"),
      functionSection("server_update_weekly_focus", "server_close_weekly_focus"),
      functionSection("server_close_weekly_focus"),
    ];

    for (const section of sections) {
      const audit = section.split("insert into public.audit_events")[1]?.split("return ")[0] ?? "";
      for (const field of [
        "owner_recruiter_id",
        "week_start",
        "week_end",
        "huntflow_vacancy_external_id",
        "status",
      ]) {
        expect(audit).toContain(`'${field}'`);
      }
      expect(audit).not.toContain("priority_note");
      expect(audit).not.toContain("huntflow_vacancy_title");
      expect(audit).not.toContain("huntflow_vacancy_department");
      expect(audit).not.toContain("huntflow_vacancy_url");
    }
  });

  it("documents that the actor must come from a validated server session", () => {
    expect(compact).toContain("actor id must be derived from a validated server session");
    expect(compact).toContain("must never be accepted from an untrusted browser payload");
  });
});
