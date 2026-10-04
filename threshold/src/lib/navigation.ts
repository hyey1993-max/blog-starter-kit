import { Linking, Platform } from 'react-native';
import type { Coordinates } from '../domain/types';

export type MapProvider = 'naver' | 'kakao';

export type NavigationTarget = {
  name: string;
  destination: Coordinates;
  origin?: Coordinates | null;
};

const APP_NAME = 'com.threshold.app';

export const providerLabels: Record<MapProvider, string> = {
  naver: '네이버 지도',
  kakao: '카카오맵',
};

export function appUrl(provider: MapProvider, target: NavigationTarget): string {
  const { latitude: dlat, longitude: dlng } = target.destination;
  const name = encodeURIComponent(target.name);
  if (provider === 'naver') {
    const origin = target.origin
      ? `&slat=${target.origin.latitude}&slng=${target.origin.longitude}&sname=${encodeURIComponent('현재 위치')}`
      : '';
    return `nmap://route/walk?dlat=${dlat}&dlng=${dlng}&dname=${name}${origin}&appname=${APP_NAME}`;
  }
  const origin = target.origin ? `&sp=${target.origin.latitude},${target.origin.longitude}` : '';
  return `kakaomap://route?ep=${dlat},${dlng}${origin}&by=FOOT`;
}

export function webUrl(provider: MapProvider, target: NavigationTarget): string {
  const { latitude, longitude } = target.destination;
  const name = encodeURIComponent(target.name);
  if (provider === 'naver') {
    return `https://map.naver.com/p/directions/-/${longitude},${latitude},${name}/-/walk`;
  }
  return `https://map.kakao.com/link/to/${name},${latitude},${longitude}`;
}

export function storeUrl(provider: MapProvider): string {
  if (Platform.OS === 'ios') {
    return provider === 'naver'
      ? 'https://apps.apple.com/kr/app/id311867728'
      : 'https://apps.apple.com/kr/app/id304608425';
  }
  return provider === 'naver'
    ? 'https://play.google.com/store/apps/details?id=com.nhn.android.nmap'
    : 'https://play.google.com/store/apps/details?id=net.daum.android.map';
}

/**
 * Tries the native app deep link. Resolves false when the app is unavailable
 * so the caller can offer a web/store fallback. THE THRESHOLD never renders routes.
 */
export async function openInMapApp(provider: MapProvider, target: NavigationTarget): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    await Linking.openURL(appUrl(provider, target));
    return true;
  } catch {
    return false;
  }
}

export async function openExternal(url: string): Promise<boolean> {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
