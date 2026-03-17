
SELECT cron.schedule(
  'cleanup-unconfirmed-users',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://rbkqgzairobefrmfdkei.supabase.co/functions/v1/cleanup-unconfirmed',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJia3FnemFpcm9iZWZybWZka2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NzYyMzIsImV4cCI6MjA4NzU1MjIzMn0.EgtVsROoznd40srvcr21pcTFoiw-88GKSmKR0Hz7CFM"}'::jsonb,
    body := concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);
