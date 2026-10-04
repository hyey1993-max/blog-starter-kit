import type { Coordinates, Passage, PassageWithDistance } from '../domain/types';

const EARTH_RADIUS_METERS = 6_371_000;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Haversine straight-line distance in meters. No paid distance API. */
export function haversineMeters(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Proximity ordering when the location is known; otherwise the curated
 * (editorial) order is preserved. Never popularity.
 */
export function orderPassages(passages: Passage[], origin: Coordinates | null): PassageWithDistance[] {
  const withDistance = passages.map((passage) => ({
    ...passage,
    distanceMeters: origin ? haversineMeters(origin, passage.coordinates) : null,
  }));
  if (!origin) return withDistance;
  return withDistance.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
}

export function pathDistanceMeters(path: Coordinates[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i += 1) {
    total += haversineMeters(path[i - 1]!, path[i]!);
  }
  return total;
}

export function formatDistance(meters: number | null): string {
  if (meters === null) return '거리 알 수 없음';
  if (meters < 1000) return `${Math.round(meters / 10) * 10}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/** Straight-line walking estimate at ~4.5km/h, labelled as an estimate in UI. */
export function walkingMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / 75));
}
