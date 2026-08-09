# GitHub and Codex setup

The goal is to make GitHub the portable source of the project so a new Codex can work
from any authorized computer.

## Owner setup

1. Create a new GitHub account or organization if desired.
2. Enable two-factor authentication and save recovery codes securely.
3. Create an empty **private** repository, for example `ivideon-hr-hub`.
4. Do not add a README, license or `.gitignore` if the repository will receive this
   prepared tree; that avoids an unnecessary first-history conflict.
5. Connect GitHub to Codex with the official authorization/OAuth flow and grant access
   only to this repository.
6. Tell Codex the non-secret identifier `owner/ivideon-hr-hub`.
7. Let Codex initialize Git locally, commit on a feature branch, push and open a pull
   request. Do not paste a password or personal access token into chat.

## Recommended repository controls

- Default branch: `main`.
- Private visibility.
- Require pull requests before merge.
- Require the CI `verify` job.
- Block force pushes and branch deletion on `main`.
- Enable secret scanning and Dependabot alerts where available.
- Keep production deployment approvals separate from code write access.

## Codex behavior

- Keep `AGENTS.md` in the repository root; it contains durable product constraints.
- Each task starts by reading `AGENTS.md`, current state, decisions and relevant docs.
- Work on a branch and use small, reviewable commits.
- Never push to a repository until the owner confirms its exact name.
- Never commit `.env.local`, API tokens, CVs, offer PDFs containing PII or production
  database exports.

## Starting on another computer

The user signs into Codex and GitHub, opens the GitHub repository in a new Codex task,
and gives it `FINAL_PROMPT_FOR_NEW_CODEX.md`. The repository replaces the old local
path as the shared source of truth. A deployment URL replaces `localhost` for viewing.

Official references:

- Codex cloud environments: <https://learn.chatgpt.com/docs/environments/cloud-environment.md>
- `AGENTS.md` behavior: <https://learn.chatgpt.com/docs/agent-configuration/agents-md.md>
- Importing preferences from Claude Code: <https://learn.chatgpt.com/docs/import.md>
