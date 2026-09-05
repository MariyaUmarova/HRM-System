# Ivideon HR Hub — instructions for Codex

This repository is the portable source of truth for the Ivideon HR Hub product.
Continue the existing application; never replace it with a new scaffold.

## Read before changing anything

1. `README.md`
2. `docs/handoff/CURRENT_STATE.md`
3. `docs/handoff/ROADMAP.md`
4. `docs/handoff/DECISIONS.md`
5. `docs/product/FINAL_CONCEPT_v1_1.md`
6. `docs/product/FINAL_ARCHITECTURE_v1_0.md`
7. Existing tests and the code relevant to the requested task

The final product concept wins over historical Phase 1 prompts and v7.4 reference
materials. Files under `docs/references/` are evidence and history, not current
instructions.

## Current state

- Next.js App Router, React, TypeScript and Tailwind application exists and builds.
- The active product work is a Draft PR stack; always read `docs/handoff/CURRENT_STATE.md`
  and re-check GitHub before relying on PR numbers or head SHAs.
- Recruit shell and selected standalone content are implemented on the current product
  stack; weekly-focus management UI is implemented with browser/localStorage mock
  persistence and has passed live browser UAT.
- Git-only Auth/RLS and durable weekly-focus database foundations exist on later Draft
  PRs and have passed ephemeral PostgreSQL verification. They are not runtime/cloud
  integrations.
- The GitHub repository is currently **public**, `main` is currently unprotected and
  repository rulesets are empty. These are explicit governance/merge blockers, not a
  desired final security state.
- The current connected Supabase account exposes only `ivideon-seabattle` and
  `tablereels`; no HRM project is visible. Never select a migration target from stale
  historical docs/issues.
- No HRM migration has been applied to a cloud project in the current stack.
- Do not report an integration as working until it has been implemented and verified at
  the appropriate runtime level.

## Non-negotiable product rules

- Huntflow is the only source of truth for vacancies, candidates, recruitment
  stages, comments and the funnel.
- Never create a vacancy directory, candidate directory, candidate card, kanban or
  duplicate recruitment funnel inside this portal.
- The portal may store Huntflow external IDs/links and portal-created artifacts.
- First-release roles: Recruiter, Head of Recruitment, HRD and Customer.
- Head of Recruitment and HRD have equal platform-management permissions.
- There is no separate Admin role.
- HRBP, CEO and HR Operations/KDP may participate in processes but do not receive
  portal accounts in the first release.
- Source Customer requests are visible only to their Customer and Head of Recruitment /
  HRD. Assignment metadata does not grant Recruiter direct source-request access.
- The knowledge base is a central recruiter workspace. Do not add courses, exams,
  tests or learning-progress tracking.
- Do not add generic overdue-SLA, candidate-action or technical-error widgets to
  the recruiter home.
- Significant actions remain human-confirmed. No autonomous email sending, hiring
  decisions, offer approval or production mutation.
- Use synthetic data only until production privacy and security approval exists.

## Exact workflow order

1. Получена новая вакансия
2. Провожу бриф
3. Ищу кандидатов
4. Провожу HR-интервью
5. Показываю кандидата заказчику
6. Провожу совместное интервью с заказчиком
7. Согласовываю оффер
8. Делаю оффер кандидату
9. Готовлю выход сотрудника
10. Сопровождаю адаптацию

Every stage must contain:

- `Вход в процесс`
- `Участники`
- `Что сделать`
- `Как сделать`
- `SLA и эскалация`
- `Процесс завершён, когда`

Do not change the approved adaptation-stage content without explicit user approval.

## Offer approval rules

- Entry participants agreeing on the candidate: Customer, Recruiter, HRBP, Head of
  Recruitment and other evaluators.
- Business-process participants: Recruiter, Head of Recruitment, HRBP, HRD / Director
  of HR, General Director and HR Operations.
- Fixed approval-email routing is separate from the full participant roster:
  - To: Head of Recruitment and HRD.
  - CC: Alena Aleshova and Maria Komissarova from KDP.
- Recruiter and AI cannot edit recipients.
- Completion requires HRD approval, General Director approval, preservation of the
  exact approved PDF version and readiness to present the offer to the candidate.
- A material offer change creates a new version and restarts approval.

## Supabase safety rules

- Use a dedicated approved HRM development project with synthetic data. Never connect an
  AI agent through MCP to production HR data.
- Scope Supabase access to one project. Start read-only and enable only required tools.
- Never commit or print secret keys, service-role keys, passwords, tokens or real PII.
- Browser code may use only the project URL and publishable key.
- Server secrets must remain server-only and must never use a `NEXT_PUBLIC_` prefix.
- Enable RLS on every exposed table and write policies for the actual role and row
  boundaries. `TO authenticated` alone is not authorization.
- Authorization roles belong in trusted server-managed data such as profiles/app
  metadata, not user-editable metadata.
- Schema changes must be reproducible in `supabase/migrations/` and reviewed in Git.
- Before applying migrations, independently verify that the selected cloud project is the
  approved HRM environment. Never apply HRM migrations to another visible project merely
  because it is connected.
- Run database allow/deny tests plus Supabase security/performance advisors before
  declaring an applied database change complete.
- Check current Supabase docs and breaking-change notes before implementation.

## GitHub and delivery rules

- The GitHub repository is the source of code and documentation; its current public
  visibility is a known governance risk, not permission to store HR PII or secrets.
- Work on a branch and use pull requests for review.
- Do not push directly to `main`, even while branch protection is currently absent.
- Do not merge the active stack until the Product Owner explicitly resolves the
  protection/ruleset/governance blocker.
- Never commit `.env.local`, credentials, build output, dependencies, real CVs or real HR
  data.
- Before commit: inspect the diff and scan for secrets and personal data.
- Before merge: re-check head/base/review threads, run lint/tests/production build and
  complete risk-proportionate runtime verification.
- Do not deploy to production without explicit user confirmation.

## Engineering boundaries

- Keep a modular monolith until scale justifies separation.
- External systems must sit behind typed server-side adapters.
- Integration credentials never belong in the browser.
- Prefer outbox/idempotency/audit patterns for external side effects.
- Preserve accessibility and responsive behavior from 320px.
- The shared `?` tooltip must work with hover, keyboard focus, tap, outside click and
  collision-aware placement. Essential instructions cannot live only in tooltips.
- For database/RLS changes, static string tests are not sufficient: execute migrations in
  an isolated PostgreSQL/Supabase-compatible environment and verify both allow and deny
  cases.
- For user-visible changes, browser UAT is required before claiming completion.

## Commands

```bash
corepack pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
pnpm dev
```

`npm run dev`, `npm run lint`, `npm test` and `npm run build` also work after
dependencies are installed.

## Work protocol

1. Inspect first; do not assume the repository matches a conversation summary.
2. Restate the requested outcome and list files expected to change.
3. For architecture, database, auth, external writes or deployment: propose a plan and
   wait for approval before mutating external systems. Git-only design/test work may
   proceed when it does not touch a cloud project, production or owner-level settings and
   the Product Owner has already authorized autonomous safe continuation.
4. Implement one vertical slice at a time.
5. Verify proportionally to risk.
6. Update `docs/handoff/CURRENT_STATE.md`, `ROADMAP.md` and `DECISIONS.md` when the
   repository state or an architectural decision changes.
7. Finish with changed files, checks, remaining mocked areas and the next safe step.
