# Current state at handoff

Handoff date: 2026-09-05.

This file is the concise operational snapshot. Durable product rules live in
`docs/handoff/DECISIONS.md`, `docs/product/` and `AGENTS.md`. Older detailed handoff
snapshots remain available in Git history and must not override the facts below.

## Current product stack

The active product work is stacked; none of these PRs may be merged independently into
`main` without resolving the lower stack and governance blockers.

1. PR #16 `codex/recruit-html-shell`
   - Product shell / standalone Recruit visual and selected exact content.
   - Head: `b3482e7e00891e4213423ab900fd3e2f32c973e3`.
   - Draft/open.
2. PR #20 `codex/weekly-focus-management`
   - Base: PR #16; head `ecd156fe619f679d4a85ebba1fcd9d4b53cfd7d7`.
   - Head/HRD manage weekly focus; Recruiter sees only own active focus; Customer has no
     management access.
   - Browser/localStorage mock only; live Chromium UAT on Railway passed.
3. PR #18 `codex/phase-1-auth-rls-foundation`
   - Base: PR #20; head `4d786782505681acd664fd13256d429f6312fb3a`.
   - Git-only Auth/RLS schema: profiles, four roles, invitations, Customer intake
     requests/events, audit and integration metadata.
   - Customer reads only own source request; Head/HRD management scope; Recruiter reads
     no source Customer request even when assigned.
   - Foundation-only and full-chain ephemeral PostgreSQL verification passed.
4. PR #21 `codex/weekly-focus-durable-foundation`
   - Base: PR #18; head `f0c72fd3669a6a4745ac95d4a485db77c70d15a9`.
   - Git-only `weekly_focus_items` durable/RLS contract with Recruiter-owner and Head/HRD
     actor integrity guards.
   - CI #187 and PostgreSQL run #33984079497 green.
5. PR #22 `codex/handoff-sync-20260905`
   - Base: PR #21; head `be30001ec5734feb0474f42a6b87845ba496fdf0`.
   - Synchronizes `AGENTS.md`/handoff with actual stack, Supabase environment facts and
     public-reference/governance findings.
   - CI #189 green.
6. PR #23 `codex/weekly-focus-atomic-mutations`
   - Base: PR #22; head `5f07db488206a7707838cc690a2b49c67760bd15`.
   - Service-role-only atomic create/update/close RPCs for weekly focus with `audit_events`.
   - Strict optimistic concurrency uses a monotonically advancing row version rather than
     transaction-stable `now()`; closed rows are terminal in the reviewed RPC contract.
   - CI #199 and exact-code PostgreSQL run #33985804259 green.
7. PR #24 `codex/intake-request-atomic-transitions`
   - Base: PR #23; current code/test head before this handoff update: `d0ca942409e5a8074533d25818ca926ccefce0ed`.
   - Git-only durable Customer-request state machine for an already existing Customer-owned
     request: save draft, submit, return, accept and assign Recruiter.
   - Allowed transitions are exactly `draft|returned → submitted`,
     `submitted → returned|accepted`, `accepted → assigned`.
   - Customer may edit/submit only own request; Head/HRD return/accept/assign; return
     requires a comment; assignment requires an active Recruiter.
   - Customer ownership is immutable; request narrative is editable only in draft/returned;
     application request events are append-only and source requests are not service-role
     deletable.
   - Recruiter still reads **0 source requests and 0 source request events after assignment**.
   - Every reviewed mutation is optimistic-concurrency protected and audited atomically;
     a forced audit failure rolls back both the request transition and event.
   - CI #201 and ephemeral PostgreSQL run #33986202494 green. SQL did not change between
     that DB run and the code/test head; the only follow-up was a structural-test fix.
   - Secure/expiring request-link issuance is deliberately not implemented here.

## Product boundaries that remain mandatory

- Huntflow is the only source of truth for candidates, vacancies, funnel and recruitment
  state. Never add candidate/vacancy catalogs, cards, kanban or pipeline boards to HR Hub.
- Exactly four portal roles exist: Recruiter, Head of Recruitment, HRD and Customer.
- Head of Recruitment and HRD have equal management permissions. There is no
  Administrator role.
- Customer is isolated from the internal HR Hub.
- Recruiter does not receive source Customer request data; assignment alone never grants
  source-request access.
- AI prepares/explains/proposes; a human confirms consequential content and actions.
- Development and UAT use synthetic or de-identified data only.

## Weekly focus status

Weekly-focus management UI is implemented in PR #20 and browser-UAT verified.

