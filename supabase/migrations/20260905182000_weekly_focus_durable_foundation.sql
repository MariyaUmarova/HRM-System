-- Durable weekly-focus persistence contract.
--
-- Git-only foundation: this migration is intentionally not applied to any cloud project
-- by this change. It stores only HR Hub-owned focus artifacts plus Huntflow reference
-- metadata. It does not create a vacancy/candidate catalog and performs no Huntflow writes.

create table public.weekly_focus_items (
  id uuid primary key default gen_random_uuid(),
  owner_recruiter_id uuid not null references public.profiles(id) on delete restrict,
  week_start date not null,
  week_end date not null,
  title text not null,
  priority_note text not null,
  huntflow_vacancy_external_id text not null,
  huntflow_vacancy_title text not null,
  huntflow_vacancy_department text not null default '',
  huntflow_vacancy_url text not null,
  status text not null default 'active',
  created_by uuid not null references public.profiles(id) on delete restrict,
  updated_by uuid not null references public.profiles(id) on delete restrict,
  closed_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,

  constraint weekly_focus_title_check check (nullif(btrim(title), '') is not null),
  constraint weekly_focus_priority_note_check check (nullif(btrim(priority_note), '') is not null),
  constraint weekly_focus_external_id_check check (
    nullif(btrim(huntflow_vacancy_external_id), '') is not null
  ),
  constraint weekly_focus_vacancy_title_check check (
    nullif(btrim(huntflow_vacancy_title), '') is not null
  ),
  constraint weekly_focus_status_check check (status in ('active', 'closed')),
  constraint weekly_focus_work_week_check check (
    extract(isodow from week_start) = 1
    and week_end = week_start + 4
  ),
  constraint weekly_focus_huntflow_url_check check (
    huntflow_vacancy_url ~* '^https://huntflow[.]example(/|$)'
    or huntflow_vacancy_url ~* '^https://([a-z0-9-]+[.])*huntflow[.](ru|kz|uz)(/|$)'
  ),
  constraint weekly_focus_close_state_check check (
    (
      status = 'active'
      and closed_at is null
      and closed_by is null
    )
    or (
      status = 'closed'
      and closed_at is not null
      and closed_by is not null
    )
  ),
  constraint weekly_focus_timestamp_order_check check (
    updated_at >= created_at
    and (closed_at is null or closed_at >= created_at)
  )
);

comment on table public.weekly_focus_items is
  'HR Hub-owned weekly focus artifacts. Huntflow vacancy fields are references only; this is not a vacancy catalog.';

create index weekly_focus_owner_active_week_idx
  on public.weekly_focus_items (owner_recruiter_id, week_start, week_end)
  where status = 'active';

create index weekly_focus_management_week_idx
  on public.weekly_focus_items (week_start desc, week_end desc, status, updated_at desc);

-- Cross-row role integrity cannot be expressed as a CHECK constraint. This private
-- trigger guard makes the durable contract match the product roles even if a future
-- server-side caller passes a wrong profile id. It is not a browser-callable API.
create or replace function private.validate_weekly_focus_roles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT'
    or new.owner_recruiter_id is distinct from old.owner_recruiter_id then
    if not exists (
      select 1
      from public.profiles as profile
      where profile.id = new.owner_recruiter_id
        and profile.role = 'recruiter'
        and profile.is_active
    ) then
      raise exception 'weekly focus owner must be an active Recruiter'
        using errcode = '23514';
    end if;
  end if;

  if tg_op = 'INSERT' then
    if not exists (
      select 1
      from public.profiles as profile
      where profile.id = new.created_by
        and profile.role in ('head_of_recruitment', 'hrd')
        and profile.is_active
    ) then
      raise exception 'weekly focus creator must be active Head/HRD'
        using errcode = '23514';
    end if;
  elsif new.created_by is distinct from old.created_by then
    raise exception 'weekly focus created_by is immutable'
      using errcode = '23514';
  end if;

  if not exists (
    select 1
    from public.profiles as profile
    where profile.id = new.updated_by
      and profile.role in ('head_of_recruitment', 'hrd')
      and profile.is_active
  ) then
    raise exception 'weekly focus updater must be active Head/HRD'
      using errcode = '23514';
  end if;

  if new.closed_by is not null
    and (tg_op = 'INSERT' or new.closed_by is distinct from old.closed_by) then
    if not exists (
      select 1
      from public.profiles as profile
      where profile.id = new.closed_by
        and profile.role in ('head_of_recruitment', 'hrd')
        and profile.is_active
    ) then
      raise exception 'weekly focus closer must be active Head/HRD'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.validate_weekly_focus_roles() from public, anon, authenticated;
grant execute on function private.validate_weekly_focus_roles() to service_role;

create trigger weekly_focus_items_validate_roles
before insert or update on public.weekly_focus_items
for each row execute function private.validate_weekly_focus_roles();

create trigger weekly_focus_items_touch_updated_at
before update on public.weekly_focus_items
for each row execute function private.touch_updated_at();

alter table public.weekly_focus_items enable row level security;

-- Least privilege: browser clients may read only rows allowed by RLS. All mutations are
-- reserved for future reviewed server actions/RPCs that also write public.audit_events.
revoke all on table public.weekly_focus_items from anon, authenticated;
grant select on table public.weekly_focus_items to authenticated;

grant select, insert, update, delete on table public.weekly_focus_items to service_role;

create policy weekly_focus_management_read
on public.weekly_focus_items
for select
to authenticated
using ((select private.is_management_user()));

create policy weekly_focus_recruiter_active_read
on public.weekly_focus_items
for select
to authenticated
using (
  (select private.current_app_role()) = 'recruiter'
  and owner_recruiter_id = (select auth.uid())
  and status = 'active'
);
