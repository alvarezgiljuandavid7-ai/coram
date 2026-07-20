begin;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.resolve_effective_entitlement(p_user_id uuid default auth.uid())
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
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
$$;

create or replace function public.has_personal_pro_entitlement(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_entitlements ue
    where ue.user_id = p_user_id
      and ue.plan_id = 'pro'
      and ue.status in ('active', 'grace_period')
      and (ue.expires_at is null or ue.expires_at > now())
  );
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
  select exists (
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
  select exists (
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
  select exists (
    select 1 from public.profiles p where p.id = p_user_id and p.role = 'admin'
  );
$$;

create or replace function public.enforce_personal_song_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  personal_song_limit integer := 25;
  current_count integer;
begin
  if new.owner_user_id is null then
    return new;
  end if;

  if public.has_personal_pro_entitlement(new.owner_user_id) then
    personal_song_limit := -1;
  end if;

  if personal_song_limit = -1 then
    return new;
  end if;

  select count(*) into current_count
  from public.songs s
  where s.owner_user_id = new.owner_user_id
    and s.status = 'active'
    and (tg_op = 'INSERT' or s.id <> new.id);

  if new.status = 'active' and current_count >= personal_song_limit then
    raise exception using errcode = 'P0001', message = 'personal_song_limit_reached';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_organization_owner_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.organizations o
    where o.owner_user_id = new.owner_user_id and o.status = 'active'
  ) then
    raise exception using errcode = 'P0001', message = 'organization_limit_reached';
  end if;
  return new;
end;
$$;

create or replace function public.protect_organization_billing_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.owner_user_id is distinct from old.owner_user_id
    and current_user not in ('postgres', 'service_role', 'supabase_admin')
    and not public.is_coram_admin()
  then
    raise exception using errcode = '42501', message = 'organization_owner_is_server_managed';
  end if;

  if new.plan_id is distinct from old.plan_id
    and current_user not in ('postgres', 'service_role', 'supabase_admin')
    and not public.is_coram_admin()
  then
    raise exception using errcode = '42501', message = 'organization_plan_is_server_managed';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_organization_member_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  member_limit integer;
  current_count integer;
begin
  if new.status <> 'active' then
    return new;
  end if;

  select case o.plan_id
    when 'ministry_pro' then 50
    when 'ministry_starter' then 15
    else 5
  end into member_limit
  from public.organizations o where o.id = new.organization_id;

  select count(*) into current_count
  from public.organization_members om
  where om.organization_id = new.organization_id
    and om.status = 'active'
    and (tg_op = 'INSERT' or om.id <> new.id);

  if current_count >= member_limit then
    raise exception using errcode = 'P0001', message = 'organization_member_limit_reached';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_active_service_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  service_limit integer;
  current_count integer;
begin
  if new.status not in ('draft', 'scheduled') then
    return new;
  end if;

  select case when o.plan_id = 'free' then 2 else -1 end
    into service_limit
  from public.organizations o where o.id = new.organization_id;

  if service_limit = -1 then
    return new;
  end if;

  select count(*) into current_count
  from public.services s
  where s.organization_id = new.organization_id
    and s.status in ('draft', 'scheduled')
    and (tg_op = 'INSERT' or s.id <> new.id);

  if current_count >= service_limit then
    raise exception using errcode = 'P0001', message = 'active_service_limit_reached';
  end if;

  return new;
end;
$$;

create or replace function public.add_organization_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.organization_members (organization_id, user_id, role)
  values (new.id, new.owner_user_id, 'owner')
  on conflict (organization_id, user_id) do update set role = 'owner', status = 'active';
  return new;
end;
$$;

create or replace function public.accept_organization_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation public.organization_invitations%rowtype;
  current_email text;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  current_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  select * into invitation
  from public.organization_invitations oi
  where oi.token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and oi.accepted_at is null
    and oi.expires_at > now()
  for update;

  if invitation.id is null or lower(invitation.invited_email) <> current_email then
    raise exception using errcode = '42501', message = 'invitation_invalid_or_expired';
  end if;

  insert into public.organization_members (
    organization_id, user_id, role, instrument, vocal_part
  ) values (
    invitation.organization_id, auth.uid(), invitation.role,
    invitation.instrument, invitation.vocal_part
  ) on conflict (organization_id, user_id) do update set
    role = excluded.role,
    instrument = excluded.instrument,
    vocal_part = excluded.vocal_part,
    status = 'active',
    updated_at = now();

  update public.organization_invitations
  set accepted_at = now(), accepted_by = auth.uid()
  where id = invitation.id;

  return invitation.organization_id;
end;
$$;

create or replace function public.record_affiliate_click(
  p_course_id uuid,
  p_session_hash text,
  p_referrer_host text default null,
  p_user_agent_hash text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  click_id uuid;
begin
  if not exists (
    select 1 from public.affiliate_courses c
    join public.affiliate_partners p on p.id = c.partner_id
    where c.id = p_course_id and c.status = 'published' and p.status = 'published'
  ) then
    raise exception using errcode = '22023', message = 'affiliate_course_unavailable';
  end if;

  insert into public.affiliate_clicks (
    course_id, user_id, session_hash, referrer_host, user_agent_hash
  ) values (
    p_course_id, auth.uid(), nullif(p_session_hash, ''),
    nullif(p_referrer_host, ''), nullif(p_user_agent_hash, '')
  ) returning id into click_id;

  return click_id;
end;
$$;

create or replace function public.record_sponsor_event(
  p_campaign_id uuid,
  p_placement text,
  p_event_type text,
  p_session_hash text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  daily_cap integer;
  impression_count integer;
begin
  select c.frequency_cap_per_day into daily_cap
  from public.sponsor_campaigns c
  join public.sponsor_placements sp on sp.campaign_id = c.id
  where c.id = p_campaign_id
    and sp.placement = p_placement
    and sp.enabled
    and c.status = 'active'
    and (c.starts_at is null or c.starts_at <= now())
    and (c.ends_at is null or c.ends_at > now());

  if daily_cap is null or p_event_type not in ('impression', 'click') or p_session_hash = '' then
    return false;
  end if;

  if p_event_type = 'impression' then
    select count(*) into impression_count
    from public.sponsor_events se
    where se.campaign_id = p_campaign_id
      and se.session_hash = p_session_hash
      and se.event_type = 'impression'
      and se.occurred_at >= date_trunc('day', now());

    if impression_count >= daily_cap then
      return false;
    end if;
  end if;

  insert into public.sponsor_events (
    campaign_id, placement, event_type, user_id, session_hash
  ) values (
    p_campaign_id, p_placement, p_event_type, auth.uid(), p_session_hash
  );

  return true;
end;
$$;

drop trigger if exists songs_enforce_personal_limit on public.songs;
create trigger songs_enforce_personal_limit
before insert or update of owner_user_id, status on public.songs
for each row execute function public.enforce_personal_song_limit();

drop trigger if exists organization_members_enforce_limit on public.organization_members;
create trigger organization_members_enforce_limit
before insert or update of status on public.organization_members
for each row execute function public.enforce_organization_member_limit();

drop trigger if exists services_enforce_limit on public.services;
create trigger services_enforce_limit
before insert or update of status on public.services
for each row execute function public.enforce_active_service_limit();

drop trigger if exists organizations_add_owner on public.organizations;
create trigger organizations_add_owner
after insert on public.organizations
for each row execute function public.add_organization_owner_membership();

drop trigger if exists organizations_enforce_owner_limit on public.organizations;
create trigger organizations_enforce_owner_limit
before insert on public.organizations
for each row execute function public.enforce_organization_owner_limit();

drop trigger if exists organizations_protect_billing_fields on public.organizations;
create trigger organizations_protect_billing_fields
before update of owner_user_id, plan_id on public.organizations
for each row execute function public.protect_organization_billing_fields();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'user_entitlements', 'organizations', 'organization_members', 'services',
    'service_assignments', 'songs', 'affiliate_partners', 'affiliate_courses',
    'sponsor_campaigns'
  ] loop
    execute format('drop trigger if exists %I_touch_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger %I_touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()',
      table_name, table_name
    );
  end loop;
end;
$$;

revoke all on function public.accept_organization_invitation(text) from public;
grant execute on function public.accept_organization_invitation(text) to authenticated;
revoke all on function public.record_affiliate_click(uuid, text, text, text) from public;
grant execute on function public.record_affiliate_click(uuid, text, text, text) to authenticated;
revoke all on function public.record_sponsor_event(uuid, text, text, text) from public;
grant execute on function public.record_sponsor_event(uuid, text, text, text) to authenticated;

commit;
