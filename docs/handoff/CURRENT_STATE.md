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
   - Contains the approved ten-stage workflow, global search, Playbook, Scripts,
     Templates/Checklists, exactly two Helpers, Offer Center, HR Radar, customer-request
     routes and contextual platform management.
2. PR #20 `codex/weekly-focus-management`
   - Base: PR #16.
   - Head: `ecd156fe619f679d4a85ebba1fcd9d4b53cfd7d7`.
   - Draft/open.
   - Head/HRD can create, edit and close weekly focus; Recruiter sees only own active
     focus; Customer has no management access.
   - Persistence is intentionally browser/localStorage mock only.
   - Live Chromium UAT against Railway passed the full Head → Recruiter → HRD → close
     role-switch flow, including full-page reload persistence and access denial.
3. PR #18 `codex/phase-1-auth-rls-foundation`
   - Base: PR #20.
   - Head: `4d786782505681acd664fd13256d429f6312fb3a`.
   - Draft/open.
   - Git-only Auth/RLS schema foundation: profiles, four roles, invitations, durable
     customer intake requests/events, audit metadata and integration metadata.
   - Recruiter has no direct read of source Customer intake requests; Customer reads only
     own requests; Head/HRD share management scope.
   - No Supabase SDK/runtime Auth wiring and no cloud migration application.
   - CI and ephemeral PostgreSQL verification passed both foundation-only and full-chain
     migration states.
4. PR #21 `codex/weekly-focus-durable-foundation`
   - Base: PR #18.
   - Head: `f0c72fd3669a6a4745ac95d4a485db77c70d15a9`.
   - Draft/open.
   - Git-only durable `weekly_focus_items` persistence contract.
   - Stores portal-owned focus data plus Huntflow reference fields only; it is not a
     vacancy catalog.
   - Head/HRD read team/history scope; Recruiter reads only own active rows; Customer and
     anon read nothing; authenticated browser has no write grants.
   - Database role-integrity guard requires a Recruiter owner and Head/HRD mutation actors.
   - CI #187 and ephemeral PostgreSQL run #33984079497 are green.
5. PR #22 `codex/handoff-sync-20260905`
   - Base: PR #21.
   - Draft/open.
   - Synchronizes `AGENTS.md` and handoff docs with the actual stack, current Supabase
     visibility and repository-governance/public-reference findings.
   - CI #189 is green.
6. PR #23 `codex/weekly-focus-atomic-mutations`
   - Base: PR #22.
   - Draft/open.
   - DB-verified code head: `4c08e5b93aefdac76fdb7c59d63e7c181c9b426f` before this handoff-only update.
   - Adds service-role-only atomic create/update/close PostgreSQL RPCs for weekly focus.
   - Every successful mutation writes `audit_events` in the same transaction.
   - Update/close require optimistic concurrency; a strictly advancing weekly-focus row
     version avoids PostgreSQL transaction-stable `now()` collisions.
   - Closed rows cannot be updated/reopened/deleted through these RPCs.
   - Browser roles cannot execute mutation RPCs; future server code must derive actor id
     from the validated server session rather than a browser-supplied value.
   - CI #196 and exact-head ephemeral PostgreSQL run #33985804259 are green.

## Product boundaries that remain mandatory

- Huntflow is the only source of truth for candidates, vacancies, funnel and recruitment
  state. Never add candidate/vacancy catalogs, cards, kanban or pipeline boards to HR Hub.
- Exactly four portal roles exist: Recruiter, Head of Recruitment, HRD and Customer.
- Head of Recruitment and HRD have equal management permissions. There is no
  Administrator role.
- Customer is isolated from the internal HR Hub.
- Recruiter does not receive source Customer request data; working context must come via
  an explicitly allowed derived artifact/Huntflow boundary.
- AI prepares/explains/proposes; a human confirms consequential content and actions.
- Development and UAT use synthetic or de-identified data only.

## Weekly focus status

Weekly-focus management UI is implemented in PR #20 and browser-UAT verified.

