begin;

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  external_event_id text not null unique,
  event_type text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  plan_id text not null check (plan_id in ('pro', 'ministry_starter', 'ministry_pro')),
  status text not null check (status in ('active', 'grace_period', 'expired', 'revoked')),
  environment text not null check (environment in ('SANDBOX', 'PRODUCTION')),
  processed_at timestamptz not null default now()
);

alter table public.billing_events enable row level security;
revoke all on public.billing_events from anon, authenticated;

create or replace function public.process_revenuecat_event(
  p_event_id text,
  p_event_type text,
  p_user_id uuid,
  p_product_id text,
  p_plan_id text,
  p_status text,
  p_expires_at timestamptz,
  p_environment text
)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  inserted_count integer;
  effective_ministry_plan text;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required';
  end if;

  insert into public.billing_events (
    external_event_id, event_type, user_id, product_id, plan_id, status, environment
  ) values (
    p_event_id, p_event_type, p_user_id, p_product_id, p_plan_id, p_status, p_environment
  ) on conflict (external_event_id) do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  update public.user_entitlements
  set status = 'expired', updated_at = now()
  where user_id = p_user_id
    and source = 'revenuecat'
    and status in ('active', 'grace_period');

  insert into public.user_entitlements (
    user_id, plan_id, source, status, starts_at, expires_at,
    external_customer_id, external_product_id, external_event_id,
    metadata, updated_at
  ) values (
    p_user_id, p_plan_id, 'revenuecat', p_status, now(), p_expires_at,
    p_user_id::text, p_product_id, p_event_id,
    jsonb_build_object('environment', p_environment, 'event_type', p_event_type), now()
  );

  select ue.plan_id into effective_ministry_plan
  from public.user_entitlements ue
  where ue.user_id = p_user_id
    and ue.source = 'revenuecat'
    and ue.plan_id in ('ministry_starter', 'ministry_pro')
    and ue.status in ('active', 'grace_period')
    and (ue.expires_at is null or ue.expires_at > now())
  order by case ue.plan_id when 'ministry_pro' then 2 else 1 end desc
  limit 1;

  update public.organizations
  set plan_id = coalesce(effective_ministry_plan, 'free'), updated_at = now()
  where owner_user_id = p_user_id;

  return true;
end;
$$;

revoke all on function public.process_revenuecat_event(text,text,uuid,text,text,text,timestamptz,text) from public, anon, authenticated;
grant execute on function public.process_revenuecat_event(text,text,uuid,text,text,text,timestamptz,text) to service_role;

commit;
