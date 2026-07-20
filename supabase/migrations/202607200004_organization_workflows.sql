begin;

create or replace function public.create_organization_invitation(
  p_organization_id uuid,
  p_email text,
  p_role text default 'member',
  p_instrument text default null,
  p_vocal_part text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_token text := encode(gen_random_bytes(32), 'hex');
  invitation_id uuid;
begin
  if auth.uid() is null or not public.has_organization_role(
    p_organization_id, array['owner', 'admin']
  ) then
    raise exception using errcode = '42501', message = 'organization_invite_forbidden';
  end if;

  if p_role not in ('admin', 'leader', 'member') then
    raise exception using errcode = '22023', message = 'organization_role_invalid';
  end if;

  if p_email !~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
    raise exception using errcode = '22023', message = 'organization_email_invalid';
  end if;

  delete from public.organization_invitations
  where organization_id = p_organization_id
    and lower(invited_email) = lower(trim(p_email))
    and accepted_at is null;

  insert into public.organization_invitations (
    organization_id, invited_email, role, instrument, vocal_part,
    token_hash, invited_by, expires_at
  ) values (
    p_organization_id, lower(trim(p_email)), p_role, nullif(trim(p_instrument), ''),
    nullif(trim(p_vocal_part), ''), encode(digest(raw_token, 'sha256'), 'hex'),
    auth.uid(), now() + interval '7 days'
  ) returning id into invitation_id;

  return jsonb_build_object('invitation_id', invitation_id, 'token', raw_token);
end;
$$;

revoke all on function public.create_organization_invitation(uuid, text, text, text, text) from public;
grant execute on function public.create_organization_invitation(uuid, text, text, text, text) to authenticated;

commit;
