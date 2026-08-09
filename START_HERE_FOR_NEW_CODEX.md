# Start here — continuing in a new Codex

The portable source of truth is the private GitHub repository:

`MariyaUmarova/HRM-System`

Do not ask the user to upload the old ZIP or reconstruct the original local Codex
path. Open the repository through the authorized GitHub connection.

## New Codex checklist

1. Read `AGENTS.md` and every current handoff/product document it names.
2. Read `FINAL_PROMPT_FOR_NEW_CODEX.md`.
3. Inspect the actual code before making claims about implementation status.
4. Install from the checked-in lockfile and run the baseline checks.
5. Report the actual repository, branch and check results.
6. Work from a new `agent/<description>` branch and open a draft pull request.
7. Never request passwords, PATs, database passwords or Supabase secret keys in chat.
8. Use only synthetic HR data until production privacy/security approval exists.

## Baseline commands

```bash
corepack pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
```

Expected verified baseline: lint passes, 57 tests pass, and the Next.js production
build succeeds.

## Current external state

- GitHub: connected to `MariyaUmarova/HRM-System`.
- GitHub Actions: CI baseline passes on `main`.
- Supabase: not connected; use only the confirmed development `project_ref` after
  explicit approval of schema and RLS.
- Hosting: no browser-accessible preview/production deployment yet.
- Huntflow, mail and AI: not connected.
