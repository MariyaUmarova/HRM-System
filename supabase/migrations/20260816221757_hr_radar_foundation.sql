create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.hr_news_sources (
  id text primary key,
  name text not null,
  homepage_url text not null,
  feed_url text,
  adapter text not null,
  allowed_host text not null,
  enabled boolean not null default false,
  requires_editorial_review boolean not null default true,
  last_checked_at timestamptz,
  last_success_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hr_news_sources_id_format check (id ~ '^[a-z0-9][a-z0-9_-]{1,63}$'),
  constraint hr_news_sources_homepage_https check (homepage_url ~ '^https://'),
  constraint hr_news_sources_feed_https check (feed_url is null or feed_url ~ '^https://'),
  constraint hr_news_sources_adapter_check check (adapter in ('rss', 'manual'))
);

create table public.hr_news_items (
  id bigint generated always as identity primary key,
  source_id text not null references public.hr_news_sources(id) on update cascade on delete restrict,
  source_item_id text,
  canonical_url text not null unique,
  title text not null,
  published_at timestamptz,
  discovered_at timestamptz not null default now(),
  category text,
  summary text,
  why_it_matters text,
  tags text[] not null default '{}'::text[],
  status text not null default 'pending_review',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hr_news_items_url_https check (canonical_url ~ '^https://'),
  constraint hr_news_items_title_length check (char_length(title) between 5 and 500),
  constraint hr_news_items_category_check check (
    category is null or category in (
      'Рынок труда',
      'Подбор и найм',
      'AI и HR Tech',
      'Обучение и развитие'
    )
  ),
  constraint hr_news_items_status_check check (
    status in ('pending_review', 'published', 'rejected')
  ),
  constraint hr_news_items_review_check check (
    (status = 'published' and reviewed_at is not null)
    or status <> 'published'
  ),
  constraint hr_news_items_source_item_unique unique (source_id, source_item_id)
);

create table public.hr_news_ingestion_runs (
  id bigint generated always as identity primary key,
  source_id text not null references public.hr_news_sources(id) on update cascade on delete restrict,
  run_date date not null default (now() at time zone 'Europe/Moscow')::date,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running',
  discovered_count integer not null default 0,
  inserted_count integer not null default 0,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  constraint hr_news_ingestion_runs_status_check check (
    status in ('running', 'succeeded', 'failed', 'skipped')
  ),
  constraint hr_news_ingestion_runs_counts_check check (
    discovered_count >= 0 and inserted_count >= 0 and inserted_count <= discovered_count
  ),
  constraint hr_news_ingestion_runs_source_day_unique unique (source_id, run_date)
);

create index hr_news_items_status_published_idx
  on public.hr_news_items (status, published_at desc nulls last);
create index hr_news_items_source_discovered_idx
  on public.hr_news_items (source_id, discovered_at desc);
create index hr_news_ingestion_runs_status_started_idx
  on public.hr_news_ingestion_runs (status, started_at desc);
create index hr_news_ingestion_runs_source_id_idx
  on public.hr_news_ingestion_runs (source_id);

alter table public.hr_news_sources enable row level security;
alter table public.hr_news_items enable row level security;
alter table public.hr_news_ingestion_runs enable row level security;

alter table public.hr_news_sources force row level security;
alter table public.hr_news_items force row level security;
alter table public.hr_news_ingestion_runs force row level security;

revoke all on table public.hr_news_sources from anon, authenticated;
revoke all on table public.hr_news_items from anon, authenticated;
revoke all on table public.hr_news_ingestion_runs from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant select, insert, update, delete on table public.hr_news_sources to service_role;
grant select, insert, update, delete on table public.hr_news_items to service_role;
grant select, insert, update, delete on table public.hr_news_ingestion_runs to service_role;
grant usage, select on all sequences in schema public to service_role;

