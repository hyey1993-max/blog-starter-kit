import { StyleSheet, Text, View } from 'react-native';
import type { Trace } from '../domain/types';
import { formatDuration } from '../lib/derive';
import { formatDistance } from '../lib/geo';
import { colors, fonts, space } from '../theme';

export function TraceStats({ durationSeconds, distanceMeters, steps, hasPath }: {
  durationSeconds: number;
  distanceMeters: number;
  steps: number;
  hasPath: boolean;
}) {
  const items = [
    { label: '경과 시간', value: formatDuration(durationSeconds) },
    { label: '거리 (추정)', value: hasPath ? formatDistance(distanceMeters) : '—' },
    { label: '걸음 (추정)', value: hasPath ? steps.toLocaleString('ko-KR') : '—' },
  ];
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.label} style={styles.stat} accessible accessibilityLabel={`${item.label} ${item.value}`}>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function traceTitle(trace: Trace): string {
  return new Date(trace.startedAt).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md },
  stat: { flex: 1 },
  value: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink },
  label: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, marginTop: 2 },
});
