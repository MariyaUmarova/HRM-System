-- Phase 1 auth/RLS foundation.
--
-- Git-only contract: this migration is intentionally not applied to any cloud project by
-- this change. It contains no real users, candidate data, credentials or invitation tokens.
-- Runtime writes stay server-side until the corresponding server actions are implemented
-- and reviewed. Huntflow remains the only source of truth for vacancies/candidates/funnel.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role text not null,
  department text,
  position text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_normalized check (email = lower(email)),
  constraint profiles_email_ivideon check (email ~ '^[^@[:space:]]+@ivideon[.]com$'),
  constraint profiles_role_check check (
    role in ('recruiter', 'head_of_recruitment', 'hrd', 'customer')
  ),
  constraint profiles_customer_context_check check (
    role <> 'customer'
    or (
      nullif(btrim(department), '') is not null
      and nullif(btrim(position), '') is not null
    )
  )
);

create table public.user_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null,
  department text,
  position text,
  status text not null default 'draft',
  created_by uuid not null references public.profiles(id) on delete restrict,
  accepted_user_id uuid references public.profiles(id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_invitations_email_normalized check (email = lower(email)),
  constraint user_invitations_email_ivideon check (email ~ '^[^@[:space:]]+@ivideon[.]com$'),
  constraint user_invitations_role_check check (role in ('recruiter', 'customer')),
  constraint user_invitations_status_check check (
    status in ('draft', 'sent', 'accepted', 'revoked', 'expired')
  ),
  constraint user_invitations_customer_context_check check (
    role <> 'customer'
    or (
      nullif(btrim(department), '') is not null
      and nullif(btrim(position), '') is not null
    )
  ),
  constraint user_invitations_acceptance_check check (
    (status = 'accepted' and accepted_user_id is not null)
    or (status <> 'accepted' and accepted_user_id is null)
  )
);

-- Customer request data belongs to the requesting authenticated Customer, never to a
-- shared browser token. Expiring/single-purpose links are a separate Phase 2 concern.
create table public.intake_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  position text not null,
  department text not null,
  must_have text not null default '',
  nice_to_have text not null default '',
  comment text not null default '',
  status text not null default 'draft',
  assigned_recruiter_id uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint intake_requests_position_check check (nullif(btrim(position), '') is not null),
  constraint intake_requests_department_check check (nullif(btrim(department), '') is not null),
  constraint intake_requests_status_check check (
    status in ('draft', 'submitted', 'returned', 'accepted', 'assigned')
  ),
  constraint intake_requests_assignment_check check (
    (status = 'assigned' and assigned_recruiter_id is not null)
    or (status <> 'assigned' and assigned_recruiter_id is null)
  )
);

-- Append-only workflow history. Authenticated users only read events for requests they
-- are already authorized to read; application/server code records transitions.
create table public.intake_request_events (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.intake_requests(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  status text not null,
  comment text,
  created_at timestamptz not null default now(),
  constraint intake_request_events_status_check check (
    status in ('draft', 'submitted', 'returned', 'accepted', 'assigned')
  )
);

-- Audit data contains event metadata only. Raw CV/interview contents and credentials are
-- deliberately outside this table. Common top-level secret-bearing keys are rejected.
create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_events_action_check check (nullif(btrim(action), '') is not null),
  constraint audit_events_entity_type_check check (nullif(btrim(entity_type), '') is not null),
  constraint audit_events_no_secret_keys_check check (
    not (metadata ?| array[
      'password', 'token', 'secret', 'api_key', 'service_role_key',
      'access_token', 'refresh_token', 'authorization'
    ])
  )
);

-- Connection state only. Credentials live in managed server-side secrets, never here.
create table public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique,
  status text not null default 'disconnected',
  external_account_ref text,
  metadata jsonb not null default '{}'::jsonb,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint integration_connections_provider_check check (nullif(btrim(provider), '') is not null),
  constraint integration_connections_status_check check (
    status in ('disconnected', 'configured', 'healthy', 'error', 'disabled')
  ),
  constraint integration_connections_no_secret_keys_check check (
    not (metadata ?| array[
      'password', 'token', 'secret', 'api_key', 'service_role_key',
      'access_token', 'refresh_token', 'authorization'
    ])
  )
);

