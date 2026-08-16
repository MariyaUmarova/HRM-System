do $$
declare
  invocation_secret text;
begin
  if not exists (
    select 1
    from public.hr_news_runtime_config
    where key = 'invocation_secret_sha256'
  ) then
    invocation_secret := encode(extensions.gen_random_bytes(32), 'hex');

    perform vault.create_secret(
      invocation_secret,
      'hr_radar_invocation_secret',
      'Generated per environment for the scheduled HR Radar Edge Function'
    );

    insert into public.hr_news_runtime_config (key, value_hash)
    values (
      'invocation_secret_sha256',
      encode(extensions.digest(invocation_secret, 'sha256'), 'hex')
    );
  end if;
end
$$;
