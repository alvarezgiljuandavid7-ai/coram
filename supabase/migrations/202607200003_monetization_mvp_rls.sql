begin;

alter table public.user_entitlements enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_invitations enable row level security;
alter table public.services enable row level security;
alter table public.service_assignments enable row level security;
alter table public.songs enable row level security;
alter table public.service_songs enable row level security;
alter table public.affiliate_partners enable row level security;
alter table public.affiliate_courses enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.sponsor_campaigns enable row level security;
alter table public.sponsor_placements enable row level security;
alter table public.sponsor_events enable row level security;

drop policy if exists user_entitlements_select_own on public.user_entitlements;
create policy user_entitlements_select_own on public.user_entitlements
for select to authenticated
using (user_id = auth.uid() or public.is_coram_admin());

drop policy if exists organizations_select_members on public.organizations;
create policy organizations_select_members on public.organizations
for select to authenticated
using (public.is_organization_member(id) or public.is_coram_admin());

drop policy if exists organizations_insert_owner on public.organizations;
create policy organizations_insert_owner on public.organizations
for insert to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists organizations_update_managers on public.organizations;
create policy organizations_update_managers on public.organizations
for update to authenticated
using (public.has_organization_role(id, array['owner', 'admin']) or public.is_coram_admin())
with check (public.has_organization_role(id, array['owner', 'admin']) or public.is_coram_admin());

drop policy if exists organizations_delete_owner on public.organizations;
create policy organizations_delete_owner on public.organizations
for delete to authenticated
using (public.has_organization_role(id, array['owner']) or public.is_coram_admin());

drop policy if exists organization_members_select_members on public.organization_members;
create policy organization_members_select_members on public.organization_members
for select to authenticated
using (
  user_id = auth.uid()
  or public.is_organization_member(organization_id)
  or public.is_coram_admin()
);

drop policy if exists organization_members_write_managers on public.organization_members;
create policy organization_members_write_managers on public.organization_members
for all to authenticated
using (public.has_organization_role(organization_id, array['owner', 'admin']) or public.is_coram_admin())
with check (public.has_organization_role(organization_id, array['owner', 'admin']) or public.is_coram_admin());

drop policy if exists organization_invitations_select_managers on public.organization_invitations;
create policy organization_invitations_select_managers on public.organization_invitations
for select to authenticated
using (public.has_organization_role(organization_id, array['owner', 'admin']) or public.is_coram_admin());

drop policy if exists organization_invitations_write_managers on public.organization_invitations;
create policy organization_invitations_write_managers on public.organization_invitations
for all to authenticated
using (public.has_organization_role(organization_id, array['owner', 'admin']) or public.is_coram_admin())
with check (
  invited_by = auth.uid()
  and (public.has_organization_role(organization_id, array['owner', 'admin']) or public.is_coram_admin())
);

drop policy if exists services_select_members on public.services;
create policy services_select_members on public.services
for select to authenticated
using (public.is_organization_member(organization_id) or public.is_coram_admin());

drop policy if exists services_write_leaders on public.services;
create policy services_write_leaders on public.services
for all to authenticated
using (public.has_organization_role(organization_id, array['owner', 'admin', 'leader']) or public.is_coram_admin())
with check (
  created_by = auth.uid()
  and (public.has_organization_role(organization_id, array['owner', 'admin', 'leader']) or public.is_coram_admin())
);

drop policy if exists service_assignments_select_members on public.service_assignments;
create policy service_assignments_select_members on public.service_assignments
for select to authenticated
using (public.is_organization_member(organization_id) or public.is_coram_admin());

drop policy if exists service_assignments_write_leaders on public.service_assignments;
create policy service_assignments_write_leaders on public.service_assignments
for all to authenticated
using (public.has_organization_role(organization_id, array['owner', 'admin', 'leader']) or public.is_coram_admin())
with check (public.has_organization_role(organization_id, array['owner', 'admin', 'leader']) or public.is_coram_admin());

drop policy if exists songs_select_personal_owner on public.songs;
create policy songs_select_personal_owner on public.songs
for select to authenticated
using (auth.uid() = owner_user_id);

drop policy if exists songs_select_organization_members on public.songs;
create policy songs_select_organization_members on public.songs
for select to authenticated
using (
  organization_id is not null
  and (public.is_organization_member(organization_id) or public.is_coram_admin())
);

