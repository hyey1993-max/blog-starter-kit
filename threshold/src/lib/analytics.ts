/**
 * Typed analytics events. See docs/analytics/event-taxonomy.md.
 * Phase 1 keeps events on-device (dev console + in-memory buffer); a sink is
 * connected only after the event taxonomy is approved.
 */
export type AnalyticsEvent =
  | { name: 'app_opened' }
  | { name: 'tab_changed'; tab: 'derive' | 'map' | 'archive' | 'trace' }
  | { name: 'location_permission_resolved'; status: 'granted' | 'denied' | 'error' }
  | { name: 'passage_marker_selected'; passageId: string }
  | { name: 'passage_card_viewed'; passageId: string; position: number }
  | { name: 'passage_detail_opened'; passageId: string; source: 'map' | 'archive' | 'trace' }
  | { name: 'passage_save_toggled'; passageId: string; saved: boolean }
  | { name: 'navigation_chooser_opened'; passageId: string }
  | {
      name: 'navigation_handoff';
      passageId: string;
      provider: 'naver' | 'kakao';
      result: 'app' | 'web' | 'store' | 'failed';
    }
  | { name: 'derive_started'; hasLocation: boolean }
  | { name: 'derive_observation_added'; kind: 'text' | 'photo' }
  | { name: 'derive_finished'; durationSeconds: number; distanceMeters: number; observationCount: number }
  | { name: 'trace_saved'; traceId: string }
  | { name: 'derive_discarded'; stage: 'drifting' | 'review' };

const buffer: (AnalyticsEvent & { at: number })[] = [];

export function track(event: AnalyticsEvent): void {
  buffer.push({ ...event, at: Date.now() });
  if (buffer.length > 200) buffer.shift();
  if (__DEV__) console.log('[analytics]', event);
}

export function recentEvents(): readonly (AnalyticsEvent & { at: number })[] {
  return buffer;
}