Current runtime behavior is still intentionally mock/local:
- management changes are stored in localStorage;
- the Next.js application has no real Auth-bound server adapter yet;
- no approved HRM cloud database is connected;
- no Huntflow mutation is performed.

PR #21 defines the durable table/RLS boundary. PR #23 defines reviewed server-only
PostgreSQL mutation RPCs plus atomic audit and optimistic concurrency. Neither PR wires
the browser UI to Supabase or makes localStorage production persistence.

## Auth / database status

PR #18 contains a Git-only Supabase/PostgreSQL schema foundation and has been exercised in
an ephemeral PostgreSQL 16 environment. PR #21 extends that Git-only schema for weekly
focus; PR #23 adds server-only mutation functions. None has been applied to any cloud
project.

A read-only `Supabase.list_projects` check on 2026-09-05 shows only:
- `ivideon-seabattle` (`teyilcysjsvitpkwyxom`);
- `tablereels` (`lzhoqehvbcwellkyvrne`).

No HRM/HRM-Hub project is visible in the current connected Supabase account. Historical
issues/docs that claim an HRM project is currently connected are stale for this session
and must not be used to select a migration target.

Do not apply HRM migrations to either visible non-HRM project. Do not create a new cloud
project without an explicit Product Owner decision.

## UAT / preview

The temporary browser UAT for the Recruit shell/weekly-focus product flow is on Railway:
`https://uat-pr16-production.up.railway.app/uat-review`.

The UAT branch contains only the temporary `/uat-review` role-switch routes on top of the
verified product baseline. Those routes must never be copied into a production product
branch.

Database-only PRs #18/#21/#23 do not have a browser runtime integration yet; their
acceptance uses static regression tests plus ephemeral PostgreSQL execution/RLS/mutation
checks.

## Not implemented or connected

- Real user authentication or SSO.
- Runtime Supabase Auth/session integration in Next.js.
- Approved HRM development/production Supabase environments.
- Auth-bound Next.js server actions/adapters that call the weekly-focus RPCs.
- Replacement of the weekly-focus localStorage store by a server adapter.
- Production customer-request persistence wiring in the UI.
- Huntflow API synchronization or mutation.
- Gmail/Yandex Mail sending.
- Real AI/LLM interview processing or real candidate-media processing.
- Production audit delivery/observability/queues/background jobs.
- Adaptation content in the new Recruit IA; stage 10 remains backlog.

## Governance blockers

Fresh GitHub checks on 2026-09-05 show:
- repository visibility is `public`;
- `main` is `protected: false`;
- required status checks are not enforced on `main`;
- repository rulesets are empty (`[]`);
- issue #3 remains open.

Public-reference exposure was also independently checked on 2026-09-05:
- privacy-safe scan run `33984545632` inspected 191 tracked text files and found
  **0 high-confidence credential files** and no phone candidates;
- `docs/references/v7_4/ivideon-recruit-standalone-v7_4.html` contains 3 distinct
  human-looking email addresses; 2 use the corporate `ivideon.tech` domain;
- full email values were deliberately not printed in public logs;
- the standalone must therefore be treated as **not public-safe until explicitly
  sanitized/classified**;
- `docs/references/v7_4/Recruitment_in_Ivideon.pdf` is public but remains content-
  unclassified because the currently available binary path cannot be reviewed through
  the required PDF screenshot workflow;
- deleting a reference only in a future commit would not erase its existing public Git
  history.

These are merge/security blockers. Do not change repository visibility, branch protection,
history or owner-level security settings without a separate Product Owner decision.

## Verification expectations

Before claiming any later head is ready:
- re-check the actual PR head SHA, base, draft/open state and review threads;
- require full CI: frozen install → lint → tests → production build;
- for RLS/database changes, execute the migrations in an isolated PostgreSQL/Supabase-
  compatible test environment and verify allow/deny cases, not only string tests;
- for user-visible changes, run real browser UAT;
- never represent a local/browser mock or Git-only schema as a production backend.
