import { Image, StyleSheet, Text, View } from 'react-native';
import type { TraceObservation } from '../domain/types';
import { colors, fonts, space } from '../theme';

const time = (ms: number) =>
  new Date(ms).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

export function ObservationList({ observations }: { observations: TraceObservation[] }) {
  if (observations.length === 0) {
    return <Text style={styles.empty}>아직 남긴 관찰이 없어요.</Text>;
  }
  return (
    <View style={styles.list}>
      {observations.map((o) => (
        <View key={o.id} style={styles.item}>
          <Text style={styles.time}>{time(o.recordedAt)}</Text>
          {o.kind === 'text' ? (
            <Text style={styles.text}>{o.text}</Text>
          ) : (
            <Image
              source={{ uri: o.uri }}
              style={styles.photo}
              accessible
              accessibilityLabel={`${time(o.recordedAt)}에 기록한 사진`}
            />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.md },
  item: { gap: space.xs },
  time: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  text: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 25, color: colors.ink },
  photo: { width: '100%', aspectRatio: 4 / 3, backgroundColor: colors.paperDeep },
  empty: { fontFamily: fonts.sans, fontSize: 14, color: colors.muted },
});
