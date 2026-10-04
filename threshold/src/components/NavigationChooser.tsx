import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import type { Coordinates, Passage } from '../domain/types';
import { track } from '../lib/analytics';
import {
  openExternal,
  openInMapApp,
  providerLabels,
  storeUrl,
  webUrl,
  type MapProvider,
} from '../lib/navigation';
import { colors, fonts, space } from '../theme';
import { Button } from './Button';
import { Sheet } from './Sheet';

type Props = {
  passage: Passage | null;
  origin: Coordinates | null;
  onClose: () => void;
};

/** Hands navigation to Naver Map or KakaoMap. THE THRESHOLD does not render routes. */
export function NavigationChooser({ passage, origin, onClose }: Props) {
  const [unavailable, setUnavailable] = useState<MapProvider | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setUnavailable(null);
    setFailed(false);
  }, [passage?.id]);

  if (!passage) return null;
  const target = { name: passage.name, destination: passage.coordinates, origin };

  const choose = async (provider: MapProvider) => {
    setFailed(false);
    if (await openInMapApp(provider, target)) {
      track({ name: 'navigation_handoff', passageId: passage.id, provider, result: 'app' });
      onClose();
      return;
    }
    if (Platform.OS === 'web') {
      await fallback(provider, 'web');
      return;
    }
    setUnavailable(provider);
  };

  const fallback = async (provider: MapProvider, kind: 'web' | 'store') => {
    const opened = await openExternal(kind === 'web' ? webUrl(provider, target) : storeUrl(provider));
    track({ name: 'navigation_handoff', passageId: passage.id, provider, result: opened ? kind : 'failed' });
    if (opened) onClose();
    else setFailed(true);
  };

  return (
    <Sheet visible onClose={onClose} title="어느 지도로 갈까요?">
      <Text style={styles.body}>
        {passage.name}까지의 길은 선택한 지도 앱이 안내해요. THE THRESHOLD는 경로를 그리지 않아요.
      </Text>
      {unavailable ? (
        <View style={styles.group} accessibilityLiveRegion="polite">
          <Text style={styles.body}>{providerLabels[unavailable]} 앱을 열 수 없어요.</Text>
          <Button label="웹에서 열기" onPress={() => void fallback(unavailable, 'web')} />
          <Button label="앱 설치하기" variant="secondary" onPress={() => void fallback(unavailable, 'store')} />
          <Button label="다른 지도 고르기" variant="quiet" onPress={() => setUnavailable(null)} />
        </View>
      ) : (
        <View style={styles.group}>
          <Button label={providerLabels.naver} variant="secondary" onPress={() => void choose('naver')} />
          <Button label={providerLabels.kakao} variant="secondary" onPress={() => void choose('kakao')} />
        </View>
      )}
      {failed && (
        <Text style={styles.error} accessibilityRole="alert">
          링크를 열지 못했어요. 잠시 후 다시 시도해 주세요.
        </Text>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 23, color: colors.inkSoft, marginBottom: space.md },
  group: { gap: space.sm },
  error: { fontFamily: fonts.sans, fontSize: 14, color: colors.flaneur, marginTop: space.md },
});
