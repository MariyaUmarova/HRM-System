# Current state at handoff

Handoff date: 2026-08-17.

## Implemented

- Next.js 16, React 19 and TypeScript application.
- Responsive internal workspace and isolated customer request view.
- Development role preview for Recruiter, Head of Recruitment, HRD and Customer.
- The visible site menu does not expose role switching; it only identifies the
  server-provided test profile and role.
- Head of Recruitment and HRD share the same management access model.
- Exact approved ten-stage recruiter workflow.
- Each workflow stage contains “Вход в процесс”, “Участники” and
  “Процесс завершён, когда”.
- Knowledge base with instructions, templates, tips and search.
- Contextual help tooltip that supports mouse hover, keyboard focus and touch.
- Weekly recruiter focus, offer approval and draft artifact mock cards.
- Customer intake request mock flow with status and assignment controls for
  management roles.
- Offer Center prototype with the supplied field model, conditional selects and weekdays,
  fixed first and task pages, optional expected results, assigned-request position/department
  prefill, required human confirmation and direct PDF/PNG/PPTX downloads.
- Offer payments support an optional introduction, combined recurring bonuses (including
  monthly) and a separate hourly KPI supplement; short task lists fit up to five cards per page.
- Interactive Interview Analysis contract prototype with a synthetic source, vacancy
  criteria, editable facts/conclusions/risks/questions, evidence links, a reviewable
  Huntflow comment draft and mandatory human confirmation.
- Interactive HR Radar with a manually reviewed, attributed public-source news set,
  text/topic filters, per-tab saved items, freshness labels and source-control notes.
- Supabase-backed HR Radar ingestion foundation: a daily 09:00 MSK job, an allowlisted
  Mintrud RSS adapter, URL deduplication, a private editorial queue and run history.
  Newly discovered links are never published automatically.
- Interactive platform-management prototype for Head of Recruitment and HRD: exact
  @ivideon.com validation, Recruiter/Customer invitation roles, required department
  and position for Customers, and transparent client-only invitation drafts.
- Typed adapter boundaries for future Huntflow and backend integrations.
- Synthetic fixtures only; no real candidate, employee or vacancy records.
- Automated guardrails for workflow order, role access, customer isolation,
  knowledge integrity, search, requests, tooltips, profile header, offer review,
  interview review, attributed HR news and invitation rules.
- Private GitHub source repository MariyaUmarova/HRM-System with the verified
  baseline on main and passing GitHub Actions CI.

## Not implemented or connected

- Real user authentication or SSO.
- Supabase Auth, Storage and Realtime; the database and one Edge Function are connected
  only for the synthetic HR Radar development slice.
- Production hosting and domain.
- Huntflow API synchronization.
- Gmail or Yandex Mail integration.
- AI parsing, interview analysis or spelling correction.
- Perplexity and AI news summarization; hh.ru and CIPD do not yet have approved
  automatic adapters.
- Server-side offer rendering, durable storage, immutable versioning and email
  dispatch.
- Production audit log, observability, queues and background jobs.

## Important technical facts

- The preview role still comes from a development-only cookie, but users can no
  longer change it from the site menu. The cookie is not a security boundary and
  must be replaced by server-validated Auth plus database RLS.
- Mock request data is in process memory and resets when the server restarts.
- The Offer Center prototype is client-only: changing or refreshing the page discards
  the draft. PDF/PNG/PPTX are rendered from the same fixed 569 × 1013 page DOM; export is
  blocked when text overflows instead of silently shrinking fonts.
- PPTX uses a full-slide image per page for exact visual parity. Its text is intentionally
  not editable in this prototype.
- Huntflow adapters intentionally expose single-object references only. Do not add
  vacancy or candidate list pages to this portal.
- The Interview Analysis prototype is client-only and accepts only its supplied
  synthetic example. It does not call AI, persist content or write to Huntflow.
- HR Radar shows only editor-approved seed cards. Supabase automatically checks the
  allowlisted Mintrud RSS at 09:00 MSK and stores only metadata in a private
  `pending_review` queue; it does not call Perplexity/AI or persist saved items.
- The HR Radar database tables have RLS and no `anon`/`authenticated` table grants.
  The scheduled Edge Function uses a per-environment Vault secret whose hash is stored
  separately; the raw secret is not committed.
- Invitation preparation is client-only: it validates fields but does not send email,
  create a Supabase Auth user or persist the entered corporate address.
- Placeholder functionality must remain clearly marked until a real backend path is
  implemented and tested.
- Historical Claude prompts in docs/CLAUDE_*.md describe earlier work. They are not
  current product authority; AGENTS.md and docs/product/ take precedence.

## Expected verification baseline

    pnpm lint
    pnpm test
    pnpm build

At handoff the expected result is: lint passes, 95 tests pass, and the production
build succeeds. The receiving agent must rerun these checks and report the actual
result before making material changes.
