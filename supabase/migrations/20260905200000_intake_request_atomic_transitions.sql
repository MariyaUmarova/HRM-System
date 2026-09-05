-- Atomic server-only Customer intake request transition contract.
--
-- Git-only foundation: do not apply this migration to an unapproved cloud project.
-- Secure/expiring request-link issuance is intentionally NOT implemented here. These
-- functions operate on an already-owned authenticated Customer request and are intended
-- for a future reviewed server adapter running as service_role.
--
-- Browser roles cannot execute these mutation RPCs. p_actor_user_id must be derived from
-- a validated server session; it must never be trusted from a browser payload.

-- `now()` is transaction-stable and cannot safely serve as an optimistic-concurrency
-- version. Give intake requests a strictly advancing version on every update.
drop trigger intake_requests_touch_updated_at on public.intake_requests;

create or replace function private.touch_intake_request_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := greatest(
    pg_catalog.clock_timestamp(),
    old.updated_at + interval '1 microsecond'
  );
  return new;
end;
$$;

revoke all on function private.touch_intake_request_version() from public, anon, authenticated;
grant execute on function private.touch_intake_request_version() to service_role;

create trigger intake_requests_touch_version
before update on public.intake_requests
for each row execute function private.touch_intake_request_version();

-- Enforce the state machine even if future privileged server code accidentally issues a
-- direct UPDATE instead of using the reviewed RPCs.
create or replace function private.validate_intake_request_state()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  customer_role text;
  recruiter_role text;
begin
  if tg_op = 'INSERT' then
    select p.role
      into customer_role
    from public.profiles as p
    where p.id = new.customer_id
      and p.is_active;

    if customer_role is distinct from 'customer' then
      raise exception 'intake request owner must be an active Customer'
        using errcode = '23514';
    end if;

    if new.status <> 'draft' or new.assigned_recruiter_id is not null then
      raise exception 'new intake request must start as unassigned draft'
        using errcode = '23514';
    end if;

    return new;
  end if;

  if new.customer_id is distinct from old.customer_id then
    raise exception 'intake request customer ownership is immutable'
      using errcode = '23514';
  end if;

  if new.assigned_recruiter_id is distinct from old.assigned_recruiter_id
    and not (old.status = 'accepted' and new.status = 'assigned') then
    raise exception 'recruiter assignment is allowed only on accepted to assigned transition'
      using errcode = '23514';
  end if;

  if new.assigned_recruiter_id is not null then
    select p.role
      into recruiter_role
    from public.profiles as p
    where p.id = new.assigned_recruiter_id
      and p.is_active;

    if recruiter_role is distinct from 'recruiter' then
      raise exception 'assigned recruiter must be an active Recruiter'
        using errcode = '23514';
    end if;
  end if;

  if new.status is distinct from old.status then
    if not (
      (old.status in ('draft', 'returned') and new.status = 'submitted')
      or (old.status = 'submitted' and new.status in ('returned', 'accepted'))
      or (old.status = 'accepted' and new.status = 'assigned')
    ) then
      raise exception 'invalid intake request status transition: % -> %', old.status, new.status
        using errcode = '23514';
    end if;

    if row(
      new.position,
      new.department,
      new.must_have,
      new.nice_to_have,
      new.comment
    ) is distinct from row(
      old.position,
      old.department,
      old.must_have,
      old.nice_to_have,
      old.comment
    ) then
      raise exception 'request narrative cannot change in the same statement as status transition'
        using errcode = '23514';
    end if;
  elsif old.status not in ('draft', 'returned')
    and row(
      new.position,
      new.department,
      new.must_have,
      new.nice_to_have,
      new.comment
    ) is distinct from row(
      old.position,
      old.department,
      old.must_have,
      old.nice_to_have,
      old.comment
    ) then
    raise exception 'request narrative is editable only in draft or returned state'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_intake_request_state() from public, anon, authenticated;
grant execute on function private.validate_intake_request_state() to service_role;

create trigger intake_requests_validate_state
before insert or update on public.intake_requests
for each row execute function private.validate_intake_request_state();

-- Validate newly appended workflow-history rows. Existing history remains immutable from
-- the application service role; FK maintenance by the database owner remains possible.
create or replace function private.validate_intake_request_event_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  request_customer_id uuid;
  request_status text;
  actor_role text;
