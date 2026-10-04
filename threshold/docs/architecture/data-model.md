# Data Model

## Core entities

- `flaneurs`: public identity linked to Supabase Auth.
- `passages`: coordinates, practical metadata, human narrative, accessibility and Seuil.
- `passage_images`: ordered images and alt text.
- `context_tags` and `passage_context_tags`: normalized contextual language.
- `curations` and `curation_passages`: collections using a join table with order and curator note.
- `saved_passages`: Flâneur save, optional destination curation, and note.
- `curation_follows`: follow relation without making counts visually authoritative.
- `passage_interactions`: typed behavioral record with JSON metadata.
- `traces` and `trace_observations`: the archived Tracé produced by a Dérive and its observations.

Do not store place lists as array columns on curations. Use join tables so order, notes, constraints, and permissions remain explicit.

Migrations `001` and `002` preserve the original prototype history. `003_ubiquitous_language.sql` renames the live schema to the domain language.