Current runtime remains intentionally mock/local:
- management changes are in localStorage;
- no Auth-bound Next.js server adapter exists;
- no approved HRM cloud database is connected;
- no Huntflow mutation occurs.

PR #21 defines durable storage/RLS. PR #23 defines reviewed server-only mutation RPCs,
atomic audit and optimistic concurrency. Neither wires the browser UI to Supabase.

## Customer request status

The Customer request/management UI currently remains the browser mock implementation.
PR #18 defines durable request storage/RLS and PR #24 defines the reviewed database state
machine for existing authenticated Customer-owned requests.

Prepared in Git/PostgreSQL:
- draft/returned Customer editing;
- Customer submit;
- Head/HRD return with mandatory revision comment;
- Head/HRD accept;
- Head/HRD assign an active Recruiter;
- append-only application transition events;
- atomic audit + optimistic concurrency;
- Recruiter source-request isolation after assignment.

Still not implemented/approved:
- secure request-link issuance/revocation/expiry;
- creation/provisioning of a request through that secure link;
- Auth-bound Next.js server adapter;
- notification delivery to Head/HRD;
- rate limiting/bot protection/abuse controls;
- derived Recruiter working-context delivery after assignment.

Do not treat the current mock `[token]` route as a production authentication mechanism.

## Auth / database status

PRs #18/#21/#23/#24 are Git-only Supabase/PostgreSQL foundations verified in isolated
PostgreSQL 16. None has been applied to a cloud HRM project.

A read-only Supabase project check on 2026-09-05 shows only:
- `ivideon-seabattle` (`teyilcysjsvitpkwyxom`);
- `tablereels` (`lzhoqehvbcwellkyvrne`).

No HRM/HRM-Hub project is visible in the current connected account. Historical docs/issues
claiming otherwise are stale for this session. Never apply HRM migrations to either visible
non-HRM project and do not create a new cloud project without explicit Product Owner approval.

## Audit status

Current top-stack usage scan run `33986346224` found:
- 8 real `INSERT INTO public.audit_events` writers in current DB migrations;
- 0 direct `UPDATE public.audit_events` usages;
- 0 direct `DELETE FROM public.audit_events` usages;
- the only broad application UPDATE/DELETE privilege originates from the Phase-1
  foundation grant.

This makes application-level append-only audit hardening the next safe Git-only security
slice; it must still be verified independently before being considered prepared.

## UAT / preview

Temporary product browser UAT remains on Railway:
`https://uat-pr16-production.up.railway.app/uat-review`.

Temporary `/uat-review` role-switch routes are UAT-only and must never be copied into a
production branch.

Database-only PRs #18/#21/#23/#24 have no browser runtime integration; acceptance is via
static regression tests plus isolated PostgreSQL execution/RLS/mutation checks.

## Not implemented or connected

- Real user authentication or SSO.
- Runtime Supabase Auth/session integration in Next.js.
- Approved HRM development/production Supabase environments.
- Auth-bound Next.js server actions/adapters for weekly focus or Customer requests.
- Replacement of localStorage/request mocks by the durable backend.
- Secure Customer request-link issuance/revocation/expiry.
- Customer-request notifications/rate limits/bot protection.
- Huntflow API synchronization or mutation.
- Gmail/Yandex Mail sending.
- Real AI/LLM interview processing or real candidate-media processing.
- Production observability/queues/background jobs.
- Adaptation content in the new Recruit IA; stage 10 remains backlog.

## Governance blockers

Fresh checks on 2026-09-05 show:
- repository visibility is `public`;
- `main` is unprotected;
- required checks are not enforced on `main`;
- repository rulesets are empty;
- issue #3 remains open.

Public-reference exposure:
- privacy-safe scan run `33984545632`: 191 text files checked, 0 high-confidence credential
  files, no phone candidates;
- historical standalone contains 3 distinct human-looking emails, 2 on `ivideon.tech`;
- full values were intentionally not printed;
- standalone is **not public-safe until explicitly sanitized/classified**;
- public `Recruitment_in_Ivideon.pdf` remains content-unclassified;
- a future deletion commit would not erase already-public Git history.

Do not change visibility, branch protection, rulesets, history or owner-level security
settings without a separate Product Owner decision.

## Verification expectations

Before claiming a later head is ready:
- re-check actual PR head/base/draft/review threads;
- require frozen install → lint → tests → production build;
- execute RLS/database migrations in isolated PostgreSQL/Supabase-compatible environment
  and verify allow/deny/rollback cases, not only string tests;
- run real browser UAT for user-visible/runtime changes;
- never represent a mock or Git-only schema as production backend.
