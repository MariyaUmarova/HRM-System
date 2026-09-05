import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = "supabase/migrations/20260905200000_intake_request_atomic_transitions.sql";
const sql = fs.readFileSync(path.join(process.cwd(), MIGRATION), "utf8");
const compact = sql.replace(/\s+/g, " ").trim().toLowerCase();

describe("atomic Customer intake request transitions", () => {
  it("defines only the approved server mutation surface for existing owned requests", () => {
    for (const name of [
      "server_save_intake_request_draft",
      "server_submit_intake_request",
      "server_return_intake_request",
      "server_accept_intake_request",
      "server_assign_intake_request",
    ]) {
      expect(compact).toContain(`create or replace function public.${name}(`);
    }
    expect(compact).not.toContain("server_create_intake_request");
    expect(compact).not.toContain("issue_intake_request_link");
    expect(compact).not.toContain("revoke_intake_request_link");
  });

  it("keeps browser roles unable to execute mutation RPCs", () => {
    expect((compact.match(/security invoker/g) ?? [])).toHaveLength(5);
    expect(compact).not.toContain("security definer");
    expect((compact.match(/from public, anon, authenticated;/g) ?? [])).toHaveLength(8);
    expect((compact.match(/to service_role;/g) ?? []).length).toBeGreaterThanOrEqual(8);
    expect(compact).not.toMatch(/grant execute[^;]+to authenticated/);
    expect(compact).not.toMatch(/grant execute[^;]+to anon/);
  });

  it("enforces the approved state machine independently of UI", () => {
    expect(compact).toContain("old.status in ('draft', 'returned') and new.status = 'submitted'");
    expect(compact).toContain("old.status = 'submitted' and new.status in ('returned', 'accepted')");
    expect(compact).toContain("old.status = 'accepted' and new.status = 'assigned'");
    expect(compact).toContain("request narrative cannot change in the same statement as status transition");
    expect(compact).toContain("request narrative is editable only in draft or returned state");
    expect(compact).toContain("intake request customer ownership is immutable");
  });

  it("requires an active Customer owner and active Recruiter assignment", () => {
    expect(compact).toContain("intake request owner must be an active customer");
    expect(compact).toContain("assigned recruiter must be an active recruiter");
    expect(compact).toContain("recruiter assignment is allowed only on accepted to assigned transition");
  });

  it("makes app-level request history append-only and validates transition events", () => {
    expect(compact).toContain("revoke update, delete on table public.intake_request_events from service_role");
    expect(compact).toContain("create trigger intake_request_events_validate_insert");
    expect(compact).toContain("intake request event status must match current request status");
    expect(compact).toContain("draft/submitted request event actor must be the owning active customer");
    expect(compact).toContain("management request event requires active head of recruitment or hrd actor");
    expect(compact).toContain("returned request event requires a revision comment");
  });

  it("uses strict optimistic concurrency for every existing-row mutation", () => {
    expect(compact).toContain("create or replace function private.touch_intake_request_version()");
    expect(compact).toContain("pg_catalog.clock_timestamp()");
    expect(compact).toContain("old.updated_at + interval '1 microsecond'");
    expect((compact.match(/p_expected_updated_at timestamptz/g) ?? [])).toHaveLength(5);
    expect((compact.match(/updated_at = p_expected_updated_at/g) ?? [])).toHaveLength(5);
    expect((compact.match(/using errcode = '40001'/g) ?? [])).toHaveLength(5);
  });

  it("requires Customer ownership for draft edit/submit and management for queue transitions", () => {
    expect(compact).toContain("customer cannot edit another customer request");
    expect(compact).toContain("customer cannot submit another customer request");
    expect(compact).toContain("return for revision requires active head of recruitment or hrd actor");
    expect(compact).toContain("accept request requires active head of recruitment or hrd actor");
    expect(compact).toContain("assign request requires active head of recruitment or hrd actor");
  });

  it("requires a non-empty return comment", () => {
    expect(compact).toContain("revision comment is required");
    expect(compact).toContain("returned request event requires a revision comment");
  });

  it("records status events and minimal audit without copying request narrative", () => {
    expect((compact.match(/insert into public\.audit_events/g) ?? [])).toHaveLength(5);
    expect((compact.match(/insert into public\.intake_request_events/g) ?? [])).toHaveLength(4);
    for (const action of [
      "intake_request.draft_updated",
      "intake_request.submitted",
      "intake_request.returned",
      "intake_request.accepted",
      "intake_request.assigned",
    ]) {
      expect(compact).toContain(`'${action}'`);
    }

    const auditFragments = compact.split("insert into public.audit_events").slice(1);
    for (const fragment of auditFragments) {
      const audit = fragment.split("return ")[0] ?? "";
      expect(audit).not.toContain("must_have");
      expect(audit).not.toContain("nice_to_have");
      expect(audit).not.toContain("p_revision_comment");
      expect(audit).not.toContain("position =");
      expect(audit).not.toContain("department =");
    }
  });

  it("does not create an ATS or Huntflow mutation path", () => {
    expect(compact).not.toMatch(/create table public\.(vacancies|candidates|recruitment_funnel)/);
    expect(compact).not.toContain("huntflow_api");
    expect(compact).not.toContain("create_vacancy");
  });

  it("documents the trusted actor boundary", () => {
    expect(compact).toContain("p_actor_user_id must be derived from a validated server session");
    expect(compact).toContain("must never be trusted from a browser payload");
  });
});
