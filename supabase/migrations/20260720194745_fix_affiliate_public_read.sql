begin;

drop policy if exists affiliate_partners_select_published on public.affiliate_partners;
create policy affiliate_partners_select_published on public.affiliate_partners
for select to anon, authenticated
using (status = 'published');

drop policy if exists affiliate_courses_select_published on public.affiliate_courses;
create policy affiliate_courses_select_published on public.affiliate_courses
for select to anon, authenticated
using (status = 'published');

commit;