begin
  select r.customer_id, r.status
    into request_customer_id, request_status
  from public.intake_requests as r
  where r.id = new.request_id;

  if not found then
    raise exception 'intake request event references missing request'
      using errcode = '23503';
  end if;

  if new.actor_user_id is null then
    raise exception 'intake request transition event requires an actor'
      using errcode = '23514';
  end if;

  if new.status is distinct from request_status then
    raise exception 'intake request event status must match current request status'
      using errcode = '23514';
  end if;

  select p.role
    into actor_role
  from public.profiles as p
  where p.id = new.actor_user_id
    and p.is_active;

  if new.status in ('draft', 'submitted') then
    if actor_role is distinct from 'customer' or new.actor_user_id is distinct from request_customer_id then
      raise exception 'draft/submitted request event actor must be the owning active Customer'
        using errcode = '23514';
    end if;
  elsif new.status in ('returned', 'accepted', 'assigned') then
    if actor_role is null or actor_role not in ('head_of_recruitment', 'hrd') then
      raise exception 'management request event requires active Head of Recruitment or HRD actor'
        using errcode = '23514';
    end if;
  end if;

  if new.status = 'returned' and nullif(pg_catalog.btrim(coalesce(new.comment, '')), '') is null then
    raise exception 'returned request event requires a revision comment'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_intake_request_event_insert() from public, anon, authenticated;
grant execute on function private.validate_intake_request_event_insert() to service_role;

create trigger intake_request_events_validate_insert
before insert on public.intake_request_events
for each row execute function private.validate_intake_request_event_insert();

-- Application history is append-only and source requests are never physically deleted by
-- the service role. These revoke the broader Phase-1 foundation grants.
revoke update, delete on table public.intake_request_events from service_role;
revoke delete on table public.intake_requests from service_role;

create or replace function public.server_save_intake_request_draft(
  p_actor_user_id uuid,
  p_request_id uuid,
  p_expected_updated_at timestamptz,
  p_position text,
  p_department text,
  p_must_have text,
  p_nice_to_have text,
  p_comment text
)
returns public.intake_requests
language plpgsql
security invoker
set search_path = ''
as $$
declare
  actor_role text;
  current_request public.intake_requests;
  saved_request public.intake_requests;
begin
  select p.role into actor_role
  from public.profiles as p
  where p.id = p_actor_user_id and p.is_active;

  if actor_role is distinct from 'customer' then
    raise exception 'intake request draft edit requires active Customer actor'
      using errcode = '42501';
  end if;

  select * into current_request
  from public.intake_requests
  where id = p_request_id;

  if not found then
    raise exception 'intake request not found' using errcode = 'P0002';
  end if;
  if current_request.customer_id is distinct from p_actor_user_id then
    raise exception 'Customer cannot edit another Customer request' using errcode = '42501';
  end if;
  if current_request.status not in ('draft', 'returned') then
    raise exception 'request is not editable in status %', current_request.status using errcode = '23514';
  end if;

  update public.intake_requests
  set
    position = pg_catalog.btrim(p_position),
    department = pg_catalog.btrim(p_department),
    must_have = pg_catalog.btrim(coalesce(p_must_have, '')),
    nice_to_have = pg_catalog.btrim(coalesce(p_nice_to_have, '')),
    comment = pg_catalog.btrim(coalesce(p_comment, ''))
  where id = p_request_id
    and updated_at = p_expected_updated_at
  returning * into saved_request;

  if not found then
    raise exception 'intake request draft save conflict: stale version'
      using errcode = '40001';
  end if;

  insert into public.audit_events (actor_user_id, action, entity_type, entity_id, metadata)
  values (
    p_actor_user_id,
    'intake_request.draft_updated',
    'intake_request',
    saved_request.id::text,
    pg_catalog.jsonb_build_object('status', saved_request.status)
  );

  return saved_request;
end;
$$;

