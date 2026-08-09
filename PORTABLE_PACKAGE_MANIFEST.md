# Portable package manifest

Prepared: 2026-08-09.

## Included

- Existing Ivideon HR Hub Next.js source, tests and lockfile.
- Root instructions for Codex (`AGENTS.md`) and Claude Code (`CLAUDE.md`).
- Final receiving-agent prompt.
- Current-state, decisions and roadmap documents.
- GitHub, Supabase and hosting setup guides.
- Approved final product concept and architecture.
- Historical v7.4 standalone HTML, changelog, QA report and recruitment PDF.
- Screenshots from the implemented frontend.
- Empty environment template, CI workflow and empty migration directory.

## Intentionally excluded

- `node_modules`, `.next`, caches and generated build output.
- Git history and remote configuration.
- `.env` files and credentials.
- GitHub/Supabase/Huntflow/mail/AI tokens.
- Real candidates, CVs, offer documents and production exports.

## Restore

Extract the archive, open the `ivideon-hr-hub` folder and follow `README.md` and
`START_HERE_FOR_NEW_CODEX.md`. A new receiving agent should use
`FINAL_PROMPT_FOR_NEW_CODEX.md`.
