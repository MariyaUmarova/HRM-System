# Current state at handoff

Handoff date: 2026-09-03.

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
- Knowledge content with instructions, templates, tips and search.
- On draft PR #16, the internal Recruit experience uses the Ivideon Recruit standalone
  visual language: fixed 264 px sidebar, sticky global search, blue/white design tokens,
  route cards, playbook details, script cards and responsive mobile navigation.
- On draft PR #16, selected Recruit content is assembled without AI rewriting from two
  pinned sources: the repository historical v7.4 standalone for 106 selected objects
  proven identical to the Product Owner upload, plus an attachment-derived exact delta
  for the 21 selected objects that differ. Three historical-only objects absent from the
  uploaded HTML are explicitly removed from runtime.
- The uploaded Product Owner source identity is pinned as size 8,402,786 bytes,
  SHA-256 `e20c17fd4521880912fb9fae21e76c0e1ec87a1ffcd81df4a55b1ed20d832bcf`
  and Git blob SHA-1 `dc3516afbec2020d995d54c90389f5a3b0d9c6aa`. The attachment-derived
  21-object delta is also hash-pinned and covered by integrity tests.
- Product filtering removes adaptation content and non-approved constructors while
  preserving the current approved ten-stage route as an explicit structural override
  of the uploaded standalone's legacy eight-stage route.
- On draft PR #16, the target sidebar IA is: Главная, Рабочие ситуации, Скрипты,
  Шаблоны и чек-листы, Помощники and HR Radar. Full workflow, requests, Offer Center,
  Interview Analysis and platform management remain contextual routes rather than
  permanent menu items.
- On draft PR #16, platform management is exposed to Head of Recruitment and HRD by
  a profile-area gear icon; there is still no separate Administrator role.
- On draft PR #16, global Recruit search, playbook/script filtering, script copy actions
  and interactive checklist completion work in React/Next.js.
- On draft PR #16, “Помощники” contains only the two approved HR Hub tools:
  Interview Analysis and Offer Builder. Both routes are guarded by tests against
  accidental replacement with placeholder screens.
- Interview Analysis has a working local evidence-based text mode for arbitrary
  **synthetic or de-identified** recruiter notes/transcripts. It runs entirely in the
  browser with no API/network request, maps vacancy criteria to direct text evidence,
  turns unsupported criteria into explicit verification gaps/questions, prepares an
  editable Huntflow draft and requires human confirmation before copying. It is
  deliberately labelled as local preliminary analysis, not as a model/AI decision.
- Sensitive employment criteria are filtered before local interview evidence matching.
  Criteria involving protected/sensitive characteristics such as age, sex/gender,
  nationality/ethnicity/race, religion, disability/health/pregnancy, family status,
  children, sexual orientation, political views or trade-union membership cannot become
  supporting facts, conclusions, follow-up checks or Huntflow criteria. Blocked criteria
  are surfaced as excluded rather than evaluated.
- The existing staged Interview Analysis contract remains available as an advanced
  preview for combined transcript/summary/notes/feedback/audio/video inputs.
- Adaptation remains visible only as a workflow boundary and is explicitly marked
  backlog on draft PR #16; its standalone content is not imported.
- Contextual help tooltip that supports mouse hover, keyboard focus and touch.
- Weekly recruiter focus, offer approval and draft artifact mock cards.
- Customer intake request mock flow with status and assignment controls for
  management roles.
- The Recruit home on draft PR #16 preserves weekly focus for recruiters and preserves
  new customer requests, the “Все заявки заказчиков” entry and team weekly focus for
  Head of Recruitment / HRD.
- Offer Center prototype with the supplied field model, conditional selects and weekdays,
  fixed first and task pages, optional expected results, assigned-request position/department
  prefill, required human confirmation and direct PDF/PNG/PPTX downloads.
- Offer payments support an optional introduction, combined recurring bonuses (including
  monthly) and a separate hourly KPI supplement; short task lists fit up to five cards per page.
- Interactive Interview Analysis contract prototype with staged vacancy/material/context
  input, combinable transcript, short-summary, notes, feedback, audio and video sources,
  format validation, editable evidence-linked synthetic results, a reviewable Huntflow
  comment draft and mandatory human confirmation.
- Interactive HR Radar with a manually reviewed, attributed public-source news set,
  text/topic filters, per-tab saved items, freshness labels and source-control notes.
- Supabase-backed HR Radar ingestion foundation: an allowlisted Mintrud RSS adapter,
  URL deduplication, a private editorial queue and run history.
- Interactive platform-management prototype for Head of Recruitment and HRD: exact
  @ivideon.com validation, Recruiter/Customer invitation roles, required department
  and position for Customers, and transparent client-only invitation drafts.
- Typed adapter boundaries for future Huntflow and backend integrations.
- Synthetic fixtures only; no real candidate, employee or vacancy records.
- Automated guardrails for workflow order, role access, customer isolation,
  knowledge integrity, search, requests, tooltips, profile header, offer review,
  interview review, attributed HR news and invitation rules.
- Draft PR #16 adds source/delta integrity, safe-parser, helper-route/implementation,
  local-interview-analysis and sensitive-employment-criteria tests so source wording,
  helper behavior and hiring-safety boundaries cannot drift silently.
- GitHub source repository MariyaUmarova/HRM-System with CI on the current PR stack.

## Not implemented or connected

- Real user authentication or SSO.
- Supabase Auth, Storage and Realtime; the database and one Edge Function are connected
  only for the synthetic HR Radar development slice.
