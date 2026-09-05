begin;

-- Restores the admin preview of draft/archived affiliate content that the
-- public-read fix removed. Purely additive: the existing published-only
-- policies for anon/authenticated are untouched, and no client INSERT policy
-- is added. Versioned only; apply in staging first, never assume applied.
-- Depends on public.is_coram_admin(uuid), granted to authenticated in
-- 202607200009_harden_mvp_function_privileges.sql.

drop policy if exists affiliate_partners_admin_read on public.affiliate_partners;
create policy affiliate_partners_admin_read on public.affiliate_partners
for select to authenticated
using (public.is_coram_admin());

drop policy if exists affiliate_courses_admin_read on public.affiliate_courses;
create policy affiliate_courses_admin_read on public.affiliate_courses
for select to authenticated
using (public.is_coram_admin());

commit;
