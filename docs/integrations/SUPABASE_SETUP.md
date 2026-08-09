# Supabase setup and safety contract

Use a brand-new Supabase account if preferred. The GitHub and Supabase accounts do not
need to be old accounts, but they must use strong authentication and least privilege.

## Owner setup

1. Create a Supabase organization with two projects when ready:
   `ivideon-hr-hub-dev` and `ivideon-hr-hub-prod`.
2. Start only with the development project.
3. Enable MFA and keep recovery information outside the repository.
4. Connect Supabase to the new Codex through its supported connector/MCP authorization
   flow. Scope it to the development `project_ref` and start read-only when possible.
5. Tell Codex only the development `project_ref`. Do not paste database passwords,
   service-role/secret keys or access tokens into chat.
6. Put public browser configuration in the deployment provider's environment settings;
   put privileged secrets only in server-side managed secrets.

## Key rules

- A publishable/anon key is designed for browser use only together with correct RLS.
- Secret/service-role keys are privileged, server-only and must never use the
  `NEXT_PUBLIC_` prefix.
- Do not place any real values in `.env.example`.
- Development and production must use different projects and secrets.
- Rotate a key immediately if it is pasted into chat, committed or exposed in logs.

## Database workflow

- Every schema change is a timestamped SQL migration under `supabase/migrations/`.
- Apply migrations to development first, test, review, then promote explicitly.
- Do not make untracked dashboard-only schema edits.
- Enable RLS on every user/business table before adding client access.
- Roles belong in server-controlled claims/metadata, not user-editable profile fields.
- Customer request policies must prevent all cross-customer reads and writes.
- Add indexes for foreign keys and common policy filters.
- Run Supabase security and performance advisors after schema/RLS changes.

## Suggested first schema slice

- `profiles` — auth user profile and server-controlled role projection.
- `intake_requests` — customer request, status and owner/assignee references.
- `intake_request_events` — immutable status/audit history.
- `weekly_focuses` — weekly recruiter priorities.
- `offer_cases` and `offer_artifacts` — portal workflow metadata and versioned files,
  referencing Huntflow IDs without duplicating candidate data.
- `audit_events` — sensitive actions and integration outcomes.

The receiving agent must propose the detailed schema and RLS matrix for review before
applying it.

## Example MCP shape

The exact connector UI/config may change. If a local MCP URL is needed, use a
project-scoped, initially read-only endpoint and substitute the real development ref:

```text
https://mcp.supabase.com/mcp?project_ref=YOUR_DEV_PROJECT_REF&read_only=true
```

After authentication and project confirmation, the agent may inspect the development
project. It must not link to production or run destructive SQL without explicit owner
approval.

Official references:

- Supabase MCP: <https://supabase.com/docs/guides/ai-tools/mcp>
- API keys: <https://supabase.com/docs/guides/getting-started/api-keys>
