# Event Taxonomy — 커리어 판

Typed in `src/lib/analytics.ts`. On-device only in Phase 1. Events never include answer text, own-written text, or station names.

| Event | When | Properties |
|---|---|---|
| `app_opened` | App shell mounts | — |
| `tab_changed` | Tab selected | `tab` |
| `passage_marker_selected` | Passage dot tapped on the map | `passageId` |
| `passage_card_viewed` | Card shown in 발견 | `passageId`, `position` |
| `passage_detail_opened` | Passage sheet opened | `passageId`, `source` |
| `passage_save_toggled` | 나의 길에 담기 toggled | `passageId`, `saved` |
| `reflection_started` | 시작하기 | — |
| `reflection_step_completed` | A question answered | `step`, `selectedCount`, `usedOwn` |
| `reflection_finished` | Result letter shown | `stationCount`, `threadCount` |
| `trace_saved` | 나의 길에 남기기 | `traceId` |
| `reflection_discarded` | Stopped or result not kept | `step` (8 = result) |