revoke all on function public.server_save_intake_request_draft(
  uuid, uuid, timestamptz, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.server_save_intake_request_draft(
  uuid, uuid, timestamptz, text, text, text, text, text
) to service_role;

create or replace function public.server_submit_intake_request(
  p_actor_user_id uuid,
  p_request_id uuid,
  p_expected_updated_at timestamptz
)
returns public.intake_requests
language plpgsql
security invoker
set search_path = ''
as $$
declare
  actor_role text;
  current_request public.intake_requests;
  submitted_request public.intake_requests;
begin
  select p.role into actor_role
  from public.profiles as p
  where p.id = p_actor_user_id and p.is_active;

  if actor_role is distinct from 'customer' then
    raise exception 'intake request submit requires active Customer actor' using errcode = '42501';
  end if;

  select * into current_request from public.intake_requests where id = p_request_id;
  if not found then raise exception 'intake request not found' using errcode = 'P0002'; end if;
  if current_request.customer_id is distinct from p_actor_user_id then
    raise exception 'Customer cannot submit another Customer request' using errcode = '42501';
  end if;
  if current_request.status not in ('draft', 'returned') then
    raise exception 'request cannot be submitted from status %', current_request.status using errcode = '23514';
  end if;

  update public.intake_requests
  set status = 'submitted'
  where id = p_request_id and updated_at = p_expected_updated_at
  returning * into submitted_request;

  if not found then
    raise exception 'intake request submit conflict: stale version' using errcode = '40001';
  end if;

  insert into public.intake_request_events (request_id, actor_user_id, status)
  values (submitted_request.id, p_actor_user_id, 'submitted');

  insert into public.audit_events (actor_user_id, action, entity_type, entity_id, metadata)
  values (
    p_actor_user_id,
    'intake_request.submitted',
    'intake_request',
    submitted_request.id::text,
    pg_catalog.jsonb_build_object('from_status', current_request.status, 'to_status', submitted_request.status)
  );

  return submitted_request;
end;
$$;

revoke all on function public.server_submit_intake_request(uuid, uuid, timestamptz)
from public, anon, authenticated;
grant execute on function public.server_submit_intake_request(uuid, uuid, timestamptz)
to service_role;

create or replace function public.server_return_intake_request(
  p_actor_user_id uuid,
  p_request_id uuid,
  p_expected_updated_at timestamptz,
  p_revision_comment text
)
returns public.intake_requests
language plpgsql
security invoker
set search_path = ''
as $$
declare
  actor_role text;
  current_request public.intake_requests;
  returned_request public.intake_requests;
  normalized_comment text;
begin
  select p.role into actor_role
  from public.profiles as p
  where p.id = p_actor_user_id and p.is_active;

  if actor_role is null or actor_role not in ('head_of_recruitment', 'hrd') then
    raise exception 'return for revision requires active Head of Recruitment or HRD actor'
      using errcode = '42501';
  end if;

  normalized_comment := pg_catalog.btrim(coalesce(p_revision_comment, ''));
  if nullif(normalized_comment, '') is null then
    raise exception 'revision comment is required' using errcode = '23514';
  end if;

  select * into current_request from public.intake_requests where id = p_request_id;
  if not found then raise exception 'intake request not found' using errcode = 'P0002'; end if;
  if current_request.status <> 'submitted' then
    raise exception 'request cannot be returned from status %', current_request.status using errcode = '23514';
  end if;

  update public.intake_requests
  set status = 'returned'
  where id = p_request_id and updated_at = p_expected_updated_at
  returning * into returned_request;

  if not found then
    raise exception 'intake request return conflict: stale version' using errcode = '40001';
  end if;

  insert into public.intake_request_events (request_id, actor_user_id, status, comment)
  values (returned_request.id, p_actor_user_id, 'returned', normalized_comment);

  insert into public.audit_events (actor_user_id, action, entity_type, entity_id, metadata)
  values (
    p_actor_user_id,
    'intake_request.returned',
    'intake_request',
    returned_request.id::text,
    pg_catalog.jsonb_build_object('from_status', current_request.status, 'to_status', returned_request.status)
  );

  return returned_request;
end;
$$;

revoke all on function public.server_return_intake_request(uuid, uuid, timestamptz, text)
from public, anon, authenticated;
grant execute on function public.server_return_intake_request(uuid, uuid, timestamptz, text)
to service_role;

create or replace function public.server_accept_intake_request(
  p_actor_user_id uuid,
  p_request_id uuid,
  p_expected_updated_at timestamptz
)
returns public.intake_requests
language plpgsql
security invoker
set search_path = ''
as $$
declare
  actor_role text;
  current_request public.intake_requests;
  accepted_request public.intake_requests;
begin
  select p.role into actor_role
  from public.profiles as p
  where p.id = p_actor_user_id and p.is_active;

  if actor_role is null or actor_role not in ('head_of_recruitment', 'hrd') then
    raise exception 'accept request requires active Head of Recruitment or HRD actor'
      using errcode = '42501';
  end if;

  select * into current_request from public.intake_requests where id = p_request_id;
  if not found then raise exception 'intake request not found' using errcode = 'P0002'; end if;
  if current_request.status <> 'submitted' then
    raise exception 'request cannot be accepted from status %', current_request.status using errcode = '23514';
  end if;

  update public.intake_requests
  set status = 'accepted'
  where id = p_request_id and updated_at = p_expected_updated_at
  returning * into accepted_request;

  if not found then
    raise exception 'intake request accept conflict: stale version' using errcode = '40001';
  end if;

  insert into public.intake_request_events (request_id, actor_user_id, status)
  values (accepted_request.id, p_actor_user_id, 'accepted');

  insert into public.audit_events (actor_user_id, action, entity_type, entity_id, metadata)
  values (
    p_actor_user_id,
    'intake_request.accepted',
    'intake_request',
    accepted_request.id::text,
    pg_catalog.jsonb_build_object('from_status', current_request.status, 'to_status', accepted_request.status)
  );

  return accepted_request;
end;
$$;

revoke all on function public.server_accept_intake_request(uuid, uuid, timestamptz)
from public, anon, authenticated;
grant execute on function public.server_accept_intake_request(uuid, uuid, timestamptz)
to service_role;

create or replace function public.server_assign_intake_request(
  p_actor_user_id uuid,
  p_request_id uuid,
  p_expected_updated_at timestamptz,
  p_recruiter_id uuid
)
returns public.intake_requests
language plpgsql
security invoker
set search_path = ''
as $$
declare
  actor_role text;
  recruiter_role text;
  current_request public.intake_requests;
  assigned_request public.intake_requests;
begin
  select p.role into actor_role
  from public.profiles as p
  where p.id = p_actor_user_id and p.is_active;

  if actor_role is null or actor_role not in ('head_of_recruitment', 'hrd') then
    raise exception 'assign request requires active Head of Recruitment or HRD actor'
      using errcode = '42501';
  end if;

  select p.role into recruiter_role
  from public.profiles as p
  where p.id = p_recruiter_id and p.is_active;

  if recruiter_role is distinct from 'recruiter' then
    raise exception 'assigned profile must be an active Recruiter' using errcode = '23514';
  end if;

  select * into current_request from public.intake_requests where id = p_request_id;
  if not found then raise exception 'intake request not found' using errcode = 'P0002'; end if;
  if current_request.status <> 'accepted' then
    raise exception 'request cannot be assigned from status %', current_request.status using errcode = '23514';
  end if;

  update public.intake_requests
  set status = 'assigned', assigned_recruiter_id = p_recruiter_id
  where id = p_request_id and updated_at = p_expected_updated_at
  returning * into assigned_request;

  if not found then
    raise exception 'intake request assign conflict: stale version' using errcode = '40001';
  end if;

  insert into public.intake_request_events (request_id, actor_user_id, status)
  values (assigned_request.id, p_actor_user_id, 'assigned');

  insert into public.audit_events (actor_user_id, action, entity_type, entity_id, metadata)
  values (
    p_actor_user_id,
    'intake_request.assigned',
    'intake_request',
    assigned_request.id::text,
    pg_catalog.jsonb_build_object(
      'from_status', current_request.status,
      'to_status', assigned_request.status,
      'assigned_recruiter_id', assigned_request.assigned_recruiter_id
    )
  );

  return assigned_request;
end;
$$;

revoke all on function public.server_assign_intake_request(uuid, uuid, timestamptz, uuid)
from public, anon, authenticated;
grant execute on function public.server_assign_intake_request(uuid, uuid, timestamptz, uuid)
to service_role;
