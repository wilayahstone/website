-- Hosted migration: journal_unique_slug, 11 November 2026.
-- A published or draft article owns its URL, including while archived.
create unique index if not exists ws_records_post_slug_unique
on public.ws_records ((data->>'slug'))
where kind='post' and data->>'slug' is not null;
