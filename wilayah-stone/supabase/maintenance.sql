begin;
create index ws_records_expired_rate on public.ws_records(updated) where kind='rate-limit';
create policy server_records on public.ws_records for all to service_role using(true) with check(true);
create policy server_key_verification on public.ws_server_keys for select to service_role using(true);
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('wilayah-expired-rate-counters','15 0 * * *',
 $$delete from public.ws_records where kind='rate-limit' and updated < now()-interval '2 days'$$);
commit;
