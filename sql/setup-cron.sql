-- Setup script for renewal notification cron job
-- Run this in Supabase SQL Editor to enable automatic SMS/Email notifications for expiring subscriptions
-- Create required extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;
-- Add service role key to vault (update if already exists)
-- Note: Replace YOUR_SERVICE_ROLE_KEY_HERE with your actual service role key
do $$ begin
delete from vault.secrets
where name = 'service_role_key';
perform vault.create_secret(
  'YOUR_SERVICE_ROLE_KEY_HERE',
  'service_role_key'
);
exception
when others then raise notice 'Secret creation handled: %',
SQLERRM;
end $$;
-- Remove existing job if it exists to avoid conflicts
select cron.unschedule ('daily-renewal-notifications')
where exists (
    select 1
    from cron.job
    where jobname = 'daily-renewal-notifications'
  );
-- Create cron job to run renewal notifications daily at 12 PM UTC
select cron.schedule (
    'daily-renewal-notifications',
    '0 12 * * *',
    -- 12:00 UTC daily — adjust if you want a different time
    $$
    select net.http_post(
        url := 'https://maxizbssbrsrifcklwkb.supabase.co/functions/v1/send-renewal-invoices',
        headers := jsonb_build_object(
          'Authorization',
          'Bearer ' || (
            select decrypted_secret
            from vault.decrypted_secrets
            where name = 'service_role_key'
          ),
          'Content-Type',
          'application/json'
        ),
        body := '{}'::jsonb
      );
$$
);
-- Verify the job was created
select *
from cron.job