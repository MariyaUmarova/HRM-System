import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ROLES } from "@/lib/auth/roles";

const MIGRATION = "supabase/migrations/20260904090000_auth_rls_foundation.sql";
const sql = fs.readFileSync(path.join(process.cwd(), MIGRATION), "utf8");

function normalized(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function tableBlock(table: string): string {
  const match = sql.match(
    new RegExp(`create table public\\.${table} \\(([\\s\\S]*?)\\n\\);`, "m"),
  );
  if (!match) throw new Error(`Table ${table} not found in ${MIGRATION}`);
  return match[1];
}

describe("Phase 1 auth/RLS migration", () => {
  it("keeps database roles exactly aligned with the product role model", () => {
    const match = sql.match(
      /constraint profiles_role_check check \(\s*role in \(([^)]+)\)\s*\)/m,
    );
    expect(match).not.toBeNull();

    const databaseRoles = Array.from(match?.[1].matchAll(/'([^']+)'/g) ?? []).map(
      (item) => item[1],
    );
    expect(databaseRoles.sort()).toEqual([...ROLES].sort());
    expect(databaseRoles).not.toContain("admin");
  });

  it("creates only portal-owned auth/request/audit metadata, never ATS catalogs", () => {
    for (const table of [
      "profiles",
      "user_invitations",
      "intake_requests",
      "intake_request_events",
      "audit_events",
      "integration_connections",
    ]) {
      expect(sql).toContain(`create table public.${table}`);
    }

    expect(sql).not.toMatch(/create table public\.(candidates?|vacancies?|recruitment_funnel)/i);
  });

  it("does not persist plaintext request or invitation access tokens", () => {
    expect(tableBlock("intake_requests")).not.toMatch(/\btoken\b/i);
    expect(tableBlock("user_invitations")).not.toMatch(/\btoken\b/i);
  });

  it("requires corporate normalized email and customer context", () => {
    const profiles = normalized(tableBlock("profiles"));
    const invitations = normalized(tableBlock("user_invitations"));

    expect(profiles).toContain("email = lower(email)");
    expect(profiles).toContain("@ivideon[.]com$");
    expect(profiles).toContain("role <> 'customer'");
    expect(profiles).toContain("nullif(btrim(department), '') is not null");
    expect(profiles).toContain("nullif(btrim(position), '') is not null");

    expect(invitations).toContain("role in ('recruiter', 'customer')");
    expect(invitations).toContain("@ivideon[.]com$");
  });

  it("enables RLS on every exposed Phase 1 table", () => {
    for (const table of [
      "profiles",
      "user_invitations",
      "intake_requests",
      "intake_request_events",
      "audit_events",
      "integration_connections",
    ]) {
      expect(sql).toContain(`alter table public.${table} enable row level security;`);
    }
  });

  it("keeps profiles self-readable while reserving management visibility for Head/HRD", () => {
    const compact = normalized(sql);
    expect(compact).toContain(
      "select coalesce(private.current_app_role() in ('head_of_recruitment', 'hrd'), false)",
    );
    expect(compact).toContain(
      "create policy profiles_self_or_management_read on public.profiles for select to authenticated using ( id = auth.uid() or private.is_management_user() )",
    );
  });

  it("isolates requests by customer and assigned recruiter while management can read all", () => {
    const compact = normalized(sql);
    expect(compact).toContain("private.is_management_user()");
    expect(compact).toContain(
      "private.current_app_role() = 'customer' and customer_id = auth.uid()",
    );
    expect(compact).toContain(
      "private.current_app_role() = 'recruiter' and assigned_recruiter_id = auth.uid()",
    );
    expect(compact).toContain(
      "from public.intake_requests as request where request.id = intake_request_events.request_id",
    );
  });

  it("does not grant direct authenticated browser writes in the foundation slice", () => {
    const compact = normalized(sql);
    expect(compact).not.toMatch(/grant\s+(?:insert|update|delete|all)[^;]*to authenticated/);

    for (const table of [
      "profiles",
      "user_invitations",
      "intake_requests",
      "intake_request_events",
      "audit_events",
      "integration_connections",
    ]) {
      expect(compact).toContain(`grant select on table public.${table} to authenticated;`);
    }
  });

  it("keeps role changes and side-effect writes server controlled", () => {
    expect(sql).toContain("security definer");
    expect(sql).toContain("grant execute on function private.current_app_role() to authenticated;");
    expect(sql).not.toMatch(/create policy[^;]+for (?:insert|update|delete)/is);
  });

  it("stores integration/audit metadata without credential columns and rejects common secret keys", () => {
    const audit = normalized(tableBlock("audit_events"));
    const integrations = normalized(tableBlock("integration_connections"));

    for (const block of [audit, integrations]) {
      expect(block).not.toMatch(/\b(access_token|refresh_token|service_role_key|password|api_key)\s+text\b/);
      expect(block).toContain("'service_role_key'");
      expect(block).toContain("'access_token'");
      expect(block).toContain("'refresh_token'");
      expect(block).toContain("'authorization'");
    }
  });

  it("contains no real seed users, candidate records or credential values", () => {
    expect(sql).not.toMatch(/insert\s+into\s+public\.(profiles|user_invitations|intake_requests)/i);
    expect(sql).not.toMatch(/sk-[a-z0-9_-]{10,}/i);
    expect(sql).not.toMatch(/sb_secret_[a-z0-9_-]+/i);
    expect(sql).not.toMatch(/eyj[a-z0-9_-]{20,}\./i);
  });
});
