# Recommended implementation roadmap

This is an implementation order, not authorization to connect or mutate an external
service without the Product Owner's confirmation.

Status date: 2026-09-05.

## Phase 0 — Governance, portability and safe preview

- [x] Publish the repository and establish Git-based development.
- [x] Enable CI for frozen install, lint, tests and production build.
- [x] Establish browser-accessible preview/UAT infrastructure.
- [x] Keep Preview/UAT synthetic and separate from production data.
- [ ] Resolve repository visibility intentionally; the repository is currently public.
- [ ] Protect `main` and require the CI check for future pull requests.
- [ ] Add/approve a repository ruleset preventing ordinary direct pushes to `main`.
- [ ] Record final local / preview / dev / stage / prod environment and data boundaries.

Current blocker: `main` is unprotected and rulesets are empty. Issue #3 tracks this. Do
not merge the active stack until governance is decided.

## Phase 1 — Auth, profiles, RLS and durable HR Hub foundations

### 1A. Git-only Auth/RLS foundation — Draft PR #18

- [x] Model exactly four roles: Recruiter, Head of Recruitment, HRD, Customer.
- [x] Keep Head/HRD management permissions equivalent.
- [x] Model `profiles`, invitation metadata, durable Customer requests/events,
  `audit_events` and integration metadata.
- [x] Enable RLS and least-privilege browser grants.
- [x] Keep source Customer requests visible only to their Customer and Head/HRD;
  Recruiter receives no direct SELECT even when assigned.
- [x] Harden private role helpers and verify foundation-only/full-chain migrations in
  isolated PostgreSQL.
- [ ] Approve/create the actual HRM Supabase development environment.
- [ ] Apply migrations to that approved environment.
- [ ] Run Supabase security/performance advisors there.
- [ ] Wire Supabase Auth and server-side session validation into Next.js.
- [ ] Remove preview-role cookies outside local/UAT when real Auth is ready.

Current connected Supabase account exposes only `ivideon-seabattle` and `tablereels`; no
HRM project is visible. Never use either project for HRM migrations.

### 1B. Durable weekly focus — Draft PRs #21/#23

- [x] Keep browser flow in #20 with explicit localStorage mock persistence.
- [x] Define `weekly_focus_items` without vacancy/candidate catalog duplication.
- [x] RLS: Head/HRD team/history; Recruiter own active; Customer/anon none.
- [x] Enforce active Recruiter ownership and active Head/HRD mutation actors.
- [x] Keep browser mutations disabled.
- [x] Define service-role-only atomic create/update/close RPCs with `audit_events`.
- [x] Add strictly advancing optimistic-concurrency row version.
- [x] Verify role, RLS, constraints, stale writes, close lifecycle and audit rollback in
  isolated PostgreSQL.
- [ ] Add Auth-bound Next.js server adapter deriving actor from validated session.
- [ ] Replace localStorage only after approved HRM dev environment + real Auth.
- [ ] Browser-UAT durable Head/HRD → Recruiter flow.

### 1C. Application audit immutability

- [x] Inventory current audit writers: scan run `33986346224` found 8 INSERT writers,
  zero UPDATE writers and zero DELETE writers.
- [ ] Revoke application service-role UPDATE/DELETE on `audit_events` in a separate
  reviewed migration while retaining INSERT/SELECT as required.
- [ ] Verify existing weekly-focus and intake-request RPCs continue to write audit and
  cannot alter/delete prior events.

Exit for Phase 1: real authenticated accounts and durable portal workflows operate in an
approved HRM environment with verified role/RLS/audit boundaries; preview role switching
is not a security boundary.

## Phase 2 — Customer requests and management queue

### 2A. Durable existing-request state machine — prepared in Draft PR #24

- [x] Strict state machine: `draft|returned → submitted`,
  `submitted → returned|accepted`, `accepted → assigned`.
- [x] Customer edits/submits only own request and only while draft/returned.
- [x] Head/HRD return with mandatory comment, accept and assign.
- [x] Assignment requires active Recruiter.
- [x] Customer ownership immutable; terminal/management states cannot edit narrative.
- [x] Application request-event history append-only.
- [x] Optimistic concurrency uses a strictly advancing row version.
- [x] Every reviewed mutation writes audit atomically; forced audit failure rolls back
  request state and transition event.
- [x] Verify after assignment that Recruiter still reads 0 source requests/events.
- [x] Verify lifecycle, cross-Customer isolation, stale writes and rollback in isolated
  PostgreSQL (run `33986202494`).

### 2B. Still required for real Customer request runtime

- [ ] Design/approve secure expiring/single-purpose request-link issuance and revocation.
- [ ] Define request creation/provisioning behind that approved identity/link boundary.
- [ ] Add Auth-bound Next.js server adapter; do not use the current mock `[token]` route
  as production authentication.
- [ ] Notify only Head/HRD about new submissions.
- [ ] Add rate limits, bot protection and abuse controls.
- [ ] Deliver Recruiter working context through an explicitly approved derived
  artifact/Huntflow boundary without exposing the source Customer request.
- [ ] Browser-UAT the real Customer → management → assignment lifecycle.

Exit: Customer can submit safely without seeing the internal portal; management can
process requests without leaking source Customer data to Recruiter.

## Phase 3 — Huntflow server integration

- Confirm Huntflow API permissions, rate limits and webhook/polling capabilities.
- Keep tokens server-side in an approved secret store.
- Store only external IDs, deep links, sync timestamps and allowed derived metadata.
- Never introduce HR Hub vacancy/candidate catalogs/cards/funnel/pipeline boards.
- Implement idempotent jobs, retry/backoff and reconciliation.
- Attach approved derived artifacts only after explicit human confirmation.

Exit: Huntflow remains ATS/source of truth while HR Hub reduces manual work.

## Phase 4 — Offer Center production path

- [x] Keep current client-side field model, preview and human-confirmation prototype.
- [x] Keep PDF/PNG/PPTX exports blocked until confirmation.
- Create durable versioned artifacts only in approved backend environment.
- Preserve author/timestamp/version/audit provenance.
- Never invent compensation/legal terms/approvals.
- Mail adapters start draft-first; sending requires explicit human confirmation.
- Huntflow upload only after confirmation and idempotently.

## Phase 5 — Interview Analysis production path

- [x] Keep current evidence-linked local/synthetic prototype.
- [x] Exclude protected/sensitive employment criteria before matching.
- [x] Require human confirmation before using the Huntflow draft.
- Approve processor/storage/retention/deletion/access/audit before real candidate media.
- Never infer protected traits/emotions/personality or auto-rank/hire/reject.

## Phase 6 — HR Radar and knowledge operations

- Preserve attributed HR Radar prototype and reviewed-source boundary.
- Re-verify any scheduled discovery task before describing it as active infrastructure.
- Keep discoveries `pending_review`; never auto-publish AI output.
- Add editorial approval/source-health/stale-content ownership.
- Store source metadata and short summaries, not copied articles.

## Phase 7 — Production hardening and scale

- Observability, alerting and incident runbooks.
- Backup/restore drills and data deletion/export procedures.
- Rate limits and AI/external-API cost controls.
- Security review and privacy impact assessment.
- Load testing for measured traffic.
- Add queues/warehouse/lake/model infrastructure only when measured scale requires it.

Exit: production readiness is demonstrated by tested controls and operations, not by
architecture diagrams alone.
