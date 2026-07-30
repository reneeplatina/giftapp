-- Fires the daily wishlist-nudge route handler once a day. The shared
-- secret it authenticates with lives in Supabase Vault (created
-- separately, outside migrations, so the raw value never sits in a
-- git-tracked file) and is looked up by name here rather than embedded.
select cron.schedule(
  'send-wishlist-nudges-daily',
  '0 15 * * *',
  $$
  select net.http_post(
    url := 'https://giftmeapp.netlify.app/api/cron/send-wishlist-nudges',
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
