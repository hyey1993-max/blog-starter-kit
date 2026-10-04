# Architecture

## Current Phase 1 stack

- Expo 57, React Native, React 19, TypeScript.
- `expo-location` for foreground coordinates.
- Local typed sample data during prototype development.
- Supabase/PostGIS schema for persistence and server-side proximity queries.
- Leaflet on Expo Web with an environment-configurable raster tile URL.
- Owned Figma map assets as the Expo Go/native fallback until a custom native map build is justified.
- Naver Map/KakaoMap deep links for route handoff.

## Boundaries

UI depends on domain types and small library functions. Supabase is the persistence boundary; map providers are navigation utilities. Never expose a service-role key in the app. Row Level Security is required for user-owned data.

The default OpenStreetMap tile endpoint is for development only. Production must use owned or contracted tiles (target: PMTiles-derived tiles on Cloudflare R2), preserve attribution, prohibit bulk prefetch, and allow the tile URL to change without an app release.

## Phase 1 exclusions

No vector database, embeddings, personalized AI recommendations, popularity ranking, ratings, or speculative microservices.

## Phase 2 candidates

LLM-assisted language normalization, embeddings, semantic retrieval, and taste representation may be evaluated only after the human-curation hypothesis is measured. AI amplifies curation; it does not replace it.
