begin;

drop policy if exists affiliate_partners_select_published on public.affiliate_partners;
create policy affiliate_partners_select_published on public.affiliate_partners
for select to anon, authenticated using (status='published' or public.is_coram_admin());
drop policy if exists affiliate_courses_select_published on public.affiliate_courses;
create policy affiliate_courses_select_published on public.affiliate_courses
for select to anon, authenticated using (status='published' or public.is_coram_admin());
grant select on public.affiliate_partners,public.affiliate_courses to anon;
grant execute on function public.record_affiliate_click(uuid,text,text,text) to anon;

commit;