drop policy if exists songs_write_personal_owner on public.songs;
create policy songs_write_personal_owner on public.songs
for all to authenticated
using (auth.uid() = owner_user_id)
with check (
  auth.uid() = owner_user_id
  and organization_id is null
  and created_by = auth.uid()
);

drop policy if exists songs_write_organization_leaders on public.songs;
create policy songs_write_organization_leaders on public.songs
for all to authenticated
using (
  organization_id is not null
  and (public.has_organization_role(organization_id, array['owner', 'admin', 'leader']) or public.is_coram_admin())
)
with check (
  owner_user_id is null
  and created_by = auth.uid()
  and (public.has_organization_role(organization_id, array['owner', 'admin', 'leader']) or public.is_coram_admin())
);

drop policy if exists service_songs_select_members on public.service_songs;
create policy service_songs_select_members on public.service_songs
for select to authenticated
using (public.is_organization_member(organization_id) or public.is_coram_admin());

drop policy if exists service_songs_write_leaders on public.service_songs;
create policy service_songs_write_leaders on public.service_songs
for all to authenticated
using (public.has_organization_role(organization_id, array['owner', 'admin', 'leader']) or public.is_coram_admin())
with check (public.has_organization_role(organization_id, array['owner', 'admin', 'leader']) or public.is_coram_admin());

drop policy if exists affiliate_partners_select_published on public.affiliate_partners;
create policy affiliate_partners_select_published on public.affiliate_partners
for select to authenticated
using (status = 'published' or public.is_coram_admin());

drop policy if exists affiliate_partners_admin_all on public.affiliate_partners;
create policy affiliate_partners_admin_all on public.affiliate_partners
for all to authenticated
using (public.is_coram_admin()) with check (public.is_coram_admin());

drop policy if exists affiliate_courses_select_published on public.affiliate_courses;
create policy affiliate_courses_select_published on public.affiliate_courses
for select to authenticated
using (status = 'published' or public.is_coram_admin());

drop policy if exists affiliate_courses_admin_all on public.affiliate_courses;
create policy affiliate_courses_admin_all on public.affiliate_courses
for all to authenticated
using (public.is_coram_admin()) with check (public.is_coram_admin());

drop policy if exists affiliate_clicks_admin_select on public.affiliate_clicks;
create policy affiliate_clicks_admin_select on public.affiliate_clicks
for select to authenticated
using (public.is_coram_admin());

drop policy if exists sponsor_campaigns_select_active on public.sponsor_campaigns;
create policy sponsor_campaigns_select_active on public.sponsor_campaigns
for select to authenticated
using (
  public.is_coram_admin()
  or (
    status = 'active'
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
  )
);

drop policy if exists sponsor_campaigns_admin_all on public.sponsor_campaigns;
create policy sponsor_campaigns_admin_all on public.sponsor_campaigns
for all to authenticated
using (public.is_coram_admin()) with check (public.is_coram_admin());

drop policy if exists sponsor_placements_select_active on public.sponsor_placements;
create policy sponsor_placements_select_active on public.sponsor_placements
for select to authenticated
using (enabled or public.is_coram_admin());

drop policy if exists sponsor_placements_admin_all on public.sponsor_placements;
create policy sponsor_placements_admin_all on public.sponsor_placements
for all to authenticated
using (public.is_coram_admin()) with check (public.is_coram_admin());

drop policy if exists sponsor_events_admin_select on public.sponsor_events;
create policy sponsor_events_admin_select on public.sponsor_events
for select to authenticated
using (public.is_coram_admin());

-- Event tables intentionally have no client INSERT policy. Tracking goes through
-- validated SECURITY DEFINER RPCs, and entitlement writes remain server-only.

grant select on public.user_entitlements to authenticated;
grant select, insert, update, delete on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_members to authenticated;
grant select, insert, update, delete on public.organization_invitations to authenticated;
grant select, insert, update, delete on public.services to authenticated;
grant select, insert, update, delete on public.service_assignments to authenticated;
grant select, insert, update, delete on public.songs to authenticated;
grant select, insert, update, delete on public.service_songs to authenticated;
grant select, insert, update, delete on public.affiliate_partners to authenticated;
grant select, insert, update, delete on public.affiliate_courses to authenticated;
grant select on public.affiliate_clicks to authenticated;
grant select, insert, update, delete on public.sponsor_campaigns to authenticated;
grant select, insert, update, delete on public.sponsor_placements to authenticated;
grant select on public.sponsor_events to authenticated;

commit;
