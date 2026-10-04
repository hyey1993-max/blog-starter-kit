-- 002: Profiles, curation, saves, walks and observations with RLS.
-- Preserved as original history; renamed to the domain language in 003.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  created_at timestamptz not null default now()
);

create table public.place_images (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  storage_path text not null,
  alt_text text not null,
  position integer not null,
  unique (place_id, position)
);

create table public.context_tags (
  id uuid primary key default gen_random_uuid(),
  label text not null unique
);

create table public.place_context_tags (
  place_id uuid not null references public.places (id) on delete cascade,
  tag_id uuid not null references public.context_tags (id) on delete cascade,
  primary key (place_id, tag_id)
);

create table public.curations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

-- Join table, never an array column: order, notes and permissions stay explicit.
create table public.curation_places (
  curation_id uuid not null references public.curations (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  position integer not null,
  curator_note text,
  primary key (curation_id, place_id),
  constraint curation_places_position_key unique (curation_id, position) deferrable initially deferred
);

create table public.saved_places (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  curation_id uuid references public.curations (id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  primary key (profile_id, place_id)
);

-- Follow relation; counts are never shown as authority.
create table public.curation_follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  curation_id uuid not null references public.curations (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, curation_id)
);

create table public.place_interactions (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  kind text not null constraint place_interactions_kind_check
    check (kind in ('context_viewed', 'detail_opened', 'saved', 'navigation_handoff')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.walks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'active' constraint walks_status_check check (status in ('active', 'finished')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer check (duration_seconds >= 0),
  distance_meters double precision check (distance_meters >= 0),
  step_estimate integer check (step_estimate >= 0),
  path extensions.geography(LineString, 4326)
);

create table public.walk_observations (
  id uuid primary key default gen_random_uuid(),
  walk_id uuid not null references public.walks (id) on delete cascade,
  kind text not null constraint walk_observations_kind_check check (kind in ('text', 'photo')),
  body text,
  photo_path text,
  location extensions.geography(Point, 4326),
  recorded_at timestamptz not null default now(),
  constraint walk_observations_content_check check (
    (kind = 'text' and body is not null and char_length(body) between 1 and 2000)
    or (kind = 'photo' and photo_path is not null)
  )
);

create index saved_places_place_idx on public.saved_places (place_id);
create index curation_places_place_idx on public.curation_places (place_id);
create index place_interactions_profile_idx on public.place_interactions (profile_id, created_at);
create index walks_profile_idx on public.walks (profile_id, started_at desc);
create index walk_observations_walk_idx on public.walk_observations (walk_id, recorded_at);

alter table public.profiles enable row level security;
alter table public.place_images enable row level security;
alter table public.context_tags enable row level security;
alter table public.place_context_tags enable row level security;
alter table public.curations enable row level security;
alter table public.curation_places enable row level security;
alter table public.saved_places enable row level security;
alter table public.curation_follows enable row level security;
alter table public.place_interactions enable row level security;
alter table public.walks enable row level security;
alter table public.walk_observations enable row level security;

-- Profiles: public identity, self-managed.
create policy profiles_select on public.profiles for select to anon, authenticated using (true);
create policy profiles_insert_self on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Curated metadata: readable when the place is published; written by service role.
create policy place_images_select on public.place_images for select to anon, authenticated
  using (exists (select 1 from public.places p where p.id = place_id and p.is_published));
create policy context_tags_select on public.context_tags for select to anon, authenticated using (true);
create policy place_context_tags_select on public.place_context_tags for select to anon, authenticated
  using (exists (select 1 from public.places p where p.id = place_id and p.is_published));

-- Curations: public ones readable by all, private ones by the owner.
create policy curations_select on public.curations for select to anon, authenticated
  using (is_public or owner_id = auth.uid());
create policy curations_insert_own on public.curations for insert to authenticated
  with check (owner_id = auth.uid());
create policy curations_update_own on public.curations for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy curations_delete_own on public.curations for delete to authenticated
  using (owner_id = auth.uid());

create policy curation_places_select on public.curation_places for select to anon, authenticated
  using (exists (
    select 1 from public.curations c
    where c.id = curation_id and (c.is_public or c.owner_id = auth.uid())
  ));
create policy curation_places_write_own on public.curation_places for all to authenticated
  using (exists (select 1 from public.curations c where c.id = curation_id and c.owner_id = auth.uid()))
  with check (exists (select 1 from public.curations c where c.id = curation_id and c.owner_id = auth.uid()));

-- Saves: private to the owner; a destination curation must also be theirs.
create policy saved_places_own on public.saved_places for all to authenticated
  using (profile_id = auth.uid())
  with check (
    profile_id = auth.uid()
    and (curation_id is null or exists (
      select 1 from public.curations c where c.id = curation_id and c.owner_id = auth.uid()
    ))
  );

create policy curation_follows_own on public.curation_follows for all to authenticated
  using (follower_id = auth.uid()) with check (follower_id = auth.uid());

-- Interactions: append-only by the owner.
create policy place_interactions_insert_own on public.place_interactions for insert to authenticated
  with check (profile_id = auth.uid());
create policy place_interactions_select_own on public.place_interactions for select to authenticated
  using (profile_id = auth.uid());

-- Walks and observations: private to the owner.
create policy walks_own on public.walks for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy walk_observations_own on public.walk_observations for all to authenticated
  using (exists (select 1 from public.walks w where w.id = walk_id and w.profile_id = auth.uid()))
  with check (exists (select 1 from public.walks w where w.id = walk_id and w.profile_id = auth.uid()));
