create table public.hr_news_runtime_config (
  key text primary key,
  value_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hr_news_runtime_config_key_format check (key ~ '^[a-z0-9][a-z0-9_]{2,63}$'),
  constraint hr_news_runtime_config_hash_format check (value_hash ~ '^[0-9a-f]{64}$')
);

alter table public.hr_news_runtime_config enable row level security;
alter table public.hr_news_runtime_config force row level security;

revoke all on table public.hr_news_runtime_config from anon, authenticated;
grant select, insert, update, delete on table public.hr_news_runtime_config to service_role;

select cron.unschedule(jobid)
from cron.job
where jobname = 'hr-radar-daily-0900-msk';

select cron.schedule(
  'hr-radar-daily-0900-msk',
  '0 6 * * *',
  $cron$
    select net.http_post(
      url := (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'hr_radar_project_url'
      ) || '/functions/v1/hr-radar-ingest',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-hr-radar-secret', (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'hr_radar_invocation_secret'
        )
      ),
      body := jsonb_build_object(
        'scheduled_at', now(),
        'schedule', 'daily-0900-msk'
      )
    );
  $cron$
);
