# Recommended implementation roadmap

This is an implementation order, not authorization to connect or mutate an external
service without the product owner's confirmation.

## Phase 0 — Make the project portable

- [x] Create the private GitHub repository MariyaUmarova/HRM-System.
- [x] Push the verified baseline to main (the repository had no application base
  branch to target with a pull request).
- [x] Enable CI for lint, tests and build.
- [ ] Protect main and require the CI check for future pull requests.
- [x] Connect Vercel to GitHub and publish browser-accessible previews.
- [ ] Record environments: preview, development and production.

Current status: the source is available in private GitHub and Vercel creates preview
deployments for review branches.

## Phase 1 — Supabase foundation

- [x] Build the agreed invitation contract prototype: @ivideon.com only,
  Recruiter/Customer roles, and department/position required for a Customer.
- Create separate development and production Supabase projects.
- [x] Add the first Supabase config and versioned SQL migrations for the synthetic
  HR Radar development slice.
- Implement Auth and server-side session validation.
- Model profiles and four product roles.
- Enforce RLS, including strict customer request isolation.
- Create audit events and integration connection metadata without storing raw secrets.
- Add database tests and run Supabase security/performance advisors.

Exit: real accounts and durable requests work safely; mock role switching is disabled
outside local development.

## Phase 2 — Customer requests and management queue

- Issue expiring/single-purpose customer request links.
- Support draft, submitted, returned for revision, accepted and assigned states.
- Notify only Head of Recruitment and HRD about new submissions.
- Allow management to assign a recruiter and record every status change.
- Add rate limits, bot protection and audit history.

Exit: a customer can submit safely from any device without seeing the internal portal.

## Phase 3 — Huntflow server integration

- Confirm Huntflow API permissions, rate limits and webhook/polling capabilities.
- Keep the API token server-side in a managed secret store.
- Map only external IDs, deep links, sync timestamps and required attachment metadata.
- Implement idempotent jobs, retry/backoff, dead-letter handling and reconciliation.
- Attach interview analysis and generated offer files back to the correct Huntflow
  candidate only after an explicit user confirmation.

Exit: integrations save clicks without duplicating Huntflow's ATS data model.

## Phase 4 — Offer Center

- [x] Build the supplied field model, fixed cover/task pages, optional task results,
  assigned-request prefill, explicit human check and direct PDF/PNG/PPTX downloads for
  product-owner testing.
- Create durable versioned templates and persistence for approved artifacts.
- Parse a free-form recruiter brief into structured fields with a review screen.
- Validate required fields and highlight uncertainty; never invent compensation or
  legal terms.
- Render polished PDF, store exact artifact version and generate the fixed approval
  email with sanitized CV/offer attachments.
- Add Gmail and Yandex Mail adapters; start with drafts, then enable sending only with
  explicit confirmation and audit.
- Upload the approved offer to Huntflow idempotently.

Exit: the recruiter prepares a correct, reviewable approval package with minimal work.

## Phase 5 — Interview AI and search copilot

- [x] Build a client-only contract prototype on synthetic data: evidence-linked facts,
  conclusions, risks and questions, editable Huntflow draft and explicit human check.
- Accept authorized interview material and apply retention/redaction rules.
- Produce evidence-linked structured analysis with human approval.
- Export the approved result to Huntflow.
- Build search strategy help: role map, sourcing channels, Boolean queries and a short
  prompt for the approved corporate AI chat.
- Add spelling assistance as suggestions, not invisible edits.

Exit: AI accelerates preparation and analysis while humans approve all consequential
content.

## Phase 6 — HR radar and knowledge operations

- [x] Build a manually reviewed, attributed HR-news prototype with topic/text filters,
  source links, saved items, freshness labels and explicit source-health notes.
- [x] Ingest the first permitted RSS source (Mintrud document feed) into a private
  review queue on a daily 09:00 MSK schedule.
- Add approved automatic adapters for hh.ru, CIPD and later sources. Respect source
  terms and copyright.
- [x] Deduplicate discovered Mintrud links and keep source attribution.
- Add reviewed summaries/classification for additional sources; AI must never publish
  automatically.
- Use Perplexity/web search as a discovery layer, not as an unverified database.
- Add editorial review, freshness indicators and source health monitoring.
- Add knowledge content ownership, revision history and stale-content reminders.

Exit: a useful, attributable HR news feed and maintainable knowledge base.

## Phase 7 — Production hardening and scale

- Background job queue, distributed tracing, error monitoring and alerting.
- Backup/restore drills, incident runbooks and data deletion/export procedures.
- Load testing, rate limits and cost controls for AI and external APIs.
- Security review, privacy impact assessment and model abuse protections.
- Only introduce a Data Lake, Warehouse, Feature Store or dedicated model server when
  measured volume/reuse requires it. Start with a modular monolith and managed
  services; avoid premature platform complexity.

Exit: production readiness is demonstrated by tests, monitoring and operational
runbooks rather than architecture diagrams alone.
