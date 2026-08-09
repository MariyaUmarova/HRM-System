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

- Next.js App Router, React, TypeScript and Tailwind frontend exists and builds.
- Phase 1 uses synthetic mock adapters only.
- 57 tests cover workflow order, roles, customer isolation, knowledge search,
  tooltips and structural ATS-duplication guardrails.
- GitHub, Supabase, deployment, Huntflow, mail and AI are not connected yet.
- Do not report an integration as working until it has been implemented and verified.

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
- Customer requests are visible only to Head of Recruitment and HRD. Head of
  Recruitment assigns an accepted request to a recruiter.
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

- Use a dedicated development project with synthetic data. Never connect an AI agent
  through MCP to production HR data.
- Scope Supabase access to one project. Start read-only and enable only required tools.
- Never commit or print secret keys, service-role keys, passwords, tokens or real PII.
- Browser code may use only the project URL and publishable key.
- Server secrets must remain server-only and must never use a `NEXT_PUBLIC_` prefix.
- Enable RLS on every exposed table and write policies for the actual role and row
  boundaries. `TO authenticated` alone is not authorization.
- Authorization roles belong in trusted server-managed data such as `app_metadata`,
  not user-editable metadata.
- Schema changes must be reproducible in `supabase/migrations/` and reviewed in Git.
- Run Supabase security/performance advisors and a test query before declaring a
  database change complete.
- Check current Supabase docs and breaking-change notes before implementation.

## GitHub and delivery rules

- The private GitHub repository becomes the source of code and documentation.
- Work on a branch; use pull requests for review. Do not push directly to protected
  `main` without explicit confirmation.
- Never commit `.env.local`, credentials, build output or dependencies.
- Before commit: inspect the diff and scan for secrets and personal data.
- Before merge: run lint, tests and the production build.
- Do not deploy to production without explicit user confirmation.

## Engineering boundaries

- Keep a modular monolith until scale justifies separation.
- External systems must sit behind typed server-side adapters.
- Integration credentials never belong in the browser.
- Prefer outbox/idempotency/audit patterns for external side effects.
- Preserve accessibility and responsive behavior from 320px.
- The shared `?` tooltip must work with hover, keyboard focus, tap, outside click and
  collision-aware placement. Essential instructions cannot live only in tooltips.

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
3. For architecture, database, auth, external writes or deployment: propose a plan
   and wait for approval before mutating external systems.
4. Implement one vertical slice at a time.
5. Verify proportionally to risk.
6. Update `docs/handoff/CURRENT_STATE.md`, `ROADMAP.md` and `DECISIONS.md` when the
   repository state or an architectural decision changes.
7. Finish with changed files, checks, remaining mocked areas and the next safe step.

