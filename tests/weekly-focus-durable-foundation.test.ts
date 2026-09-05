import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = "supabase/migrations/20260905182000_weekly_focus_durable_foundation.sql";
const sql = fs.readFileSync(path.join(process.cwd(), MIGRATION), "utf8");

function normalized(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

const compact = normalized(sql);

describe("durable weekly focus foundation", () => {
  it("stores a portal artifact with Huntflow references instead of ATS catalogs", () => {
    expect(sql).toContain("create table public.weekly_focus_items");
    expect(sql).not.toMatch(/create table public\.(candidates?|vacancies?|recruitment_funnel)/i);
    expect(compact).toContain("huntflow_vacancy_external_id text not null");
    expect(compact).toContain("huntflow_vacancy_title text not null");
    expect(compact).toContain("huntflow_vacancy_department text not null default ''");
    expect(compact).toContain("huntflow_vacancy_url text not null");
    expect(compact).toContain("this is not a vacancy catalog");
  });

  it("keeps the approved weekly focus fields and a non-destructive close lifecycle", () => {
    for (const field of [
      "owner_recruiter_id",
      "week_start",
      "week_end",
      "title",
      "priority_note",
      "status",
      "created_by",
      "updated_by",
      "closed_by",
      "created_at",
      "updated_at",
      "closed_at",
    ]) {
      expect(compact).toContain(field);
    }

    expect(compact).toContain("status in ('active', 'closed')");
    expect(compact).toContain("status = 'active' and closed_at is null and closed_by is null");
    expect(compact).toContain("status = 'closed' and closed_at is not null and closed_by is not null");
    expect(compact).not.toMatch(/create policy[^;]+for delete/is);
  });

  it("pins the work week to Monday through Friday", () => {
    expect(compact).toContain("extract(isodow from week_start) = 1");
    expect(compact).toContain("week_end = week_start + 4");
  });

  it("allows only approved Huntflow hosts and the synthetic host", () => {
    expect(compact).toContain("^https://huntflow[.]example(/|$)");
    expect(compact).toContain("huntflow[.](ru|kz|uz)(/|$)");
    expect(compact).not.toContain("example.com");
  });

  it("enforces Recruiter ownership and Head/HRD mutation actors in the database", () => {
    expect(compact).toContain("create or replace function private.validate_weekly_focus_roles()");
    expect(compact).toContain("security definer set search_path = ''");
    expect(compact).toContain("profile.role = 'recruiter' and profile.is_active");
    expect(compact).toContain("profile.role in ('head_of_recruitment', 'hrd') and profile.is_active");
    expect(compact).toContain("weekly focus created_by is immutable");
    expect(compact).toContain(
      "revoke all on function private.validate_weekly_focus_roles() from public, anon, authenticated",
    );
    expect(compact).toContain(
      "grant execute on function private.validate_weekly_focus_roles() to service_role",
    );
    expect(compact).toContain("create trigger weekly_focus_items_validate_roles");
  });

  it("enables RLS and gives authenticated browser clients read-only table privileges", () => {
    expect(compact).toContain("alter table public.weekly_focus_items enable row level security;");
    expect(compact).toContain("revoke all on table public.weekly_focus_items from anon, authenticated;");
    expect(compact).toContain("grant select on table public.weekly_focus_items to authenticated;");
    expect(compact).not.toMatch(
      /grant\s+(?:insert|update|delete|all)[^;]*on table public\.weekly_focus_items[^;]*to authenticated/,
    );
  });

  it("gives Head/HRD team read while recruiter can read only own active rows", () => {
    expect(compact).toContain(
      "create policy weekly_focus_management_read on public.weekly_focus_items for select to authenticated using ((select private.is_management_user()))",
    );
    expect(compact).toContain(
      "create policy weekly_focus_recruiter_active_read on public.weekly_focus_items for select to authenticated using ( (select private.current_app_role()) = 'recruiter' and owner_recruiter_id = (select auth.uid()) and status = 'active' )",
    );
    expect(compact).not.toContain("= 'customer' and owner_recruiter_id");
  });

  it("reserves mutations for a reviewed server path and reuses the shared audit boundary", () => {
    expect(compact).toContain("future reviewed server actions/rpcs");
    expect(compact).toContain("public.audit_events");
    expect(compact).not.toContain("create table public.weekly_focus_events");
  });
});
