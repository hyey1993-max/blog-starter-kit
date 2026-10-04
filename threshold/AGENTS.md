# THE THRESHOLD

## Project

THE THRESHOLD is a human-curated place discovery product. It helps people rediscover places through observation, contextual language, and personal judgment instead of declaring which place is best.

## Source of truth

Before product or architecture decisions, consult the relevant files:

- `docs/product/PRD.md`
- `docs/product/principles.md`
- `docs/product/user-flows.md`
- `docs/product/ubiquitous-language.md`
- `docs/design/visual-system.md`
- `docs/design/interaction-principles.md`
- `docs/design/map-principles.md`
- `docs/architecture/architecture.md`
- `docs/architecture/data-model.md`
- `docs/architecture/api-contracts.md`
- `docs/analytics/event-taxonomy.md`

Keep detailed product knowledge in `docs/`, not in this file.

## Core principles

1. Human observation over algorithmic authority.
2. Context over administrative geography.
3. User agency over recommendation.
4. Editorial meaning over engagement optimization.
5. Spatial experience over information density.
6. Progressive disclosure over overload.
7. A place is a lived context, not merely a coordinate.

## Ubiquitous language

Use `Flaneur`, `Passage`, `Seuil`, `Zone`, `Surroundings`, `Derive`, `Trace`, and `Archive` in code identifiers (ASCII spelling) and their accented display forms where appropriate. Do not introduce generic `User`, `Post`, `Item`, or `Place` domain models. Consult `docs/product/ubiquitous-language.md`.

## Forbidden defaults

Do not add without explicit product justification: popularity or engagement ranking, best-place labels, prominent ratings or follower counts, infinite recommendation feeds, opaque AI recommendations, unnecessary filters, or AI-written first-person curator experiences.

## AI policy

AI may interpret language, normalize metadata, find semantic similarity, and assist discovery. It must not replace human curation, fabricate place facts or experiences, silently rank by opaque criteria, or overwrite the curator's voice.

## Development rules

- Prefer simple, typed, accessible, testable, composable implementation.
- Avoid premature abstraction, speculative infrastructure, vector search, and Phase 1 over-engineering.
- Preserve the current Expo/React Native architecture unless a migration is explicitly approved.
- The in-product map is a quiet spatial canvas; external map apps provide navigation.
- When requirements conflict with product principles, explain the conflict and propose the smallest coherent alternative.

## Completion bar

- Typecheck passes.
- Relevant tests and lint pass when configured.
- Mobile, accessibility, loading, empty, and error behavior are considered.
- Meaningful actions have documented analytics events.
- User-critical flows are manually or automatically verified.

## Workflow

For substantial work: inspect relevant docs and architecture, state material assumptions, implement the smallest coherent change, validate it, review it against product principles, and report remaining risks. Do not rewrite large portions without justification.
