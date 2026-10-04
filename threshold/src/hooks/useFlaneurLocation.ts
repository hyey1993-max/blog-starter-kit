import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Coordinates } from '../domain/types';
import { track } from '../lib/analytics';

export type FlaneurLocation =
  | { status: 'requesting' }
  | { status: 'granted'; coords: Coordinates | null }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'error'; message: string };

/** Foreground-only location. Denial is a supported, first-class state. */
export function useFlaneurLocation() {
  const [location, setLocation] = useState<FlaneurLocation>({ status: 'requesting' });
  const subscription = useRef<Location.LocationSubscription | null>(null);

  const request = useCallback(async () => {
    setLocation({ status: 'requesting' });
    subscription.current?.remove();
    subscription.current = null;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        track({ name: 'location_permission_resolved', status: 'denied' });
        setLocation({ status: 'denied', canAskAgain: permission.canAskAgain });
        return;
      }
      track({ name: 'location_permission_resolved', status: 'granted' });
      setLocation({ status: 'granted', coords: null });
      subscription.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 15 },
        (position) =>
          setLocation({
            status: 'granted',
            coords: { latitude: position.coords.latitude, longitude: position.coords.longitude },
          }),
      );
    } catch (error) {
      track({ name: 'location_permission_resolved', status: 'error' });
      setLocation({
        status: 'error',
        message: error instanceof Error ? error.message : '위치를 확인하지 못했어요.',
      });
    }
  }, []);

  useEffect(() => {
    void request();
    return () => subscription.current?.remove();
  }, [request]);

  const coords = location.status === 'granted' ? location.coords : null;
  return { location, coords, retry: request };
}
