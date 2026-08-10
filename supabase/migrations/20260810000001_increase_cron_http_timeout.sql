-- pg_net's default HTTP timeout is 5 seconds. Supabase's outbound call
-- to the Netlify cron routes was consistently taking longer than that
-- to respond (Netlify function cold starts + the per-profile work in
-- the route itself), so net._http_response was logging every run as a
-- client-side timeout even though the request completed and the email
-- actually sent. Raising the timeout to 20s lets Supabase see the real
-- outcome instead of giving up early.
select cron.alter_job(
  job_id := (select jobid from cron.job where jobname = 'send-wishlist-nudges-daily'),
  command := $$
  select net.http_post(
    url := 'https://giftmeapp.netlify.app/api/cron/send-wishlist-nudges',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets
        where name = 'nudge_cron_secret'
      )
    ),
    timeout_milliseconds := 20000
  );
  $$
);

select cron.alter_job(
  job_id := (select jobid from cron.job where jobname = 'send-birthday-reminders-daily'),
  command := $$
  select net.http_post(
    url := 'https://giftmeapp.netlify.app/api/cron/send-birthday-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets
        where name = 'nudge_cron_secret'
      )
    ),
    timeout_milliseconds := 20000
  );
  $$
);
