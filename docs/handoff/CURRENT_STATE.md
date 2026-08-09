# Current state at handoff

Handoff date: 2026-08-09.

## Implemented

- Next.js 16, React 19 and TypeScript application.
- Responsive internal workspace and isolated customer request view.
- Development role preview for Recruiter, Head of Recruitment, HRD and Customer.
- Head of Recruitment and HRD share the same management access model.
- Exact approved ten-stage recruiter workflow.
- Each workflow stage contains “Вход в процесс”, “Участники” and
  “Процесс завершён, когда”.
- Knowledge base with instructions, templates, tips and search.
- Contextual help tooltip that supports mouse hover, keyboard focus and touch.
- Weekly recruiter focus, offer approval and draft artifact mock cards.
- Customer intake request mock flow with status and assignment controls for
  management roles.
- Placeholder screens for Offer Center, interview analysis, HR radar and platform
  management. They explicitly identify disconnected functionality.
- Typed adapter boundaries for future Huntflow and backend integrations.
- Synthetic fixtures only; no real candidate, employee or vacancy records.
- Automated guardrails for workflow order, role access, customer isolation,
  knowledge integrity, search, requests and tooltips.
- Private GitHub source repository `MariyaUmarova/HRM-System` with the verified
  baseline on `main` and passing GitHub Actions CI.

## Not implemented or connected

- Real user authentication or SSO.
- Supabase database, Auth, Storage, Realtime or Edge Functions.
- Production hosting and domain.
- Huntflow API synchronization.
- Gmail or Yandex Mail integration.
- AI parsing, interview analysis or spelling correction.
- Perplexity/RSS/news ingestion.
- Offer document rendering, immutable versioning and email dispatch.
- Production audit log, observability, queues and background jobs.

## Important technical facts

- Role selection currently uses a development-only cookie. It is not a security
  boundary and must be replaced by server-validated Auth plus database RLS.
- Mock request data is in process memory and resets when the server restarts.
- Huntflow adapters intentionally expose single-object references only. Do not add
  vacancy or candidate list pages to this portal.
- Placeholder functionality must remain clearly marked until a real backend path is
  implemented and tested.
- Historical Claude prompts in `docs/CLAUDE_*.md` describe earlier work. They are not
  current product authority; `AGENTS.md` and `docs/product/` take precedence.

## Expected verification baseline

```bash
pnpm lint
pnpm test
pnpm build
```

At handoff the expected result is: lint passes, 57 tests pass, and the production
build succeeds. The receiving agent must rerun these checks and report the actual
result before making material changes.
