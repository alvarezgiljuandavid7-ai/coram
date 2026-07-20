-- Run against a disposable local Supabase database only.
begin;

do $$
begin
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password)
  values
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'user-a@coram.test', ''),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'user-b@coram.test', ''),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'user-c@coram.test', '')
  on conflict (id) do nothing;
end;
$$;

insert into public.organizations (id, owner_user_id, name, slug, plan_id)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Ministerio Uno', 'mvp-ministerio-uno', 'free'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Ministerio Dos', 'mvp-ministerio-dos', 'ministry_starter');

insert into public.organization_members (organization_id, user_id, role)
values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'member');

insert into public.songs (id, owner_user_id, created_by, title)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Privada A'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Privada B');

insert into public.songs (id, organization_id, created_by, title)
values
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Ministerio Uno Cancion'),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Ministerio Dos Cancion');

-- user A cannot read user B private songs
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","email":"user-a@coram.test"}', true);
do $$
begin
  if exists (select 1 from public.songs where title = 'Privada B') then
    raise exception 'user_a_private_isolation_failed';
  end if;
  if not exists (select 1 from public.songs where title = 'Privada A') then
    raise exception 'user_a_cannot_read_own_song';
  end if;
end;
$$;

reset role;

-- authorized members can read organization songs
-- ministry access is scoped by organization
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated","email":"user-b@coram.test"}', true);
do $$
begin
  if not exists (select 1 from public.songs where title = 'Ministerio Uno Cancion') then
    raise exception 'authorized_member_cannot_read_ministry_song';
  end if;
  if exists (select 1 from public.songs where title = 'Ministerio Dos Cancion') then
    raise exception 'organization_isolation_failed';
  end if;
end;
$$;

reset role;

-- free personal song limit
insert into public.songs (owner_user_id, created_by, title)
select
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000003',
  'Free song ' || n
from generate_series(1, 25) as n;

do $$
begin
  begin
    insert into public.songs (owner_user_id, created_by, title)
    values ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Free song 26');
    raise exception 'free_personal_song_limit_not_enforced';
  exception
    when sqlstate 'P0001' then
      if sqlerrm <> 'personal_song_limit_reached' then raise; end if;
  end;
end;
$$;

-- pro personal songs are unlimited
insert into public.user_entitlements (user_id, plan_id, source, status)
values ('10000000-0000-0000-0000-000000000002', 'pro', 'admin', 'active');

insert into public.songs (owner_user_id, created_by, title)
select
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000002',
  'Pro song ' || n
from generate_series(1, 30) as n;

do $$
begin
  if (select count(*) from public.songs where owner_user_id = '10000000-0000-0000-0000-000000000002') < 31 then
    raise exception 'pro_personal_song_limit_should_be_unlimited';
  end if;
end;
$$;

-- frontend entitlement writes are denied
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","email":"user-a@coram.test"}', true);
do $$
begin
  begin
    insert into public.user_entitlements (user_id, plan_id, source, status)
    values ('10000000-0000-0000-0000-000000000001', 'pro', 'admin', 'active');
    raise exception 'frontend_entitlement_write_should_be_denied';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;
reset role;

-- billing event history is server-only
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
do $$
begin
  begin
    perform 1 from public.billing_events limit 1;
    raise exception 'billing_events_visible_to_frontend';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;
reset role;

-- free organizations cap memberships at five total members
insert into auth.users (id, instance_id, aud, role, email, encrypted_password)
select
  ('10000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'limit-member-' || n || '@coram.test',
  ''
from generate_series(10, 14) as n
on conflict (id) do nothing;

insert into public.organization_members (organization_id, user_id, role)
select
  '20000000-0000-0000-0000-000000000001',
  ('10000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  'member'
from generate_series(10, 12) as n;

do $$
begin
  begin
    insert into public.organization_members (organization_id, user_id, role)
    values (
      '20000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000013',
      'member'
    );
    raise exception 'free_member_limit_not_enforced';
  exception
    when sqlstate 'P0001' then
      if sqlerrm <> 'organization_member_limit_reached' then raise; end if;
  end;
end;
$$;

-- free organizations cap active services at two
insert into public.services (organization_id, title, starts_at, created_by)
values
  ('20000000-0000-0000-0000-000000000001', 'Servicio uno', now(), '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000001', 'Servicio dos', now(), '10000000-0000-0000-0000-000000000001');

do $$
begin
  begin
    insert into public.services (organization_id, title, starts_at, created_by)
    values ('20000000-0000-0000-0000-000000000001', 'Servicio tres', now(), '10000000-0000-0000-0000-000000000001');
    raise exception 'free_service_limit_not_enforced';
  exception
    when sqlstate 'P0001' then
      if sqlerrm <> 'active_service_limit_reached' then raise; end if;
  end;
end;
$$;

-- authenticated users cannot inspect another user's entitlement
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
do $$
begin
  begin
    perform public.resolve_effective_entitlement('10000000-0000-0000-0000-000000000002');
    raise exception 'cross_user_entitlement_read_should_be_denied';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;
reset role;

rollback;
