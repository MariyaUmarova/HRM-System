-- Atomic server-only weekly-focus mutation contract.
--
-- Git-only foundation: this migration is intentionally not applied to any cloud project.
-- The functions are designed for a future reviewed server adapter running as service_role.
-- Browser roles cannot execute them. The actor id must be derived from a validated server session;
-- it must never be accepted from an untrusted browser payload without that check.
--
-- Each mutation and its audit event run in one PostgreSQL statement/transaction. If the
-- audit insert fails, the weekly-focus mutation fails with it.

-- `now()` is transaction-stable in PostgreSQL, so the shared touch_updated_at trigger is
-- not a safe optimistic-concurrency version for two writes in one transaction. Weekly
-- focus uses a strictly advancing version timestamp instead: wall-clock time when it has
-- advanced, otherwise at least one microsecond after the previous row version.
drop trigger weekly_focus_items_touch_updated_at on public.weekly_focus_items;

create or replace function private.touch_weekly_focus_version()
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

revoke all on function private.touch_weekly_focus_version() from public, anon, authenticated;
grant execute on function private.touch_weekly_focus_version() to service_role;

create trigger weekly_focus_items_touch_version
before update on public.weekly_focus_items
for each row execute function private.touch_weekly_focus_version();

create or replace function public.server_create_weekly_focus(
  p_actor_user_id uuid,
  p_owner_recruiter_id uuid,
  p_week_start date,
  p_title text,
  p_priority_note text,
  p_huntflow_vacancy_external_id text,
  p_huntflow_vacancy_title text,
  p_huntflow_vacancy_department text,
  p_huntflow_vacancy_url text
)
returns public.weekly_focus_items
language plpgsql
security invoker
set search_path = ''
as $$
declare
  created_focus public.weekly_focus_items;
begin
  insert into public.weekly_focus_items (
    owner_recruiter_id,
    week_start,
    week_end,
    title,
    priority_note,
    huntflow_vacancy_external_id,
    huntflow_vacancy_title,
    huntflow_vacancy_department,
    huntflow_vacancy_url,
    created_by,
    updated_by
  ) values (
    p_owner_recruiter_id,
    p_week_start,
    p_week_start + 4,
    pg_catalog.btrim(p_title),
    pg_catalog.btrim(p_priority_note),
    pg_catalog.btrim(p_huntflow_vacancy_external_id),
    pg_catalog.btrim(p_huntflow_vacancy_title),
    pg_catalog.btrim(coalesce(p_huntflow_vacancy_department, '')),
    pg_catalog.btrim(p_huntflow_vacancy_url),
    p_actor_user_id,
    p_actor_user_id
  )
  returning * into created_focus;

  insert into public.audit_events (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    p_actor_user_id,
    'weekly_focus.created',
    'weekly_focus_item',
    created_focus.id::text,
    pg_catalog.jsonb_build_object(
      'owner_recruiter_id', created_focus.owner_recruiter_id,
      'week_start', created_focus.week_start,
      'week_end', created_focus.week_end,
      'huntflow_vacancy_external_id', created_focus.huntflow_vacancy_external_id,
      'status', created_focus.status
    )
  );

  return created_focus;
end;
$$;

revoke all on function public.server_create_weekly_focus(
  uuid, uuid, date, text, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.server_create_weekly_focus(
  uuid, uuid, date, text, text, text, text, text, text
) to service_role;

create or replace function public.server_update_weekly_focus(
  p_actor_user_id uuid,
  p_focus_id uuid,
  p_expected_updated_at timestamptz,
  p_owner_recruiter_id uuid,
  p_week_start date,
  p_title text,
  p_priority_note text,
  p_huntflow_vacancy_external_id text,
  p_huntflow_vacancy_title text,
  p_huntflow_vacancy_department text,
  p_huntflow_vacancy_url text
)
returns public.weekly_focus_items
language plpgsql
security invoker
set search_path = ''
as $$
declare
  updated_focus public.weekly_focus_items;
begin
  update public.weekly_focus_items
  set
    owner_recruiter_id = p_owner_recruiter_id,
    week_start = p_week_start,
    week_end = p_week_start + 4,
    title = pg_catalog.btrim(p_title),
    priority_note = pg_catalog.btrim(p_priority_note),
    huntflow_vacancy_external_id = pg_catalog.btrim(p_huntflow_vacancy_external_id),
    huntflow_vacancy_title = pg_catalog.btrim(p_huntflow_vacancy_title),
    huntflow_vacancy_department = pg_catalog.btrim(coalesce(p_huntflow_vacancy_department, '')),
    huntflow_vacancy_url = pg_catalog.btrim(p_huntflow_vacancy_url),
    updated_by = p_actor_user_id
  where id = p_focus_id
    and status = 'active'
    and updated_at = p_expected_updated_at
  returning * into updated_focus;

  if not found then
    raise exception 'weekly focus update conflict: row missing, closed, or stale'
      using errcode = '40001';
  end if;

  insert into public.audit_events (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    p_actor_user_id,
    'weekly_focus.updated',
    'weekly_focus_item',
    updated_focus.id::text,
    pg_catalog.jsonb_build_object(
      'owner_recruiter_id', updated_focus.owner_recruiter_id,
      'week_start', updated_focus.week_start,
      'week_end', updated_focus.week_end,
      'huntflow_vacancy_external_id', updated_focus.huntflow_vacancy_external_id,
      'status', updated_focus.status
    )
  );

  return updated_focus;
end;
$$;

revoke all on function public.server_update_weekly_focus(
  uuid, uuid, timestamptz, uuid, date, text, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.server_update_weekly_focus(
  uuid, uuid, timestamptz, uuid, date, text, text, text, text, text, text
) to service_role;

create or replace function public.server_close_weekly_focus(
  p_actor_user_id uuid,
  p_focus_id uuid,
  p_expected_updated_at timestamptz
)
returns public.weekly_focus_items
language plpgsql
security invoker
set search_path = ''
as $$
declare
  closed_focus public.weekly_focus_items;
begin
  update public.weekly_focus_items
  set
    status = 'closed',
    closed_by = p_actor_user_id,
    closed_at = pg_catalog.clock_timestamp(),
    updated_by = p_actor_user_id
  where id = p_focus_id
    and status = 'active'
    and updated_at = p_expected_updated_at
  returning * into closed_focus;

  if not found then
    raise exception 'weekly focus close conflict: row missing, closed, or stale'
      using errcode = '40001';
  end if;

  insert into public.audit_events (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    p_actor_user_id,
    'weekly_focus.closed',
    'weekly_focus_item',
    closed_focus.id::text,
    pg_catalog.jsonb_build_object(
      'owner_recruiter_id', closed_focus.owner_recruiter_id,
      'week_start', closed_focus.week_start,
      'week_end', closed_focus.week_end,
      'huntflow_vacancy_external_id', closed_focus.huntflow_vacancy_external_id,
      'status', closed_focus.status
    )
  );

  return closed_focus;
end;
$$;

revoke all on function public.server_close_weekly_focus(
  uuid, uuid, timestamptz
) from public, anon, authenticated;
grant execute on function public.server_close_weekly_focus(
  uuid, uuid, timestamptz
) to service_role;
