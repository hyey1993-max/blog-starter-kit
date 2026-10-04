import type { Coordinates } from '../domain/types';
import { haversineMeters } from './geo';

/** Average adult stride; the step count is an estimate, never a measurement. */
const STRIDE_METERS = 0.7;
/** Ignore fixes worse than this; they draw jagged false Tracé lines. */
export const MAX_ACCURACY_METERS = 40;
/** Ignore jitter shorter than this while standing still. */
const MIN_SEGMENT_METERS = 3;

export function estimateSteps(distanceMeters: number): number {
  return Math.round(distanceMeters / STRIDE_METERS);
}

/** Returns true when a new GPS fix should extend the Tracé. */
export function shouldAppendFix(
  last: Coordinates | undefined,
  next: Coordinates,
  accuracyMeters: number | null,
): boolean {
  if (accuracyMeters !== null && accuracyMeters > MAX_ACCURACY_METERS) return false;
  if (!last) return true;
  return haversineMeters(last, next) >= MIN_SEGMENT_METERS;
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
