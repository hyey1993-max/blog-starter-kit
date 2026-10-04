-- 001: Prototype places with server-side proximity ordering.
-- Zero paid map API: PostGIS straight-line distance only.
-- Preserved as original history; renamed to the domain language in 003.

create extension if not exists postgis with schema extensions;

create table public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  zone text not null,
  location extensions.geography(Point, 4326) not null,
  seuil smallint not null constraint places_seuil_check check (seuil between 1 and 3),
  narrative text not null,
  curator_name text not null,
  hours_note text,
  accessibility_note text,
  editorial_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index places_location_idx on public.places using gist (location);

alter table public.places enable row level security;

-- Curated content is written by curators through the service role only.
create policy places_select_published on public.places
  for select to anon, authenticated
  using (is_published);

-- Proximity or explicit editorial order. Never popularity.
create function public.nearby_places(
  lat double precision,
  lng double precision,
  max_seuil smallint default 3,
  max_meters double precision default 5000,
  result_limit integer default 20
)
returns table (
  id uuid,
  name text,
  zone text,
  latitude double precision,
  longitude double precision,
  seuil smallint,
  narrative text,
  distance_meters double precision
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with origin as (
    select st_setsrid(st_makepoint(lng, lat), 4326)::geography as g
  )
  select
    p.id,
    p.name,
    p.zone,
    st_y(p.location::geometry),
    st_x(p.location::geometry),
    p.seuil,
    p.narrative,
    st_distance(p.location, origin.g)
  from public.places p, origin
  where p.is_published
    and p.seuil <= max_seuil
    and st_dwithin(p.location, origin.g, max_meters)
  order by st_distance(p.location, origin.g), p.editorial_order
  limit least(greatest(result_limit, 1), 50);
$$;

grant execute on function public.nearby_places(double precision, double precision, smallint, double precision, integer)
  to anon, authenticated;
