import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Coordinates, Trace, TraceObservation } from '../domain/types';
import { track } from '../lib/analytics';
import { createId, estimateSteps, shouldAppendFix } from '../lib/derive';
import { pathDistanceMeters } from '../lib/geo';

export type DeriveState =
  | { stage: 'idle' }
  | {
      stage: 'drifting';
      startedAt: number;
      path: Coordinates[];
      observations: TraceObservation[];
      gps: 'tracking' | 'unavailable';
    }
  /** Finished but not yet saved: the unsaved walk state. */
  | { stage: 'review'; trace: Trace };

type Options = {
  locationGranted: boolean;
  lastKnown: Coordinates | null;
};

/** Foreground Dérive. Background tracking and Supabase persistence are later phases. */
export function useDerive({ locationGranted, lastKnown }: Options) {
  const [state, setState] = useState<DeriveState>({ stage: 'idle' });
  const [now, setNow] = useState(Date.now());
  const watcher = useRef<Location.LocationSubscription | null>(null);
  const drifting = state.stage === 'drifting';

  useEffect(() => {
    if (!drifting) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [drifting]);

  useEffect(() => {
    if (!drifting || !locationGranted) return;
    let cancelled = false;
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 5, timeInterval: 3000 },
      (position) => {
        const next = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setState((current) => {
          if (current.stage !== 'drifting') return current;
          if (!shouldAppendFix(current.path.at(-1), next, position.coords.accuracy)) return current;
          return { ...current, gps: 'tracking', path: [...current.path, next] };
        });
      },
    )
      .then((subscription) => {
        if (cancelled) subscription.remove();
        else watcher.current = subscription;
      })
      .catch(() =>
        setState((current) => (current.stage === 'drifting' ? { ...current, gps: 'unavailable' } : current)),
      );
    return () => {
      cancelled = true;
      watcher.current?.remove();
      watcher.current = null;
    };
  }, [drifting, locationGranted]);

  const start = useCallback(() => {
    const startedAt = Date.now();
    setNow(startedAt);
    setState({
      stage: 'drifting',
      startedAt,
      path: lastKnown ? [lastKnown] : [],
      observations: [],
      gps: locationGranted ? 'tracking' : 'unavailable',
    });
    track({ name: 'derive_started', hasLocation: locationGranted });
  }, [lastKnown, locationGranted]);

  const addObservation = useCallback(
    (observation: { kind: 'text'; text: string } | { kind: 'photo'; uri: string }) => {
      setState((current) => {
        if (current.stage !== 'drifting') return current;
        const base = { id: createId('obs'), recordedAt: Date.now(), at: current.path.at(-1) ?? null };
        const entry: TraceObservation =
          observation.kind === 'text'
            ? { ...base, kind: 'text', text: observation.text }
            : { ...base, kind: 'photo', uri: observation.uri };
        return { ...current, observations: [...current.observations, entry] };
      });
      track({ name: 'derive_observation_added', kind: observation.kind });
    },
    [],
  );

  const finish = useCallback(() => {
    if (state.stage !== 'drifting') return;
    const endedAt = Date.now();
    const distanceMeters = pathDistanceMeters(state.path);
    const durationSeconds = Math.round((endedAt - state.startedAt) / 1000);
    track({
      name: 'derive_finished',
      durationSeconds,
      distanceMeters: Math.round(distanceMeters),
      observationCount: state.observations.length,
    });
    setState({
      stage: 'review',
      trace: {
        id: createId('trace'),
        startedAt: state.startedAt,
        endedAt,
        durationSeconds,
        distanceMeters,
        stepEstimate: estimateSteps(distanceMeters),
        path: state.path,
        observations: state.observations,
      },
    });
  }, [state]);

  const discard = useCallback(() => {
    if (state.stage !== 'idle') track({ name: 'derive_discarded', stage: state.stage });
    setState({ stage: 'idle' });
  }, [state.stage]);

  /** Returns the Tracé to archive and resets to idle. */
  const save = useCallback((): Trace | null => {
    if (state.stage !== 'review') return null;
    track({ name: 'trace_saved', traceId: state.trace.id });
    setState({ stage: 'idle' });
    return state.trace;
  }, [state]);

  const elapsedSeconds = state.stage === 'drifting' ? Math.max(0, (now - state.startedAt) / 1000) : 0;
  const liveDistance = state.stage === 'drifting' ? pathDistanceMeters(state.path) : 0;

  return { state, elapsedSeconds, liveDistance, start, addObservation, finish, discard, save };
}
