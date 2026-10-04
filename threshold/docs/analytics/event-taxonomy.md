# Event Taxonomy

Typed in `src/lib/analytics.ts`. Phase 1 keeps events on-device (dev console and an in-memory buffer); no sink is connected until this taxonomy is approved. Events never carry coordinates, observation text, or photo URIs.

| Event | When | Properties |
|---|---|---|
| `app_opened` | App shell mounts | — |
| `tab_changed` | Tab selected | `tab`: `derive` \| `map` \| `archive` \| `trace` |
| `location_permission_resolved` | Foreground permission answered | `status`: `granted` \| `denied` \| `error` |
| `passage_marker_selected` | Passage marker tapped on the map | `passageId` |
| `passage_card_viewed` | A Passage card is shown in DISCOVER | `passageId`, `position` |
| `passage_detail_opened` | Passage interpretation sheet opened | `passageId`, `source`: `map` \| `archive` \| `trace` |
| `passage_save_toggled` | Save toggled in detail | `passageId`, `saved` |
| `navigation_chooser_opened` | 길 찾기 tapped | `passageId` |
| `navigation_handoff` | External map opened or failed | `passageId`, `provider`: `naver` \| `kakao`, `result`: `app` \| `web` \| `store` \| `failed` |
| `derive_started` | Dérive started | `hasLocation` |
| `derive_observation_added` | Photo or text observation recorded | `kind`: `text` \| `photo` |
| `derive_finished` | Dérive finished, Tracé in review | `durationSeconds`, `distanceMeters`, `observationCount` |
| `trace_saved` | Tracé archived | `traceId` |
| `derive_discarded` | Dérive or unsaved Tracé discarded | `stage`: `drifting` \| `review` |

Funnel mapping (PRD success signals): context engagement (`passage_card_viewed`, `passage_marker_selected`) → meaningful place view (`passage_detail_opened`) → save (`passage_save_toggled`) → curation (not yet instrumented) → return discovery.