insert into public.hr_news_sources (
  id, name, homepage_url, feed_url, adapter, allowed_host, enabled, requires_editorial_review
) values
  (
    'mintrud',
    'Минтруд России',
    'https://mintrud.gov.ru/',
    'https://mintrud.gov.ru/document/rss',
    'rss',
    'mintrud.gov.ru',
    true,
    true
  ),
  (
    'hh',
    'hh.ru',
    'https://hh.ru/articles',
    null,
    'manual',
    'hh.ru',
    false,
    true
  ),
  (
    'cipd',
    'CIPD',
    'https://www.cipd.org/en/about/news/',
    null,
    'manual',
    'www.cipd.org',
    false,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  homepage_url = excluded.homepage_url,
  feed_url = excluded.feed_url,
  adapter = excluded.adapter,
  allowed_host = excluded.allowed_host,
  enabled = excluded.enabled,
  requires_editorial_review = excluded.requires_editorial_review,
  updated_at = now();

insert into public.hr_news_items (
  source_id,
  source_item_id,
  canonical_url,
  title,
  published_at,
  category,
  summary,
  why_it_matters,
  tags,
  status,
  reviewed_at
) values
  (
    'mintrud',
    'mintrud-career-tours-2026',
    'https://mintrud.gov.ru/employment/372',
    'Более 8,7 тыс. компаний проводят профориентационные туры для молодёжи',
    '2026-08-14T00:00:00+03:00',
    'Рынок труда',
    'Кадровые центры «Работа России» проводят профтуры и профпробы: работодатели знакомят школьников и студентов с профессиями, практиками и возможностями целевого обучения.',
    'Материал помогает оценить ранние каналы привлечения и партнёрства с образовательными организациями.',
    array['молодые специалисты', 'профориентация', 'рынок труда'],
    'published',
    '2026-08-17T00:00:00+03:00'
  ),
  (
    'mintrud',
    'mintrud-upskilling-programmes-2026',
    'https://mintrud.gov.ru/social/590',
    'Минтруд представил программы повышения квалификации специалистов',
    '2026-08-07T00:00:00+03:00',
    'Обучение и развитие',
    'Опубликованы типовые программы для специалистов по ранней помощи и сопровождаемому проживанию с практическими модулями и оценкой результатов.',
    'Полезный пример того, как связывать обучение с конкретными навыками, практикой и измеримой проверкой освоения.',
    array['обучение', 'квалификация', 'оценка навыков'],
    'published',
    '2026-08-17T00:00:00+03:00'
  ),
  (
    'hh',
    'hh-inclusive-vacancies-2026',
    'https://hh.ru/blog/inklyuzivnost-v-vakansiyah-na-hh-ru',
    'Инклюзивность в вакансиях: как корректно описывать условия работы',
    '2026-04-27T00:00:00+03:00',
    'Подбор и найм',
    'hh.ru добавил структурированное описание доступности вакансии и приводит примеры условий для разных потребностей кандидатов.',
    'Можно использовать как ориентир при проверке понятности и доступности текста вакансии, не копируя формулировки без проверки.',
    array['инклюзия', 'вакансии', 'кандидатский опыт'],
    'published',
    '2026-08-17T00:00:00+03:00'
  ),
  (
    'hh',
    'hh-call-transcripts-2026',
    'https://hh.ru/blog/v-zvonki-cherez-hh-ru-dobavili-rasshifrovku-i-kratkie-itogi-razgovora-s-kandidatami',
    'В звонках hh.ru появились расшифровка и краткие итоги разговора',
    '2026-03-06T00:00:00+03:00',
    'AI и HR Tech',
    'Платформа описывает автоматическую расшифровку звонков и краткие итоги как помощь рекрутеру при фиксации разговора.',
    'Прямой ориентир для требований к нашему анализу интервью: источник, проверяемый черновик и подтверждение человеком.',
    array['транскрипт', 'интервью', 'HR Tech'],
    'published',
    '2026-08-17T00:00:00+03:00'
  ),
  (
    'hh',
    'hh-labour-market-forecast-2026',
    'https://hh.ru/article/prognoz-chto-budet-proiskhodit-na-rynke-truda-v-2026-godu',
    'Прогноз рынка труда: удержание, проектные роли и более точечный найм',
    '2025-12-22T00:00:00+03:00',
    'Рынок труда',
    'Эксперты hh.ru ожидают большего внимания к удержанию, развитию сотрудников, проектным форматам и доказательству практической ценности кандидата.',
    'Может помочь при обсуждении приоритетов найма и аргументации требований к кейсам и результатам кандидатов.',
    array['тренды', 'удержание', 'точечный найм'],
    'published',
    '2026-08-17T00:00:00+03:00'
  ),
  (
    'cipd',
    'cipd-ai-job-centre-2026',
    'https://www.cipd.org/en/about/press-releases/government-ai-job-centre/',
    'CIPD о применении AI в государственных службах занятости',
    '2026-06-10T00:00:00+03:00',
    'AI и HR Tech',
    'Профессиональная ассоциация комментирует внедрение AI в сервисы занятости и необходимость сохранять качество, доверие и человеческое участие.',
    'Полезный внешний взгляд на границы автоматизации: AI помогает процессу, но не подменяет ответственное решение человека.',
    array['AI', 'занятость', 'human-in-the-loop'],
    'published',
    '2026-08-17T00:00:00+03:00'
  )
on conflict (canonical_url) do nothing;

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
        'apikey', (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'hr_radar_publishable_key'
        )
      ),
      body := jsonb_build_object(
        'scheduled_at', now(),
        'schedule', 'daily-0900-msk'
      )
    );
  $cron$
);
