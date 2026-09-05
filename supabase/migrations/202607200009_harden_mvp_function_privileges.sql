begin;

create or replace function public.resolve_effective_entitlement(
  p_user_id uuid default auth.uid()
)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_user_id is distinct from auth.uid()
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'entitlement_access_denied' using errcode = '42501';
  end if;

  return coalesce((
    select ue.plan_id
    from public.user_entitlements ue
    where ue.user_id = p_user_id
      and ue.status in ('active', 'grace_period')
      and (ue.expires_at is null or ue.expires_at > now())
    order by case ue.plan_id
      when 'ministry_pro' then 4
      when 'ministry_starter' then 3
      when 'pro' then 2
      else 1
    end desc, ue.updated_at desc
    limit 1
  ), 'free');
end;
$$;

create or replace function public.is_organization_member(
  p_organization_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (
    p_user_id = auth.uid()
    or coalesce(auth.jwt() ->> 'role', '') = 'service_role'
    or session_user in ('postgres', 'supabase_admin')
  ) and exists (
    select 1
    from public.organization_members om
    where om.organization_id = p_organization_id
      and om.user_id = p_user_id
      and om.status = 'active'
  );
$$;

create or replace function public.has_organization_role(
  p_organization_id uuid,
  p_roles text[],
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (
    p_user_id = auth.uid()
    or coalesce(auth.jwt() ->> 'role', '') = 'service_role'
    or session_user in ('postgres', 'supabase_admin')
  ) and exists (
    select 1
    from public.organization_members om
    where om.organization_id = p_organization_id
      and om.user_id = p_user_id
      and om.status = 'active'
      and om.role = any(p_roles)
  );
$$;

create or replace function public.is_coram_admin(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (
    p_user_id = auth.uid()
    or coalesce(auth.jwt() ->> 'role', '') = 'service_role'
    or session_user in ('postgres', 'supabase_admin')
  ) and exists (
    select 1
    from public.profiles p
    where p.id = p_user_id and p.role = 'admin'
  );
$$;

do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'accept_organization_invitation',
        'add_organization_owner_membership',
        'create_ministry_service',
        'create_organization_invitation',
        'create_organization_song',
        'create_personal_song',
        'enforce_active_service_limit',
        'enforce_organization_member_limit',
        'enforce_organization_owner_limit',
        'enforce_personal_song_limit',
        'has_organization_role',
        'has_personal_pro_entitlement',
        'is_coram_admin',
        'is_organization_member',
        'protect_organization_billing_fields',
        'record_affiliate_click',
        'record_sponsor_event',
        'resolve_effective_entitlement',
        'respond_to_service_assignment'
      )
  loop
    execute format('revoke all on function %s from public, anon, authenticated', fn.signature);
  end loop;
end;
$$;

grant execute on function public.accept_organization_invitation(text) to authenticated;
grant execute on function public.create_ministry_service(uuid, text, timestamptz, text, text, text) to authenticated;
grant execute on function public.create_organization_invitation(uuid, text, text, text, text) to authenticated;
grant execute on function public.create_organization_song(uuid, text, text, text, integer, text, text, text) to authenticated;
grant execute on function public.create_personal_song(text, text, text, integer, text, text, text) to authenticated;
grant execute on function public.has_organization_role(uuid, text[], uuid) to authenticated;
grant execute on function public.is_coram_admin(uuid) to authenticated;
grant execute on function public.is_organization_member(uuid, uuid) to authenticated;
grant execute on function public.record_affiliate_click(uuid, text, text, text) to anon, authenticated;
grant execute on function public.record_sponsor_event(uuid, text, text, text) to authenticated;
grant execute on function public.resolve_effective_entitlement(uuid) to authenticated;
grant execute on function public.respond_to_service_assignment(uuid, text, text) to authenticated;

commit;
