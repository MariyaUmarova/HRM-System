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
- [ ] Protect `main` and require CI for merge.
- [ ] Add/approve a repository ruleset that prevents ordinary direct pushes to `main`.
- [ ] Record the final local / preview / dev / stage / prod environment map and data
  boundaries.

Current blocker: `main` is not protected and repository rulesets are empty. Issue #3
tracks this. Do not merge the active product stack until the governance decision is made.

## Phase 1 — Auth, profiles, RLS and durable HR Hub foundations

### 1A. Git-only Auth/RLS foundation — prepared in Draft PR #18

- [x] Model exactly four product roles: Recruiter, Head of Recruitment, HRD, Customer.
- [x] Keep Head of Recruitment and HRD management permissions equivalent.
- [x] Model `profiles` on top of `auth.users`.
- [x] Model invitation metadata without plaintext invitation tokens.
- [x] Model durable Customer intake requests and append-only request events.
- [x] Model generic audit-event and integration-connection metadata without credential
  columns.
- [x] Enable RLS and least-privilege grants for the new public tables.
- [x] Keep source Customer requests visible only to their Customer and Head/HRD;
  Recruiter receives no direct SELECT even when assigned.
- [x] Harden SECURITY DEFINER role helpers with a private schema and pinned search path.
- [x] Verify foundation-only and full migration chains in ephemeral PostgreSQL.
- [ ] Approve/create the actual HRM Supabase development environment.
- [ ] Apply migrations to the approved HRM development environment.
- [ ] Run Supabase database security/performance advisors on that environment.
- [ ] Wire Supabase Auth and server-side session validation into Next.js.
- [ ] Remove development preview-role cookies outside local/UAT once real Auth is ready.

Important: the current connected Supabase account exposes only `ivideon-seabattle` and
`tablereels`; no HRM project is visible. Do not use either project for HRM migrations.

### 1B. Durable weekly-focus contract — prepared in Draft PRs #21 and #23

- [x] Keep the management UI/browser flow in PR #20 with localStorage mock persistence.
- [x] Define durable `weekly_focus_items` storage without a vacancy/candidate catalog.
- [x] Give Head/HRD team/history read scope.
- [x] Give Recruiter only own active rows; Customer and anon get no read scope.
- [x] Keep authenticated browser mutations disabled.
- [x] Enforce Recruiter ownership and Head/HRD mutation actors at database level.
- [x] Verify migration, RLS, role integrity, Huntflow-host checks, work-week checks and
  close lifecycle in ephemeral PostgreSQL.
- [x] Define service-role-only atomic create/update/close RPCs with `audit_events` writes.
- [x] Add optimistic concurrency with a strictly advancing row version so stale management
  writes cannot silently overwrite each other, including within one PostgreSQL transaction.
- [x] Verify mutation privileges, stale-write rejection, closed-row rejection, role
  integrity and mutation+audit rollback atomically in ephemeral PostgreSQL.
- [ ] Add an Auth-bound Next.js server adapter/action layer that derives actor identity
  from the validated session and calls the reviewed RPCs.
- [ ] Replace the browser store with that server adapter only after the approved HRM dev
  environment and real Auth are available.
- [ ] Browser-UAT the durable path across Head/HRD → Recruiter after server wiring.

Exit for Phase 1: real authenticated accounts, durable requests and durable weekly focus
work in the approved HRM environment; Customer/Recruiter/management boundaries are
verified both in browser and database; development role switching is not a security
boundary.

## Phase 2 — Customer requests and management queue

- Issue secure expiring/single-purpose entry links only after the auth/session boundary is
  approved.
- Support draft, submitted, returned, accepted and assigned states durably.
- Notify only Head of Recruitment and HRD about new submissions.
- Allow management to assign a Recruiter while keeping source Customer request data out
  of Recruiter direct read scope.
- Deliver the required Recruiter working context through an explicitly approved derived
  artifact/Huntflow boundary.
- Record every status transition and sensitive action.
- Add rate limits, bot protection and abuse controls.

Exit: Customer can submit safely without seeing the internal portal; management can
process requests without leaking source Customer data to Recruiter.

## Phase 3 — Huntflow server integration

- Confirm Huntflow API permissions, rate limits and webhook/polling capabilities.
- Keep tokens server-side in an approved secret store.
- Store only external IDs, deep links, sync timestamps and allowed derived metadata.
- Never introduce HR Hub vacancy/candidate catalogs, cards, funnel or pipeline boards.
- Implement idempotent jobs, retry/backoff and reconciliation.
- Attach approved derived artifacts only after explicit human confirmation.

Exit: Huntflow remains the ATS/source of truth while HR Hub reduces manual work.

## Phase 4 — Offer Center production path

- [x] Keep the current client-side field model, preview and human-confirmation prototype.
- [x] Keep PDF/PNG/PPTX exports blocked until human confirmation.
- Create durable versioned offer artifacts only in the approved backend environment.
- Preserve exact author/timestamp/version/audit provenance.
- Validate uncertainty instead of inventing compensation, legal terms or approvals.
- Add mail adapters as draft-first flows; enable sending only after explicit confirmation.
- Add Huntflow upload idempotently and only after confirmation.

Exit: recruiter prepares a correct reviewable approval package; no automatic approval,
compensation mutation, email send or Huntflow mutation occurs without a human action.

## Phase 5 — Interview Analysis production path

- [x] Keep the current evidence-linked local/synthetic analysis prototype.
- [x] Keep protected/sensitive employment criteria excluded before matching.
- [x] Keep human confirmation before using the Huntflow draft.
- Approve a cloud processor, private storage, retention/deletion policy and access/audit
  rules before accepting real candidate media.
- Add transcription/video processing only within those approved boundaries.
- Keep evidence links and explicit verification gaps.
- Never rank candidates or recommend hire/reject automatically.

Exit: AI accelerates preparation and analysis while humans remain accountable for
consequential decisions.

## Phase 6 — HR Radar and knowledge operations

- Preserve the existing attributed HR Radar prototype and reviewed-source boundary.
- Independently re-verify any scheduled discovery task before describing it as active
  infrastructure.
- Keep newly discovered material `pending_review`; never auto-publish AI output.
- Add editorial approval UI, source-health monitoring and stale-content ownership.
- Respect source terms and copyright; store source metadata and short summaries rather
  than copied articles.

Exit: attributable, reviewable HR intelligence and maintainable knowledge operations.

## Phase 7 — Production hardening and scale

- Observability, alerting and incident runbooks.
- Backup/restore drills and data deletion/export procedures.
- Rate limits and cost controls for AI/external APIs.
- Security review and privacy impact assessment.
- Load testing for actual measured traffic.
- Add queues, warehouse/lake, feature store or dedicated model infrastructure only when
  measured scale/reuse requires it.

Exit: production readiness is demonstrated by tested controls and operations, not by
architecture diagrams alone.
