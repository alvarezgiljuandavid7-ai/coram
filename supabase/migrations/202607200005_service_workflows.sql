begin;

create or replace function public.create_ministry_service(
  p_organization_id uuid,
  p_title text,
  p_starts_at timestamptz,
  p_description text default null,
  p_location text default null,
  p_status text default 'scheduled'
)
returns public.services
language plpgsql
security definer
set search_path = public
as $$
declare
  created_service public.services;
begin
  if auth.uid() is null or not public.has_organization_role(
    p_organization_id, array['owner', 'admin', 'leader']
  ) then
    raise exception using errcode = '42501', message = 'service_create_forbidden';
  end if;
  if p_status not in ('draft', 'scheduled') then
    raise exception using errcode = '22023', message = 'service_status_invalid';
  end if;
  insert into public.services (
    organization_id, title, description, starts_at, location, status, created_by
  ) values (
    p_organization_id, trim(p_title), nullif(trim(p_description), ''), p_starts_at,
    nullif(trim(p_location), ''), p_status, auth.uid()
  ) returning * into created_service;
  return created_service;
end;
$$;

create or replace function public.respond_to_service_assignment(
  p_assignment_id uuid,
  p_status text,
  p_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or p_status not in ('confirmed', 'declined') then
    raise exception using errcode = '42501', message = 'assignment_response_forbidden';
  end if;
  update public.service_assignments
  set confirmation_status = p_status, response_note = nullif(trim(p_note), ''), updated_at = now()
  where id = p_assignment_id and user_id = auth.uid();
  if not found then
    raise exception using errcode = '42501', message = 'assignment_response_forbidden';
  end if;
  return true;
end;
$$;

revoke all on function public.create_ministry_service(uuid, text, timestamptz, text, text, text) from public;
grant execute on function public.create_ministry_service(uuid, text, timestamptz, text, text, text) to authenticated;
revoke all on function public.respond_to_service_assignment(uuid, text, text) from public;
grant execute on function public.respond_to_service_assignment(uuid, text, text) to authenticated;

commit;
