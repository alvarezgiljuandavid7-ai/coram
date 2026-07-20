begin;

create extension if not exists pgcrypto;

create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null check (plan_id in ('free', 'pro', 'ministry_starter', 'ministry_pro')),
  source text not null default 'system' check (source in ('system', 'revenuecat', 'admin')),
  status text not null default 'active' check (status in ('active', 'grace_period', 'expired', 'revoked')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  external_customer_id text,
  external_product_id text,
  external_event_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, external_event_id)
);

create index if not exists user_entitlements_user_active_idx
  on public.user_entitlements (user_id, status, expires_at);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  plan_id text not null default 'free' check (plan_id in ('free', 'ministry_starter', 'ministry_pro')),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists organizations_owner_idx on public.organizations (owner_user_id);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'leader', 'member')),
  instrument text,
  vocal_part text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists organization_members_user_idx
  on public.organization_members (user_id, organization_id) where status = 'active';

create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invited_email text not null,
  role text not null default 'member' check (role in ('admin', 'leader', 'member')),
  instrument text,
  vocal_part text,
  token_hash text not null unique,
  invited_by uuid not null references auth.users(id) on delete restrict,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists organization_invitations_org_idx
  on public.organization_invitations (organization_id, expires_at);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 160),
  description text,
  starts_at timestamptz not null,
  location text,
  status text not null default 'scheduled' check (status in ('draft', 'scheduled', 'completed', 'cancelled')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id)
);

create index if not exists services_org_starts_idx
  on public.services (organization_id, starts_at desc);

create table if not exists public.service_assignments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  assignment_role text not null,
  instrument text,
  vocal_part text,
  confirmation_status text not null default 'pending' check (confirmation_status in ('pending', 'confirmed', 'declined')),
  response_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_id, user_id, assignment_role),
  foreign key (service_id, organization_id)
    references public.services (id, organization_id) on delete cascade
);

-- Personal and ministry repertoire share one shape, but never one owner.
-- Personal rows are private to owner_user_id. Ministry rows belong to organization_id.
create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 1 and 200),
  artist text,
  musical_key text,
  bpm integer check (bpm between 20 and 320),
  lyrics text,
  chords text,
  notes text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint songs_exactly_one_owner check (
    (owner_user_id is not null)::integer + (organization_id is not null)::integer = 1
  ),
  unique (id, organization_id)
);

create index if not exists songs_personal_idx
  on public.songs (owner_user_id, updated_at desc) where owner_user_id is not null;
create index if not exists songs_organization_idx
  on public.songs (organization_id, updated_at desc) where organization_id is not null;
create index if not exists songs_search_idx
  on public.songs using gin (to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(artist, '')));

create table if not exists public.service_songs (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null,
  song_id uuid not null,
  organization_id uuid not null,
  position integer not null default 0 check (position >= 0),
  service_key text,
  notes text,
  created_at timestamptz not null default now(),
  unique (service_id, song_id),
  foreign key (service_id, organization_id)
    references public.services (id, organization_id) on delete cascade,
  foreign key (song_id, organization_id)
    references public.songs (id, organization_id) on delete cascade
);

create index if not exists service_songs_order_idx
  on public.service_songs (service_id, position);

create table if not exists public.affiliate_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  allowed_domains text[] not null default '{}',
  disclosure text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.affiliate_courses (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.affiliate_partners(id) on delete cascade,
  title text not null,
  description text,
  thumbnail_url text,
  video_url text,
  destination_url text not null,
  coupon_code text,
  featured boolean not null default false,
  position integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists affiliate_courses_published_idx
  on public.affiliate_courses (featured desc, position, published_at desc) where status = 'published';

create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.affiliate_courses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  session_hash text,
  referrer_host text,
  user_agent_hash text,
  clicked_at timestamptz not null default now()
);

create index if not exists affiliate_clicks_course_idx
  on public.affiliate_clicks (course_id, clicked_at desc);

create table if not exists public.sponsor_campaigns (
  id uuid primary key default gen_random_uuid(),
  sponsor_name text not null,
  label text not null default 'Contenido patrocinado',
  title text not null,
  body text,
  image_url text,
  destination_url text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'archived')),
  starts_at timestamptz,
  ends_at timestamptz,
  priority integer not null default 0,
  frequency_cap_per_day integer not null default 3 check (frequency_cap_per_day between 1 and 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sponsor_placements (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.sponsor_campaigns(id) on delete cascade,
  placement text not null check (placement in ('home', 'academia', 'recursos')),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (campaign_id, placement)
);

create table if not exists public.sponsor_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.sponsor_campaigns(id) on delete cascade,
  placement text not null check (placement in ('home', 'academia', 'recursos')),
  event_type text not null check (event_type in ('impression', 'click')),
  user_id uuid references auth.users(id) on delete set null,
  session_hash text not null,
  occurred_at timestamptz not null default now()
);

create index if not exists sponsor_events_frequency_idx
  on public.sponsor_events (campaign_id, session_hash, event_type, occurred_at desc);

commit;
