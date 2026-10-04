-- 003: Move the live schema to the ubiquitous language.
-- Flâneur, Passage, Seuil, Dérive, Tracé (ASCII identifiers).
-- RLS policies follow table/column renames; they are renamed here for clarity.

alter table public.profiles rename to flaneurs;
alter table public.places rename to passages;
alter table public.place_images rename to passage_images;
alter table public.place_context_tags rename to passage_context_tags;
alter table public.curation_places rename to curation_passages;
alter table public.saved_places rename to saved_passages;
alter table public.place_interactions rename to passage_interactions;
alter table public.walks rename to traces;
alter table public.walk_observations rename to trace_observations;

alter table public.passage_images rename column place_id to passage_id;
alter table public.passage_context_tags rename column place_id to passage_id;
alter table public.curation_passages rename column place_id to passage_id;
alter table public.saved_passages rename column place_id to passage_id;
alter table public.saved_passages rename column profile_id to flaneur_id;
alter table public.passage_interactions rename column place_id to passage_id;
alter table public.passage_interactions rename column profile_id to flaneur_id;
alter table public.traces rename column profile_id to flaneur_id;
alter table public.trace_observations rename column walk_id to trace_id;

-- A Tracé is 'drifting' while its Dérive is in progress, then 'archived'.
alter table public.traces drop constraint walks_status_check;
alter table public.traces alter column status drop default;
update public.traces set status = case status when 'active' then 'drifting' else 'archived' end;
alter table public.traces alter column status set default 'drifting';
alter table public.traces add constraint traces_status_check check (status in ('drifting', 'archived'));
alter table public.traces add constraint traces_archived_summary_check check (
  status = 'drifting'
  or (ended_at is not null and duration_seconds is not null and distance_meters is not null and step_estimate is not null)
);

alter table public.passages rename constraint places_seuil_check to passages_seuil_check;
alter table public.passage_interactions rename constraint place_interactions_kind_check to passage_interactions_kind_check;
alter table public.trace_observations rename constraint walk_observations_kind_check to trace_observations_kind_check;
alter table public.trace_observations rename constraint walk_observations_content_check to trace_observations_content_check;
alter table public.curation_passages rename constraint curation_places_position_key to curation_passages_position_key;

alter index public.places_location_idx rename to passages_location_idx;
alter index public.saved_places_place_idx rename to saved_passages_passage_idx;
alter index public.curation_places_place_idx rename to curation_passages_passage_idx;
alter index public.place_interactions_profile_idx rename to passage_interactions_flaneur_idx;
alter index public.walks_profile_idx rename to traces_flaneur_idx;
alter index public.walk_observations_walk_idx rename to trace_observations_trace_idx;

alter policy places_select_published on public.passages rename to passages_select_published;
alter policy profiles_select on public.flaneurs rename to flaneurs_select;
alter policy profiles_insert_self on public.flaneurs rename to flaneurs_insert_self;
alter policy profiles_update_self on public.flaneurs rename to flaneurs_update_self;
alter policy place_images_select on public.passage_images rename to passage_images_select;
alter policy place_context_tags_select on public.passage_context_tags rename to passage_context_tags_select;
alter policy curation_places_select on public.curation_passages rename to curation_passages_select;
alter policy curation_places_write_own on public.curation_passages rename to curation_passages_write_own;
alter policy saved_places_own on public.saved_passages rename to saved_passages_own;
alter policy place_interactions_insert_own on public.passage_interactions rename to passage_interactions_insert_own;
alter policy place_interactions_select_own on public.passage_interactions rename to passage_interactions_select_own;
alter policy walks_own on public.traces rename to traces_own;
alter policy walk_observations_own on public.trace_observations rename to trace_observations_own;

-- Nearby Passages: input latitude, longitude, Seuil. Proximity or editorial order only.
drop function public.nearby_places(double precision, double precision, smallint, double precision, integer);

create function public.nearby_passages(
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
  from public.passages p, origin
  where p.is_published
    and p.seuil <= max_seuil
    and st_dwithin(p.location, origin.g, max_meters)
  order by st_distance(p.location, origin.g), p.editorial_order
  limit least(greatest(result_limit, 1), 50);
$$;

grant execute on function public.nearby_passages(double precision, double precision, smallint, double precision, integer)
  to anon, authenticated;
