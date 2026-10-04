import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import type { FlaneurLocation } from '../hooks/useFlaneurLocation';
import { colors, fonts, space } from '../theme';
import { Button } from './Button';

type Props = { location: FlaneurLocation; onRetry: () => void };

/** One quiet contextual cue about location; renders nothing when all is well. */
export function LocationNotice({ location, onRetry }: Props) {
  if (location.status === 'granted' && location.coords) return null;

  let message: string;
  let action: { label: string; onPress: () => void } | null = null;

  switch (location.status) {
    case 'requesting':
      message = '현재 위치를 확인하는 중이에요.';
      break;
    case 'granted':
      message = '위치 신호를 기다리는 중이에요. 그동안 큐레이션 순서로 보여드려요.';
      break;
    case 'denied':
      message = '위치 없이 둘러보는 중이에요. Passage는 큐레이션 순서로 보여요.';
      action =
        location.canAskAgain || Platform.OS === 'web'
          ? { label: '위치 허용', onPress: onRetry }
          : { label: '설정 열기', onPress: () => void Linking.openSettings() };
      break;
    case 'error':
      message = '위치를 확인하지 못했어요. 위치 없이 계속 둘러볼 수 있어요.';
      action = { label: '다시 시도', onPress: onRetry };
      break;
  }

  return (
    <View style={styles.notice} accessibilityRole="summary" accessibilityLiveRegion="polite">
      <Text style={styles.text}>{message}</Text>
      {action && <Button label={action.label} onPress={action.onPress} variant="quiet" />}
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingLeft: space.md,
    paddingVertical: space.xs,
    backgroundColor: colors.paperDeep,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  text: { flex: 1, fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.inkSoft },
});
