-- Keep-alive job for Supabase projects that auto-pause on inactivity.
-- Schedule uses every 12 hours (safer than once weekly against a 7-day pause threshold).

create extension if not exists pg_cron;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'keep-alive-job') then
    perform cron.unschedule('keep-alive-job');
  end if;
end
$$;

select cron.schedule(
  'keep-alive-job',
  '0 */12 * * *',
  $$select 1$$
);
