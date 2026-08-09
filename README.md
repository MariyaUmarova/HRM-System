# Ivideon HR Hub

Portable handoff package for continuing the Ivideon HR Hub product in Codex,
Claude Code or another coding agent with authorized GitHub and Supabase access.

Start here:

1. Read [`START_HERE_FOR_NEW_CODEX.md`](START_HERE_FOR_NEW_CODEX.md).
2. Give the new Codex [`FINAL_PROMPT_FOR_NEW_CODEX.md`](FINAL_PROMPT_FOR_NEW_CODEX.md).
3. Keep [`AGENTS.md`](AGENTS.md) in the repository root so every Codex run receives
   the durable product rules.

## What is included

- runnable Next.js / TypeScript frontend;
- exact approved 10-stage recruiter workflow;
- role-aware screens for Recruiter, Head of Recruitment, HRD and Customer;
- knowledge base and contextual help patterns;
- synthetic mock adapters and mock data;
- 57 automated tests;
- final product concept and architecture;
- original v7.4 HTML, changelog, QA report and recruitment PDF;
- GitHub, Supabase and hosting handoff instructions;
- no credentials, secret keys or real candidate data.

## Current integration status

| Area | Status |
|---|---|
| Frontend, workflow, role preview, knowledge base | Implemented |
| Mock adapters and synthetic fixtures | Implemented |
| Supabase database and Auth | Not connected |
| GitHub repository and CI | CI file included; remote not connected |
| Huntflow API | Not connected |
| Gmail / Yandex Mail | Not connected |
| AI services and Perplexity | Not connected |
| Offer PDF generation | UI concept only |
| Hosting / production URL | Not connected |

## Local setup

Requirements: Node.js 20+ and Corepack.

```bash
corepack pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`.

If a global `pnpm` command is unavailable:

```bash
corepack pnpm dev
```

## Verification

```bash
pnpm lint
pnpm test
pnpm build
```

## Documentation map

- `AGENTS.md` — binding repository rules for Codex.
- `CLAUDE.md` — Claude Code entrypoint.
- `docs/handoff/CURRENT_STATE.md` — implemented state and known limitations.
- `docs/handoff/ROADMAP.md` — recommended implementation order.
- `docs/handoff/DECISIONS.md` — approved durable decisions.
- `docs/product/` — approved concept and architecture.
- `docs/references/v7_4/` — original historical/source materials.
- `docs/integrations/` — access and integration setup without secrets.

