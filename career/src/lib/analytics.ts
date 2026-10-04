/**
 * Typed analytics events. See docs/analytics/event-taxonomy.md.
 * On-device only in Phase 1. Events never carry answer text or stations.
 */
export type AnalyticsEvent =
  | { name: 'app_opened' }
  | { name: 'tab_changed'; tab: 'derive' | 'map' | 'archive' | 'trace' }
  | { name: 'passage_marker_selected'; passageId: string }
  | { name: 'passage_card_viewed'; passageId: string; position: number }
  | { name: 'passage_detail_opened'; passageId: string; source: 'map' | 'archive' | 'trace' }
  | { name: 'passage_save_toggled'; passageId: string; saved: boolean }
  | { name: 'reflection_started' }
  | { name: 'reflection_step_completed'; step: number; selectedCount: number; usedOwn: boolean }
  | { name: 'reflection_finished'; stationCount: number; threadCount: number }
  | { name: 'trace_saved'; traceId: string }
  | { name: 'reflection_discarded'; step: number };

const buffer: (AnalyticsEvent & { at: number })[] = [];

export function track(event: AnalyticsEvent): void {
  buffer.push({ ...event, at: Date.now() });
  if (buffer.length > 200) buffer.shift();
  if (__DEV__) console.log('[analytics]', event);
}

export const createId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
