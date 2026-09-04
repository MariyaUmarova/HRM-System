-- Follow-up hardening for the Phase 1 auth/RLS foundation.
-- Supabase recommends an empty search_path for SECURITY DEFINER functions and
-- wrapping stable auth/helper calls in SELECT so Postgres can evaluate them once
-- per statement instead of once per row.

create or replace function private.current_app_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles as p
  where p.id = (select auth.uid())
    and p.is_active
  limit 1
$$;

create or replace function private.is_management_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    private.current_app_role() in ('head_of_recruitment', 'hrd'),
    false
  )
$$;

revoke all on function private.current_app_role() from public, anon;
revoke all on function private.is_management_user() from public, anon;
grant execute on function private.current_app_role() to authenticated;
grant execute on function private.is_management_user() to authenticated;

drop policy if exists profiles_self_or_management_read on public.profiles;
create policy profiles_self_or_management_read
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.is_management_user())
);

drop policy if exists user_invitations_management_read on public.user_invitations;
create policy user_invitations_management_read
on public.user_invitations
for select
to authenticated
using ((select private.is_management_user()));

drop policy if exists intake_requests_authorized_read on public.intake_requests;
create policy intake_requests_authorized_read
on public.intake_requests
for select
to authenticated
using (
  (select private.is_management_user())
  or (
    (select private.current_app_role()) = 'customer'
    and customer_id = (select auth.uid())
  )
  or (
    (select private.current_app_role()) = 'recruiter'
    and assigned_recruiter_id = (select auth.uid())
  )
);

drop policy if exists audit_events_management_read on public.audit_events;
create policy audit_events_management_read
on public.audit_events
for select
to authenticated
using ((select private.is_management_user()));

drop policy if exists integration_connections_management_read on public.integration_connections;
create policy integration_connections_management_read
on public.integration_connections
for select
to authenticated
using ((select private.is_management_user()));