create index profiles_role_active_idx on public.profiles (role, is_active);
create index user_invitations_status_created_idx on public.user_invitations (status, created_at desc);
create index intake_requests_customer_updated_idx on public.intake_requests (customer_id, updated_at desc);
create index intake_requests_status_updated_idx on public.intake_requests (status, updated_at desc);
create index intake_requests_assigned_recruiter_idx
  on public.intake_requests (assigned_recruiter_id, updated_at desc)
  where assigned_recruiter_id is not null;
create index intake_request_events_request_created_idx
  on public.intake_request_events (request_id, created_at asc);
create index audit_events_actor_created_idx on public.audit_events (actor_user_id, created_at desc);
create index audit_events_entity_created_idx on public.audit_events (entity_type, entity_id, created_at desc);

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.touch_updated_at() from public, anon, authenticated;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function private.touch_updated_at();

create trigger user_invitations_touch_updated_at
before update on public.user_invitations
for each row execute function private.touch_updated_at();

create trigger intake_requests_touch_updated_at
before update on public.intake_requests
for each row execute function private.touch_updated_at();

create trigger integration_connections_touch_updated_at
before update on public.integration_connections
for each row execute function private.touch_updated_at();

-- Trusted role lookup. Profiles are server-managed; end users receive no INSERT/UPDATE
-- privilege on this table. SECURITY DEFINER avoids recursive profile-policy evaluation.
create or replace function private.current_app_role()
returns text
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select p.role
  from public.profiles as p
  where p.id = auth.uid()
    and p.is_active
  limit 1
$$;

create or replace function private.is_management_user()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(private.current_app_role() in ('head_of_recruitment', 'hrd'), false)
$$;

revoke all on function private.current_app_role() from public, anon;
revoke all on function private.is_management_user() from public, anon;
grant execute on function private.current_app_role() to authenticated;
grant execute on function private.is_management_user() to authenticated;

alter table public.profiles enable row level security;
alter table public.user_invitations enable row level security;
alter table public.intake_requests enable row level security;
alter table public.intake_request_events enable row level security;
alter table public.audit_events enable row level security;
alter table public.integration_connections enable row level security;

-- Start from least privilege. Direct browser mutation is intentionally disabled for this
-- foundation slice; future server actions/RPCs will own validated state transitions.
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.user_invitations from anon, authenticated;
revoke all on table public.intake_requests from anon, authenticated;
revoke all on table public.intake_request_events from anon, authenticated;
revoke all on table public.audit_events from anon, authenticated;
revoke all on table public.integration_connections from anon, authenticated;

revoke all on all sequences in schema public from anon, authenticated;

grant select on table public.profiles to authenticated;
grant select on table public.user_invitations to authenticated;
grant select on table public.intake_requests to authenticated;
grant select on table public.intake_request_events to authenticated;
grant select on table public.audit_events to authenticated;
grant select on table public.integration_connections to authenticated;

grant select, insert, update, delete on table public.profiles to service_role;
grant select, insert, update, delete on table public.user_invitations to service_role;
grant select, insert, update, delete on table public.intake_requests to service_role;
grant select, insert, update, delete on table public.intake_request_events to service_role;
grant select, insert, update, delete on table public.audit_events to service_role;
grant select, insert, update, delete on table public.integration_connections to service_role;
grant usage, select on all sequences in schema public to service_role;

create policy profiles_self_or_management_read
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or private.is_management_user()
);

create policy user_invitations_management_read
on public.user_invitations
for select
to authenticated
using (private.is_management_user());

-- Source customer requests are intentionally invisible to Recruiter even when assigned.
-- Recruiter working context must come from an allowed derived artifact/Huntflow boundary.
create policy intake_requests_authorized_read
on public.intake_requests
for select
to authenticated
using (
  private.is_management_user()
  or (
    private.current_app_role() = 'customer'
    and customer_id = auth.uid()
  )
);

-- Reuse the parent request RLS instead of duplicating role logic for event rows.
create policy intake_request_events_authorized_read
on public.intake_request_events
for select
to authenticated
using (
  exists (
    select 1
    from public.intake_requests as request
    where request.id = intake_request_events.request_id
  )
);

create policy audit_events_management_read
on public.audit_events
for select
to authenticated
using (private.is_management_user());

create policy integration_connections_management_read
on public.integration_connections
for select
to authenticated
using (private.is_management_user());