- Production hosting and domain.
- Huntflow API synchronization.
- Gmail or Yandex Mail integration.
- Real AI/LLM interview processing, media transcription, video-frame analysis or spelling
  correction. The local text helper is deterministic evidence matching, not an AI call;
  real candidate media is not uploaded.
- A currently verified ChatGPT scheduled web-discovery task for HR Radar. Repository
  documents describe the intended 09:00 MSK automation, but the current ChatGPT task
  state was not active when independently checked on 2026-09-03; do not treat it as
  running infrastructure until it is recreated and verified.
- Editorial approval UI for web-discovered HR news; direct source-specific adapters
  beyond the existing Mintrud RSS remain unapproved.
- Server-side offer rendering, durable storage, immutable versioning and email
  dispatch.
- Production audit log, observability, queues and background jobs.
- Adaptation content in the new Recruit IA; this vertical is intentionally backlog.
- Management editing of weekly focus; Head of Recruitment / HRD access is retained,
  but the requested focus-management UI is a follow-up task.

## Important technical facts

- The preview role still comes from a development-only cookie, but users can no
  longer change it from the site menu. The cookie is not a security boundary and
  must be replaced by server-validated Auth plus database RLS.
- Mock request data is in process memory and resets when the server restarts.
- Draft PR #16 is stacked on `codex/hr-radar-interview-inputs` (PR #15), which is
  stacked on the Offer Center prototype branch from PR #14. It must not be merged
  independently without resolving that stack.
- The standalone file is a read-only content/visual source, not a replacement for the
  Next.js architecture. Server code parses approved arrays from it; client pages receive
  structured typed data.
- The standalone parser treats the historical HTML as data only. It does not use
  `node:vm`, `runInNewContext`, `eval` or otherwise execute JavaScript from the reference
  file.
- The Product Owner upload and repository historical v7.4 file are not byte-identical.
  A machine comparison of selected collections found 106 identical objects, 21 changed
  objects and three historical-only objects. Runtime now uses the exact attachment-derived
  21-object delta for those differences and removes the three historical-only objects.
- The full 8.4 MB Product Owner HTML artifact is not committed to Git; its identity and
  selected-content delta are pinned instead. Do not describe the historical v7.4 file as
  byte-identical to the upload. The approved ten-stage route remains an intentional
  product override of the upload's legacy eight-stage `WORKFLOW_ROUTE`.
- The Offer Center prototype is client-only: changing or refreshing the page discards
  the draft. PDF/PNG/PPTX are rendered from the same fixed 569 × 1013 page DOM; export is
  blocked when text overflows instead of silently shrinking fonts.
- PPTX uses a full-slide image per page for exact visual parity. Its text is intentionally
  not editable in this prototype.
- Huntflow adapters intentionally expose single-object references only. Do not add
  vacancy or candidate list pages to this portal.
- The primary Interview Analysis helper can process arbitrary synthetic/de-identified
  text locally and deterministically. It only maps lexical evidence to allowed job
  criteria and explicitly treats missing evidence as a material gap, not a negative
  candidate judgement. It does not rank candidates, recommend hire/reject or call an
  external AI.
- Sensitive employment criteria are excluded in the analysis model itself, not merely
  hidden by UI. A regression test verifies that they cannot enter conclusions or the
  Huntflow draft.
- The advanced Interview Analysis prototype accepts combinations of text, audio and
  video input modes. Audio/video selection stores metadata in the browser only; file
  contents are not read, uploaded or persisted. A real cloud provider, retention period,
  access policy and audit path still require approval before real candidate media.
- HR Radar shows only editor-approved seed cards. The Supabase path checks the
  allowlisted Mintrud RSS and writes only to the private `pending_review` queue; saved
  items are not persisted.
- The HR Radar database tables have RLS and no `anon`/`authenticated` table grants.
  The scheduled Edge Function uses a per-environment Vault secret whose hash is stored
  separately; the raw secret is not committed.
- Invitation preparation is client-only: it validates fields but does not send email,
  create a Supabase Auth user or persist the entered corporate address.
- Placeholder functionality must remain clearly marked until a real backend path is
  implemented and tested.
- Historical Claude prompts in docs/CLAUDE_*.md describe earlier work. They are not
  current product authority; AGENTS.md and docs/product/ take precedence.

## Verification on PR #16

Verified on head `dee826747f3277aaf39a346e97d1ee7c73648cd8` in GitHub Actions run #63:

    pnpm lint   -> success (0 errors; 7 non-blocking warnings)
    pnpm test   -> 114/114 passed across 19 test files
    pnpm build  -> success, 65/65 static pages generated

Focused verification on the same head:

- `offer-center.test.tsx` — 17/17 passed.
- `interview-analysis.test.tsx` — 6/6 passed.
- `local-interview-analysis.test.tsx` — 4/4 passed, including sensitive-criteria exclusion.
- `recruit-source-integrity.test.ts` — 5/5 passed.
- `recruit-uploaded-delta.test.ts` — 4/4 passed.
- `recruit-helper-links.test.ts` — 4/4 passed.

Any later head must rerun all three baseline checks before review/merge.

Vercel status for this head is `success` and the deployment is reported Ready at:
`https://hrm-system-git-codex-recruit-html-shell-mariya-umarova.vercel.app`.
Browser UAT is still pending because that Preview is protected by Vercel Authentication
for the `MariyaUmarova` team. The currently connected Vercel account belongs to another
team and cannot generate a temporary share URL for this protected deployment. Do not
weaken production protection as a workaround.
