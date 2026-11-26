-- Integration check. Run the entire script; all synthetic writes are rolled back.
begin;
set local role service_role;
do $$
declare
 a jsonb := '{"id":"PRD-QAVARIATION-A","sku":"QA-VARIATION-BASE-A","variations":[{"id":"11111111-1111-4111-8111-111111111111","sku":"QA-VARIATION-ROW"}]}'::jsonb;
 b jsonb := '{"id":"PRD-QAVARIATION-B","sku":"QA-VARIATION-BASE-B","variations":[{"id":"22222222-2222-4222-8222-222222222222","sku":"QA-VARIATION-ROW"}]}'::jsonb;
 renamed jsonb;
 result jsonb;
begin
 if exists(select 1 from public.ws_records where id in ('PRD-QAVARIATION-A','PRD-QAVARIATION-B','product-sku:QA-VARIATION-BASE-A','product-sku:QA-VARIATION-BASE-B','product-sku:QA-VARIATION-ROW','product-sku:QA-VARIATION-RENAMED')) then raise exception 'QA identifiers already exist; choose unused identifiers';end if;
 result:=public.ws_save_catalogue_product('PRD-QAVARIATION-A',null,a);
 if result->>'ok'<>'true' then raise exception 'Initial product save failed';end if;
 result:=public.ws_save_catalogue_product('PRD-QAVARIATION-B',null,b);
 if result->>'reason'<>'sku' or exists(select 1 from public.ws_records where id in ('PRD-QAVARIATION-B','product-sku:QA-VARIATION-BASE-B')) then raise exception 'SKU conflict was not atomic';end if;
 result:=public.ws_save_catalogue_product('PRD-QAVARIATION-A','{}'::jsonb,a);
 if result->>'reason'<>'version' then raise exception 'Stale product was accepted';end if;
 renamed:=jsonb_set(a,'{variations,0,sku}','"QA-VARIATION-RENAMED"');
 result:=public.ws_save_catalogue_product('PRD-QAVARIATION-A',a,renamed);
 if result->>'ok'<>'true' or not exists(select 1 from public.ws_records where id='product-sku:QA-VARIATION-ROW') then raise exception 'Historical SKU was not preserved';end if;
 result:=public.ws_save_catalogue_product('PRD-QAVARIATION-B',null,b);
 if result->>'reason'<>'sku' then raise exception 'Historical SKU was reused';end if;
end $$;
rollback;
select count(*) as test_rows_remaining from public.ws_records where id in ('PRD-QAVARIATION-A','PRD-QAVARIATION-B','product-sku:QA-VARIATION-BASE-A','product-sku:QA-VARIATION-BASE-B','product-sku:QA-VARIATION-ROW','product-sku:QA-VARIATION-RENAMED');
