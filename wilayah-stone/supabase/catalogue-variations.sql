-- Save a product and its current/historical SKU ownership in one transaction.
-- Only the existing server bridge may invoke this function.
create or replace function public.ws_save_catalogue_product(p_id text,p_previous jsonb,p_data jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 old public.ws_records%rowtype;
 claims jsonb;
 claim jsonb;
 held public.ws_records%rowtype;
 code text;
 variant text;
begin
 if p_id is null or p_id !~ '^[A-Z0-9][A-Z0-9-]{2,29}$' or jsonb_typeof(p_data)<>'object' or p_data->>'id' is distinct from p_id or octet_length(p_data::text)>220000 then
  return jsonb_build_object('ok',false,'reason','invalid');
 end if;
 if coalesce(jsonb_typeof(p_data->'variations'),'array')<>'array' or jsonb_array_length(coalesce(p_data->'variations','[]'::jsonb))>200 then return jsonb_build_object('ok',false,'reason','invalid');end if;
 perform pg_advisory_xact_lock(hashtextextended('ws-product:'||p_id,0));
 select * into old from public.ws_records where id=p_id for update;
 if found then
  if old.kind<>'product' or old.owner<>'store' or p_previous is null or old.data is distinct from p_previous or old.data->>'archivedAt' is not null then return jsonb_build_object('ok',false,'reason','version');end if;
 elsif p_previous is not null then return jsonb_build_object('ok',false,'reason','version');end if;
 claims:=jsonb_build_array(jsonb_build_object('sku',p_data->>'sku','variationId',null))||coalesce((select jsonb_agg(jsonb_build_object('sku',v->>'sku','variationId',v->>'id')) from jsonb_array_elements(coalesce(p_data->'variations','[]'::jsonb)) v),'[]'::jsonb);
 if exists(select 1 from jsonb_array_elements(claims) c where length(coalesce(c->>'sku','')) not between 1 and 40) or (select count(distinct upper(c->>'sku')) from jsonb_array_elements(claims)c)<>jsonb_array_length(claims) then return jsonb_build_object('ok',false,'reason','sku');end if;
 -- The exception block rolls every SKU claim back if any conflict is found.
 begin
  for claim in select value from jsonb_array_elements(claims) order by upper(value->>'sku') loop
   code:=upper(claim->>'sku');variant:=coalesce(claim->>'variationId','');
   perform pg_advisory_xact_lock(hashtextextended('ws-sku:'||code,0));
   if exists(select 1 from public.ws_records r where r.kind='product' and r.id<>p_id and upper(coalesce(nullif(r.data->>'sku',''),r.id))=code) then raise exception 'sku_conflict';end if;
   insert into public.ws_records(id,kind,owner,data) values('product-sku:'||code,'setting','catalog:sku',jsonb_build_object('productId',p_id,'variationId',nullif(variant,''))) on conflict(id) do nothing;
   select * into held from public.ws_records where id='product-sku:'||code for update;
   if held.kind<>'setting' or held.owner<>'catalog:sku' or held.data->>'productId' is distinct from p_id or coalesce(held.data->>'variationId','')<>variant then raise exception 'sku_conflict';end if;
  end loop;
  if old.id is null then
   insert into public.ws_records(id,kind,owner,data) values(p_id,'product','store',p_data);
  else
   update public.ws_records set data=p_data,updated=clock_timestamp() where id=p_id;
  end if;
 exception when raise_exception then
  if sqlerrm='sku_conflict' then return jsonb_build_object('ok',false,'reason','sku');else raise;end if;
 when unique_violation then return jsonb_build_object('ok',false,'reason','version');
 end;
 return jsonb_build_object('ok',true);
end;
$$;
revoke all on function public.ws_save_catalogue_product(text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.ws_save_catalogue_product(text,jsonb,jsonb) to service_role;
