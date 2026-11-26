begin;
create table public.ws_records (
 id text primary key check (length(id) between 1 and 300),
 kind text not null check (length(kind) between 1 and 50),
 owner text not null check (length(owner) between 1 and 300),
 data jsonb not null default '{}'::jsonb,
 created timestamptz not null default now(),
 updated timestamptz not null default now()
);
create index ws_records_kind_owner_created on public.ws_records(kind,owner,created desc,id desc);
create index ws_records_kind_created on public.ws_records(kind,created desc,id desc);
alter table public.ws_records enable row level security;
revoke all on public.ws_records from public,anon,authenticated;
grant select,insert,update,delete on public.ws_records to service_role;
create table public.ws_server_keys(id text primary key,key_hash text not null check(length(key_hash)=64));
alter table public.ws_server_keys enable row level security;
revoke all on public.ws_server_keys from public,anon,authenticated;
grant select on public.ws_server_keys to service_role;
create function public.ws_save_record(p_id text,p_kind text,p_owner text,p_data jsonb)
returns boolean language plpgsql security invoker set search_path='' as $$
begin
 insert into public.ws_records(id,kind,owner,data) values(p_id,p_kind,p_owner,p_data)
 on conflict(id) do update set data=excluded.data,updated=now()
 where ws_records.kind=excluded.kind and ws_records.owner=excluded.owner;
 return found;
end;
$$;
create function public.ws_compare_record(p_id text,p_kind text,p_owner text,p_previous jsonb,p_data jsonb)
returns boolean language plpgsql security invoker set search_path='' as $$
begin
 update public.ws_records set data=p_data,updated=now()
 where id=p_id and kind=p_kind and owner=p_owner and data=p_previous;
 return found;
end;
$$;
create function public.ws_consume_rate(p_owner text,p_limit integer)
returns boolean language plpgsql security invoker set search_path='' as $$
declare p_key text; n integer;
begin
 if p_limit < 1 or p_limit > 500 or length(p_owner)>200 then return false; end if;
 p_key := 'limit:'||p_owner||':'||to_char(now() at time zone 'UTC','YYYY-MM-DD"T"HH24');
 insert into public.ws_records(id,kind,owner,data) values(p_key,'rate-limit',p_owner,'{"count":1}')
 on conflict(id) do update set data=jsonb_build_object('count',(ws_records.data->>'count')::integer+1),updated=now()
 where (ws_records.data->>'count')::integer<p_limit
 returning (data->>'count')::integer into n;
 return n is not null;
end;
$$;
revoke execute on function public.ws_save_record(text,text,text,jsonb) from public,anon,authenticated;
revoke execute on function public.ws_compare_record(text,text,text,jsonb,jsonb) from public,anon,authenticated;
revoke execute on function public.ws_consume_rate(text,integer) from public,anon,authenticated;
grant execute on function public.ws_save_record(text,text,text,jsonb) to service_role;
grant execute on function public.ws_compare_record(text,text,text,jsonb,jsonb) to service_role;
grant execute on function public.ws_consume_rate(text,integer) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('design-references','design-references',false,5242880,array['image/png','image/jpeg','image/webp']);
-- All customer access is authorised by the Site server. No anonymous table or object access.
commit;
