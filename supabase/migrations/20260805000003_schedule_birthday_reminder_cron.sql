-- Fires the daily birthday-reminder route handler once a day. Reuses the
-- same Vault-stored shared secret as the wishlist-nudge cron job (both
-- route handlers check the same CRON_SECRET env var), so no new secret
-- needs to be provisioned.
select cron.schedule(
  'send-birthday-reminders-daily',
  '10 15 * * *',
  $$
  select net.http_post(
    url := 'https://giftmeapp.netlify.app/api/cron/send-birthday-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets
        where name = 'nudge_cron_secret'
      )
    )
  );
  $$
);
