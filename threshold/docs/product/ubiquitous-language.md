# Ubiquitous Language

Use these terms consistently in domain types, variables, components, database tables, API contracts, and product discussion.

| Term | Meaning | Avoid |
|---|---|---|
| Flâneur | A person who observes the city | user |
| Passage | A recorded place or moment | post, item, place record |
| Seuil | A threshold or transition boundary | generic threshold when domain-specific |
| Zone | A spatial area | generic region when domain-specific |
| Surroundings | Nearby contextual discovery | nearby feed |
| Dérive | The act of drifting and observing | walk session, explore mode |
| Tracé | The archived trace produced by a Dérive | history, activity log |
| Archive | The shared body of Passages | global feed |

Technical platform concepts may retain their standard names where changing them would reduce clarity: Supabase Auth, coordinates, map provider, database policy, and UI accessibility roles.

The visible tab labels continue to follow the approved Figma design (`WALK`, `MAP`, `DISCOVER`, `MY`) until a separate copy/design decision is approved. Their internal domain states are `derive`, `map`, `archive`, and `trace`.
