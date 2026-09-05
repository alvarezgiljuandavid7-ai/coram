begin;

create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 180),
  body text,
  media_url text,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  cta_label text,
  cta_url text,
  author_name text not null default 'CorAM' check (char_length(trim(author_name)) between 1 and 120),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  published_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists feed_posts_published_order_idx
  on public.feed_posts (sort_order, published_at desc)
  where status = 'published';

alter table public.feed_posts enable row level security;

drop policy if exists feed_posts_select_published on public.feed_posts;
create policy feed_posts_select_published on public.feed_posts
for select to authenticated
using (
  public.is_coram_admin()
  or (status = 'published' and published_at is not null and published_at <= now())
);

drop policy if exists feed_posts_admin_all on public.feed_posts;
create policy feed_posts_admin_all on public.feed_posts
for all to authenticated
using (public.is_coram_admin())
with check (public.is_coram_admin());

grant select, insert, update, delete on public.feed_posts to authenticated;

commit;
