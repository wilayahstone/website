begin;
-- A narrow server-only check supports immediate revocation and an eight-hour
-- absolute staff-session lifetime without exposing auth records to browsers.
grant select(id,user_id,created_at,not_after) on auth.sessions to service_role;
create function public.ws_admin_session_active(p_session_id uuid,p_user_id uuid)
returns boolean language sql stable security invoker set search_path='' as $$
 select exists(select 1 from auth.sessions s where s.id=p_session_id and s.user_id=p_user_id
 and s.created_at>now()-interval '8 hours' and (s.not_after is null or s.not_after>now()));
$$;
revoke execute on function public.ws_admin_session_active(uuid,uuid) from public,anon,authenticated;
grant execute on function public.ws_admin_session_active(uuid,uuid) to service_role;
commit;
